# Savora deterministic affordability engine v1

Approved policy revision 2026-11-19; design only, implementation in Phase 5. Supersedes the 2026-11-16 sequential wishlist/prefix model and category-level spending roles (see ADR-006/007). This is explainable planning, not payment authorization or guaranteed future funds. No AI, credit scoring, points or reward wallet.

## Product policy and contract

**Goals: save toward something important.** Explicitly allocated existing liquid funds are protected. **Rewards: enjoy what you can afford today.** Each reward independently compares its price to the same discretionary headroom. Order/priority controls display only. No arbitrary price threshold forces an objective into Goals or Rewards. A wishlist entry is a desire, not an expense or reservation.

`evaluateAffordability(snapshot, asOfDate, policy)` is pure TypeScript, without React/Supabase/native/network imports. Inputs are validated immutable data, explicit local date/timezone and server capture time/revision. API money is decimal strings; domain arithmetic uses bigint cents. Reject fractions, scientific notation, unchecked number conversions, NaN, mixed currencies and invalid IDs/dates. Monetary inputs have schema caps; exact sums may exceed JavaScript safe integers. Serialize results as decimal strings; bounded integer basis points for progress. Inject clock/policy for deterministic tests.

| Input       | Required content                                                                                          |
| ----------- | --------------------------------------------------------------------------------------------------------- |
| Accounts    | Signed liquid checking/savings asset balances, per-account balance_confirmed_at, currency USD             |
| Budgets     | Current local month category limits and budget-drawing ordinary expense totals after reversals            |
| Obligations | Current and overdue active occurrences, expected amount, paid amount, coverage, category and confirmation |
| Goals       | Current pooled reservations A, target/priority and planned monthly contributions                          |
| Settings    | Emergency reserve E, buffer B, reviewed month, plan_confirmed_at, onboarding completeness                 |
| Forecast    | Confirmed monthly net income I, ordinary future spending X, savings commitments G (null means unknown)    |
| Rewards     | Unique IDs, positive prices, display positions, optional dates/categories; purchased/archived excluded    |
| Policy      | Configurable confirmation age 7 days, cached snapshot age 5 minutes, forecast horizon 24 months, version  |

Outputs: status (`unlocked`, `upcoming`, `locked`) only with reliable required data; a separate reliability (`current`, `stale`, `incomplete`, `invalid`) controls whether a status may be presented confidently. With stale/incomplete data return no confident status/date (UI shows “Needs review” or “Estimate outdated,” not a usable unlock). Include reason codes, snapshot/confirmation timestamps and revision, exact breakdown L/R/O/A/E/B/H/D, per-item shortfall/progress, conditional projection and assumptions. Typed invalid-input failure contains no fabricated balances; show a safe unavailable state. App access/history and recording real purchases remain available irrespective of affordability reliability.

## Protect commitments without overlap

Expense **category** describes what; expense **operation spending_classification** is ordinary or reward. Same dining category may serve both. Income/transfers/opening/adjustments are not reward/ordinary purchases. Linked reversals inherit the original classification and settlement source to undo exactly.

For category c and each active obligation occurrence j:

```text
S[c] = max(0, net ordinary expense debits drawing on category budget this month)
       # excludes reward expenses and payments of separate-covered obligations
BR[c] = max(0, budget_limit[c] - S[c])
paid[j] = max(0, net linked ordinary payments after reversals, across dates)
U[j] = max(0, expected[j] - paid[j])
BO[c] = sum(U[j] for budget-covered current/overdue occurrences in category c)
R = sum(max(BR[c], BO[c]))
O = sum(U[j] for separately protected current/overdue occurrences)
L = sum(signed active liquid asset balances, including overdrafts)
A = sum(live goal reservations)
H = L - R - O - A - E - B
D = max(0, H)
```

Budget-covered obligations are inside budget protection, not added again: `max`, not sum. If unpaid bills exceed remaining budget, their excess is protected too, with a planning warning. Separately protected obligations add once through O; their payments decrease O and L, **not** ordinary category budget BR. Obligation coverage cannot also duplicate A/E/B: a loan minimum is an obligation, a future savings purchase is a goal; explicit review prevents duplicate representation. All active expense categories need an explicit budget row (zero may be intentional). Archived category history remains in calculations. Future months' bills are forecast assumptions, not immediate O; past unpaid bills carry forward until paid/waived.

