# Deterministic affordability engine v1

Status: proposed policy awaiting approval. This is a planning tool, not payment authorization or a guarantee of future funds. Manual data can omit real obligations. No statistical inference, credit advice, interest, investment returns or AI. A pure TypeScript module must run without React, native APIs, Supabase or network access.

## Policy

Reward purchases use money remaining **after** protecting the rest of the current month's ordinary budget, pooled goal allocations, emergency reserve, and safety buffer. Future income is never treated as money available now. The wishlist is a strict sequential purchase queue: an inexpensive lower item cannot jump ahead just because it fits. Reordering is an explicit user decision.

Ordinary monthly budgets cover living costs and an unplanned allowance. Reward categories (for example electronics or hobbies on the wishlist) track extra optional spending separately and do not draw down ordinary budget reserves. This is essential: recording a reward purchase must reduce reward headroom, not release an equal amount of ordinary budget and enable repeated purchases. No separate stored reward wallet or points balance. Categorizing an ordinary expense as a reward changes protected funds differently; explain category roles and show both in overall spending reports. No category may simultaneously be ordinary and reward.

## Contract

`evaluateAffordability(snapshot, asOfDate, policy)` returns results and a calculation breakdown; inputs are immutable validated DTOs. Monetary DTO fields are decimal strings at API boundary, parsed to `bigint` cents in domain. Accept no fractional cents, exponential notation, NaN, Infinity or unchecked JS number conversion. Ratios use exact integer basis points; output money serializes to strings. The clock, timezone, engine version and horizon are explicit, so identical inputs yield identical outputs.

| Input | Required content |
|---|---|
| Snapshot metadata | User currency, server capture time, financial revision, caller-supplied local as-of date |
| Actual accounts | Active liquid checking/savings balances from posted ledger, including negatives |
| Current plan | All ordinary category budget limits and net posted ordinary spend for local current month, including archived historical categories |
| Goals | Current virtual allocations, targets and explicit monthly contribution intentions |
| Protected settings | Emergency reserve E, additional buffer B, completed onboarding and plan confirmation time |
| Forecast | Confirmed monthly net income I, full ordinary expenses X, monthly savings commitments G; nullable until entered |
| Queue | Unique active IDs/positions, strictly positive prices, priorities, categories, optional target dates; purchased/archived excluded |
| Policy | Version v1, 7-day plan confirmation validity, 5-minute live snapshot validity, 24 monthly forecast steps |

Freshness thresholds are proposed product decisions, not hidden constants. User must confirm that all balances/expenses have been recorded, all remaining monthly obligations are budgeted, and forecast inputs are intentional. Merely fetching the database again does not renew plan confirmation. Any month rollover, new unbudgeted category, or material planning change clears confirmation. A snapshot older than 5 minutes must be refreshed before an actionable unlock, even with a confirmed plan. Record actual purchases whether fresh/unlocked or not.

| Output | Meaning |
|---|---|
| status | `unlocked`, `upcoming`, `locked` |
| reasonCodes | Missing/stale plan, insufficient funds, queue ahead, reserve deficit, no surplus, outside horizon, invalid input |
| breakdown | Actual L, protected R/A/E/B, signed headroom H, usable D, queue-ahead Q, required total, shortfall, category overspends |
| progressBps | Item-specific currently funded proportion, 0..10000, not an account or goal allocation |
| projection | Nullable estimated month-end, months, modeled surplus F, queue assumptions, forecast horizon |
| provenance | Snapshot revision/time, plan confirmation time, policy version and explicit assumptions |

Invalid structural inputs return a typed validation failure plus no actionable results; UI displays unavailable/Locked with reason, never a fabricated zero-balance estimate. Missing planning data is structurally valid and returns Locked with setup guidance. Do not expose raw validation exceptions as financial advice.

## Current headroom

All sums use exact cents. For ordinary category c:

```text
spent[c] = max(0, net ordinary expense debits after linked reversals this month)
remaining[c] = max(0, limit[c] - spent[c])
R = sum(remaining[c])
L = sum(actual active liquid account balances, including overdrafts)
A = sum(all live goal reservations)
H = L - R - A - E - B
D = max(0, H)
```

`R` protects each category separately; overspending groceries must not cancel rent reserve. Zero-budget categories with actual ordinary spending have no remaining reserve but show an overspend. Missing budget rows for active ordinary categories blocks all unlocks until reviewed. Reward-category spending is excluded from spent[c] and already reduces L through the ledger. Transfers never alter total L, ordinary spending or income. Allocations alter A only, not L. Forecasts never alter L.