Obligations support monthly manual templates, month-end clamping, estimated variable bills, explicit occurrence review, partial/multiple linked payments and waiver. Paying before due date/month is recognized by the occurrence link. Unlinked expenses do not automatically settle bills; request review/link correction. No debt ledger is needed for student-loan/car/credit-card minimum obligations. This month-level protection cannot guarantee exact timing or compensate for omitted bills/income.

Reward expenses, including spontaneous ones, reduce L and do not reduce R/O. Ordinary purchases reduce L and may release BR/O; their overspend reduces H. Transfers between liquid assets leave L/H unchanged. Goal funding changes A only; releasing changes A only, never L. Account corrections change L through ledger adjustments. Emergency reserve and buffer are separate additive protections; an emergency goal is additional unless explicitly released to use reserve setting instead. Negative H displays deficit `max(0,-H)`; never clip reservations to manufacture headroom. Future liability balances/credit limits do not enter L.

## Independent eligibility and projection

For each active item i, regardless of order:

```text
unlocked[i] = reliable current data AND H >= price[i]
shortfall[i] = max(0, price[i] - H)
progressBps[i] = floor(10000 * min(price[i], D) / price[i])
F = I - X - G
projectedHeadroom[n] = H + n * F, n=1..24
estimatedStep[i] = smallest n where projectedHeadroom[n] >= price[i]
```

Each row describes an **alternative**. Several unlocked prices can sum above D. Never sum row progress amounts into a funded total or say all unlocked items can be bought together. UI discloses “These rewards share the same available funds. Buying one changes what remains affordable.” A hypothetical bundle would require `sum(prices)<=H`; no bundle purchase feature in MVP. A $1,500 first item never blocks an $8 coffee.

Current valid data and H>=price: **Unlocked**. Otherwise coherent known forecast, F>0, and reachable in horizon: **Upcoming**, with conditional estimated month-end. Otherwise **Locked** with insufficient funds/no positive forecast/outside horizon reasons and no precise date. Missing/stale confirmation is a separate needs-review state, not proof of insufficient cash. An actual purchase is always recordable even if Locked, outdated or above estimated price. There is no reservation/authorization by viewing an unlock.

X covers a full future ordinary month, not current remainder. Require X at least the coverage-aware monthly plan: sum over categories of max(budget limit, monthly budget-covered template totals), plus separate template totals. No overlap with G; G must cover active goal contribution intentions. Missing X/I/G suppresses forecasts; explicit zero is distinct. Assume stable income/expenses/prices/reserves, no intervening discretionary purchases, continuing protected savings even after goal targets, and unchanged obligation schedule unless manually revised. Do not count future income as current L. No interest/FX or automatic trend extrapolation.

Growth starts at next month's **end**, no partial-current-month credit: from 2026-11-19, step 1 is 2026-12-31, step 3 is 2027-02-28. Existing protection is carried conservatively into H and then grows by net F; this is not a bill/paycheck calendar simulator. Label “Estimated by [month] if $F/month remains after expenses and savings; assumes no intervening reward spending.” Optional target dates do not override protection or order. Goals may extend beyond the 24-month reward horizon; show their progress/target date without invented precise completion dates. Goal contribution projections require coherent funded assumptions, never release their money into Rewards automatically.

## Freshness and recalculation

Each manually confirmed account has balance_confirmed_at; assumptions/obligations have confirmation times and a reviewed local month. Seven days is a provisional configurable policy, not an immutable rule. Use server time (not arbitrary device clock) for age comparisons. Re-fetching a snapshot does not confirm the underlying manually entered data. New-month review includes budgets, recurring occurrences and forecast assumptions. Users may continue using the app while stale; show timestamps/outdated warning, suppress confident current unlock/date until relevant data is reviewed.