Emergency reserve and buffer are additive, separate protected buckets. A goal labelled emergency fund is **additional** unless the user elects to use the reserve setting instead and releases that goal allocation. Prevent accidental double representation during onboarding; never silently deduplicate by goal name. Underfunded commitments produce signed negative H and explicit deficit `max(0,-H)`. A cannot be clipped away to make a reward appear affordable. A negative individual account balance shows a warning even if the total pool is positive; no account-level bill-timing guarantee is made.

For active item k sorted by queue position:

```text
Q[k] = sum(prices of every active item ahead of k)
T[k] = Q[k] + price[k]
funded[k] = min(price[k], max(0, D - Q[k]))
shortfall[k] = max(0, T[k] - H)
progressBps[k] = floor(10000 * funded[k] / price[k])
```

All prefix sums are exact. Reservation by Q is a simulation, never persisted money. Multiple rows may be Unlocked only if their cumulative prices fit H; this does not count the same dollars for each independently. A target date is a preference and never changes reserve policy or gives priority over the queue. Current target-date misses are labels, not guarantees or automatic reprioritization.

Unlocked iff plan/snapshot valid **and** `H >= T[k]`. Current account balance exceeding price alone is insufficient. An unlocked item can become locked when new spending, prices or priorities change. It is not a durable entitlement.

## Projection and statuses

Use one conservative user-confirmed steady monthly surplus, not a calendar cash-flow simulator:

```text
F = I - X - G
H[n] = H + n * F, for n=1..24
n[k] = smallest n where H[n] >= T[k]
```

`X` is the full future ordinary monthly spending plan, not remaining current-month R. Require X >= current total ordinary budget limits; otherwise future expenses are inconsistent. `G` must cover the sum of active goal monthly intentions. I/X/G may explicitly be zero; null is unknown. Assume emergency/buffer requirements unchanged, no additional purchases beyond queue prefixes, prices stable, goals retain their reserves, and G keeps being protected even after a goal hits target. This deliberately does not release completed-goal contributions or use interest. Users can revise assumptions after a real goal completion. Projections extend headroom without generating projected transactions or allocations.

Start growth at the **next** month-end; no partial current-month credit for unreceived income. `n=1` means last day of next month in user timezone. Do not claim this model predicts the date a paycheck arrives. Even if current ordinary reserve would expire earlier, the model carries it conservatively in H and uses net F only thereafter. This may delay estimates but avoids inventing detailed cash timing. UI says “Estimated by [month], assuming $F/month remains after expenses and savings,” with the underlying I/X/G and queue assumptions accessible.

1. Valid plan and H>=T: **Unlocked**, projection unnecessary.
2. Valid plan, insufficient H, known coherent forecast, F>0, reachable within 24 steps: **Upcoming**, estimated month-end and shortfall. Negative H must be recovered before funding queue prices.
3. Missing/stale inputs, F<=0 with insufficient headroom, inconsistent forecast, or beyond horizon: **Locked**, reason and no date. A stale snapshot never produces actionable Unlocked/Upcoming. A currently unlocked item does not need positive future surplus if its current monthly plan is complete.

“Locked” is a model result, not a prohibition on recording a purchase. No countdown implying certainty. Goals get separate progress `floor(10000*allocation/target)` and an optional estimated completion month using `ceil((target-allocation)/plannedMonthly)` with the same next-month-end convention. Only show goal estimates when the overall confirmed forecast supports all goal intentions and I-X>=G; otherwise show “No funded contribution plan.” Goal date estimates do not feed money back into reward calculations.

## Worked examples (USD)

### Laptop and competing purchases

L=$4,000, R=$1,200, A=$1,000, E=$1,000, B=$200. H=D=$600. Laptop first, price $1,500: currently funded $600, remaining $900, progress 40%. Forecast I=$4,000, X=$3,200, G=$500 gives F=$300. Need 3 steps, so Upcoming. As of November 16, 2026, estimate is February 28, 2027 (next month-end plus two additional months), explicitly conditional.

Headphones behind laptop cost $200: Q=$1,500, T=$1,700, item-specific current progress 0%, shortfall $1,100, 4 steps → March 31, 2027. Headphones cannot separately claim the same $600.