Five-minute snapshot age is a maximum, not permission to reuse known-invalid data. Immediately invalidate on **any** eligibility-affecting write, before another unlock can render: account adjustment, transaction add/correction/reversal/reclassification, allocation/release/reallocation/completion, budget/bill/coverage/payment/waiver edits, reserve/forecast/confirmation or wishlist price changes. Wait for backend commit; no optimistic financial success. Refetch atomic snapshot, compare revision and recompute all items. Within five minutes, cross-device changes need detection: refresh on focus/reconnect and before purchase preview/save; revision conflict forces refresh. No offline authoritative unlocks or writes; last-known view is labelled. Fetch/error/loading states must not retain a confident obsolete unlock. Reorder only affects display, not numerical eligibility.

Financial edits/deletes are reversal/replacement commands, not overwritten/hard-deleted rows. Reclassification is one owner-locked transaction: reverse original with its old classification/obligation link, post replacement once with new classification, update/clear wishlist association as appropriate, increment revision. Overall spending counts net actual amount once. Reclassifying a paid obligation needs valid ordinary replacement/link or explicitly reopens the bill; reward cannot settle an obligation. Reclassifying linked wishlist reward to ordinary reopens item/clears purchase link, with confirmation; ordinary→reward can optionally complete an item atomically but need not have one. Reversing a purchase restores funds and item together. Do not incrementally add “reclassification credits”; recompute R/O/H from the resulting ledger.

## Worked examples (USD, exact cents internally)

Common baseline unless stated: L=$2,000; A=$500; E=$500; B=$100; R=$700; O=$0; H=D=$200. Dining ordinary limit=$300 and ordinary spend=$100, so its BR=$200 within R; other protected category remainders total $500. All confirmations current unless stated. These are separate scenarios, not one running balance.

| Scenario                         | L before→after | A before→after | R before→after |   O | H before→after | Explanation                                                      |
| -------------------------------- | -------------: | -------------: | -------------: | --: | -------------: | ---------------------------------------------------------------- |
| 1. Ordinary dining purchase $50  |    2,000→1,950 |        500→500 |        700→650 |   0 |        200→200 | Already protected budget is consumed; totals report $50 once     |
| 2. Wishlist reward dinner $100   |    2,000→1,900 |        500→500 |        700→700 |   0 |        200→100 | Actual reward does not release dining BR; item becomes purchased |
| 3. Spontaneous reward coffee $15 |    2,000→1,985 |        500→500 |        700→700 |   0 |        200→185 | Same category is allowed; no wishlist ID required                |
| 4. Allocate $100 to a goal       |    2,000→2,000 |        500→600 |        700→700 |   0 |        200→100 | Same real funds, protected by A; releasing reverses A/H only     |

5. **Multiple alternatives:** baseline $200 unlocks coffee $8, donuts $30, video game $60 and dinner $100 independently. Laptop $1,500 is Locked with no forecast, or Upcoming only with coherent positive forecast. Sum of unlocked prices need not fit $200; no dollars are reserved to individual rows. Priority/reorder cannot change these statuses. Goals typically hold larger long-term objectives; user may still choose laptop as a reward.

6. **Purchase then recalculate:** add $150 headphones to the baseline independent choices: Unlocked initially. Purchase $100 dinner: L=$1,900, A=$500, R=$700, O=0, E=$500, B=$100, H=$100. Headphones now not unlocked; coffee/donuts/game remain individually affordable alternatives. Purchase $60 game next: L=$1,840, H=$40; $100 dinner is no longer affordable if re-added. Wishlist estimated price never decrements cash separately; actual transaction is the sole expense. Different actual price uses that actual amount.

7. **Ordinary→reward reclassification:** after baseline's $50 ordinary dining purchase, L=$1,950, R=$650, H=$200. Atomically reverse/replace that $50 as reward. L stays $1,950, A=$500/O=0/E=$500/B=$100 unchanged, ordinary spend restores to $100, R=$700, H=$150. Total actual expense still $50, not $100; no cash created. Originally consuming ordinary protection cannot also qualify as a free reward.