### High balance, constrained cash

L=$5,000, R=$2,500, A=$1,500, E=$1,000, B=$200 produces H=-$200. A $100 item is not unlocked. With no positive forecast it is Locked. With F=$100, it takes 3 steps to cover the $200 deficit plus price, not 1. Display commitments exceed current liquid funds by $200.

### Exact boundary and purchase recording

L=$2,000, R=$700, A=$500, E=$500, B=$100 gives H=$200. Queue $150 then $50: both Unlocked cumulatively. Record first purchase as a **reward expense** $150. L becomes $1,850; R and A unchanged, first item becomes purchased and leaves queue. New H=$50; second is still unlocked. Recording another $50 leaves H=$0; no extra funds were created. If paid $180 instead, second has only $20 progress and is not currently unlocked. Actual purchase recording is one atomic expense+wishlist command, not a separate balance decrement.

### Ordinary spending and overrun

Ordinary groceries limit $400, spend $300: R includes $100. Record $50 ordinary groceries: both L and R fall $50, so H unchanged. Record another $100: L falls $100 but R can fall only the remaining $50; H falls $50. Rent reserve in another category stays protected. Reward purchases never reduce this groceries reserve.

### Allocation, transfers and corrections

Allocate $100: L unchanged, A increases $100, H drops $100. Release $100: L unchanged, A drops $100, H rises $100. Transfer $250 checking→savings: two offsetting legs, L/A/H unchanged. Reversing an ordinary expense changes historical spend and account funds together; reversing a linked reward purchase restores funds and the wishlist item atomically. None produces income from thin air.

## Edge cases and product limits

Reject duplicate queue positions/IDs, zero or negative prices/targets, unsupported/mixed currencies, excessive monetary values, malformed date/timezone, future snapshot timestamps beyond small documented clock tolerance, and allocations beyond target. Negative balances are valid, not malformed. Require server capture time and server confirmation time; device clock is not authoritative for staleness. Crossing a month requires current-month budgets and reconfirmation. Imported duplicates/pending funds do not exist in MVP; later import reconciliation must preserve exact ledger semantics.

Reorder/price/category changes invalidate results. Re-fetch and compare financial_revision before presenting a record-purchase preview; on revision conflict refresh, show changed amounts and let the user confirm actual entry. No automatic spending, auto-allocation or notification triggered by an untrusted client status. A goal-funded purchase must atomically release its allocation with an expense; otherwise the app would continue protecting already-spent funds. Overspending is recorded and displayed candidly even when it violates protected commitments.

No precise recurring bill dates, overdraft fees, debt minimums, taxes, emergency suitability assessment or intra-month paycheck timing is modeled. The setup affirmation and visible formula make these limitations clear. Introduce a dated obligation schedule only in a later version with explicit overlap rules so bills are not counted both individually and inside budgets. Forecasts based on irregular income require deliberate conservative manual inputs; no automatic extrapolation from a few recorded deposits.

## Testing specification

Use Jest table-driven pure-domain tests with exact cents/string assertions and injected dates. Golden fixtures mirror every example. Boundary tests cover H exactly equal price/prefix, one cent under/over, zero surplus, negative surplus, negative H, no accounts/items/goals, zero explicit reserves, huge sums, malformed money, division rounding and first/last month days including leap years/DST/timezone changes. Test unknown vs zero forecast separately. Freshness at threshold, month rollover, incomplete budgets and incoherent X/G must suppress dates and unlocks.

Invariant/property-style tests: transfer leaves L/H unchanged; allocation changes only A/H; price increase cannot improve affordability; higher reserve/expense/goal commitment cannot improve a result; increasing available funds cannot worsen it; one reward purchase reduces H by actual price; lower queue items never receive headroom already assigned to predecessors; cumulative unlocked prices<=H; reversal restores exact prior totals; no input mutation; same input/version yields byte-equivalent serialized result. Simple deterministic generated fixtures suffice initially, without a property-testing dependency.

Integration tests compare SQL ledger/category aggregates against pure-domain fixtures, including reversal classification and transfer exclusion. Test owner-lock concurrency, revision conflicts, retry IDs and atomic purchase status updates. Component tests verify status+reason+assumptions, stale warning, accessible labels and absence of guaranteed language. Physical-device tests verify rendering/currency input and refresh after writes. No screenshots or mocked Supabase tests substitute for financial invariant and RLS tests.