8. **Reward→ordinary reclassification:** after baseline's $50 reward expense, L=$1,950, R=$700, H=$150. Replace as ordinary dining: L unchanged, R=$650, H=$200, A/O/E/B unchanged. This legitimate $50 reserve release consumes $50 of the pre-existing dining budget. Toggling back returns R=$700/H=$150, not $250. Above remaining category budget, only remaining reserve can release; any overspend still reduces H. Obligation protection may limit release further. Clear/reopen linked wishlist purchase on change to ordinary.

9. **Underfunded protections:** L=$1,000, A=$1,200, R=$300, O=$100, E=$200, B=$100 → H=-$900, D=0. Account funds cannot cover goals alone ($200 gap); total protected commitments exceed liquid assets by $900. Do not shrink A or invent funds. With F=$100 a $100 reward needs 10 monthly steps, not one, assuming recovery is actually feasible. Actual expenses remain recordable and worsen deficit; explicit release/reallocation/review is required.

10. **Stale information:** baseline amounts numerically yield H=$200, but one account confirmed 8 days ago makes reliability stale. Show last-known values and “Reconfirm balances,” no confident Unlocked/date; app remains accessible. A six-minute cached snapshot with current confirmations needs refetch. New $100 reward expense invalidates immediately even at one minute: after commit L=$1,900, H=$100; a $150 item must not retain its former unlock. Month rollover requires relevant plan/obligation review, not silent reuse.

### Obligation coverage examples

Budget-covered rent: budget limit=$1,000, spend=$0, unpaid rent=$1,000. Protect max(1,000,1,000)=$1,000, not $2,000. Paying $400 ordinary linked rent lowers L $400, BR to $600 and unpaid to $600; R falls $400 so H unchanged. If other ordinary spending used $300 before rent, BR=$700 but unpaid rent=$1,000: protect $1,000; do not free unpaid rent money by spending elsewhere.

Separate-covered $200 insurance with $300 budget remainder in the same category: R includes $300 and O includes $200. Paying $50 linked ordinary insurance reduces L $50 and O to $150; BR/R unchanged, H unchanged. A $50 reward in that category lowers L/H $50 and settles neither reserve. Overdue unpaid amounts stay protected; reversal of payment increases unpaid reserve and restores L together. No additional E/A reserve for the same insurance bill. Forecast X includes future insurance once, outside the budget coverage sum.

### Forecast example

L=$4,000, R=$1,200, O=0, A=$1,000, E=$1,000, B=$200 → H=$600. I=$4,000, X=$3,200 (includes all recurring costs once), G=$500 → F=$300. $1,500 laptop shortfall=$900 → 3 steps (February 28, 2027 from November 19); $200 headphones are independently Unlocked now regardless of laptop position. Buying $200 headphones lowers H to $400; laptop then needs 4 steps with the same assumptions. No promise that either date will occur.

## Testing specification for later phases

Golden fixtures cover all ten scenarios, obligation examples and forecast. Exact one-cent boundaries, zero/negative/unknown surplus, empty accounts/goals/rewards, explicit zero reserves versus missing values, budget overspend, partial/early/late payments, arrears, bill waiver/reversal, variable template revisions, missing budgets, month-end/DST/leap dates and >24-month goals. Test freshness at boundary, account-specific staleness, five-minute expiry, immediate mutation invalidation and cross-device revision conflict. No real financial data in fixtures.

Invariants: same snapshot/policy deterministic and immutable; transfer leaves L/H unchanged; allocation affects A not L; reward purchase reduces H by actual price; ordinary expense cannot free more than applicable protection; reclassification preserves actual L/total spend and round-trip returns same H; independent order invariance; unlocked means price<=H individually, **not** sum unlocked prices<=H; no persisted per-item claim; purchases/reversals occur once with optional wishlist linkage; liability/credit excluded; recurring overlap counted once. Raising protected reserves or price cannot improve affordability. Larger L cannot worsen a result. Missing data cannot appear affordable.

Integration tests compare SQL aggregates to domain fixtures with genuine RLS users, exact string serialization, operation idempotency/concurrency, atomic wishlist+expense changes and reversal classification/payment coverage. UI tests cover shared-funds disclosure, stale/loading/errors, explanation and conditional date language. Native/device tests verify refresh/input/accessibility. No financial engine is implemented in Phase 1.
