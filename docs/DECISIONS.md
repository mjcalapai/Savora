# Architectural decision log

Status: **accepted with owner revisions on 2026-11-19**. Original proposals dated 2026-11-16. History notes below preserve rejected choices; current decisions are authoritative. Phase 1 is authorized; later phases remain scoped to the roadmap. Savora is the working name, without trademark clearance.

## ADR-001 — Expo React Native with cloud iOS builds

**Decision:** TypeScript, React Native, Expo Router, EAS cloud build/submit, initially matching Expo Go then development builds.

**Alternatives:** native Swift app; Flutter; bare React Native; web wrapper.

**Rationale:** proposed stack supports WSL iteration, iPhone testing and hosted compilation while retaining Android potential.

**Tradeoffs:** Expo Go has a fixed native runtime; signed builds need Apple enrollment/credentials; cloud builds introduce service dependency and turnaround. Local iOS simulator and Swift debugging still require macOS/Xcode.

**Future:** native modules use Expo Modules; verify submission toolchain requirements each release. Sources: [development builds](https://docs.expo.dev/develop/development-builds/introduction/), [EAS iOS submit](https://docs.expo.dev/submit/ios/).

## ADR-002 — Stable dependency combination with explicit compatibility gate

**Decision:** prefer current stable Expo with stable NativeWind, npm lockfile and Expo-managed native peer versions; select SDK 58 with bundled stable peers. Owner explicitly approved React Native StyleSheet for Phase 1 on 2026-11-19; defer NativeWind until stable compatibility is established.

**Alternatives:** NativeWind prerelease; older SDK immediately; StyleSheet-only from start; installing latest React Native peers independently.

**Rationale:** Expo/npm identify SDK 58; stable NativeWind 4.2.7 explicitly documents SDK 57. An unsupported combination is avoided. Local compatibility checks are required; physical iPhone and signed-native results are recorded separately. Exact installed versions/evidence: [DEPENDENCIES.md](DEPENDENCIES.md).

**Tradeoffs:** small up-front spike and potential approval of fallback; stable styling preference may conflict with latest SDK/Go availability.

**Future:** pin resolved versions, supported Node LTS and EAS image; upgrade as a tested batch. Future styling adoption requires a tested supported combination, not silent prerelease adoption. Sources: [Expo versions](https://docs.expo.dev/versions/latest/), [NativeWind stable installation](https://www.nativewind.dev/docs/getting-started/installation), [Go mismatch](https://docs.expo.dev/troubleshooting/expo-go-version-mismatch/).

## ADR-003 — One modular app and one Supabase backend

**Decision:** feature-oriented presentation/data code, independent domain modules, Supabase Auth/PostgreSQL/RLS; narrowly scoped Edge Function for account deletion only initially.

**Alternatives:** custom API server for every request; microservices; generic repository/DI frameworks; Firebase document model.

**Rationale:** relational financial invariants and per-user SQL isolation fit PostgreSQL; solo developer should maintain one backend and one client.

**Tradeoffs:** PostgREST/RPC/Auth coupling in adapters; business storage rules live partly in SQL; client cannot be trusted to enforce invariants.

**Future:** domain code reusable by Android/web; add imports/subscriptions behind backend commands rather than replace the ledger. No premature monorepo package extraction.

## ADR-004 — Exact money and immutable ledger

**Decision:** bigint cents in DB/domain, decimal strings over JSON, append-only signed account legs grouped by ledger_operations; explicit opening/adjustment/transfer/reversal commands.

**Alternatives:** floating-point dollars; mutable balance columns; editing/deleting transactions; a full accounting chart-of-accounts double-entry system.

**Rationale:** exactness, correction audit, transfer conservation and import identities without a full accounting platform.

**Tradeoffs:** JSON/BigInt adapters required; ledger aggregates/operation triggers are more work than CRUD; MVP has asset accounts only; future asset/liability signs are explicitly distinct (ADR-015), not a general accounting system. Zero-balance account setup omits a zero-value entry.

**Future:** provider staging/deduplication can post existing commands. Debt/FX need explicit new semantics; widening enum or currency labels alone is insufficient. Never overwrite balance with imported provider total.

## ADR-005 — Separate pooled goal reservations from real funds

**Status/history:** approved unchanged on 2026-11-19. Goals are long-term objectives distinct from short-term Rewards; no arbitrary price threshold enforces this distinction.

**Decision:** one current virtual allocation per goal against pooled liquid accounts; no account movement when funding a goal; no persisted reward wallet.

**Alternatives:** special goal accounts with duplicate balances; account-by-account allocation ledger; independent rewards balance.

**Rationale:** makes earmarking explicit and prevents duplicated money with minimal tables.

**Tradeoffs:** no account-specific envelope reporting/allocation audit log in MVP; spending can create an allocation deficit that must be shown rather than automatically hidden.

**Future:** add allocation history/account earmarks only if needed, preserving invariant that sum reservations is not additional cash. Emergency reserve setting is separate; additional emergency goal must be intentional.

## ADR-006 — Independent rewards with shared headroom

**Status/history:** accepted revision 2026-11-19. The 2026-11-16 sequential queue/prefix reservation proposal was explicitly rejected; it is not the current policy.

**Decision:** H = liquid funds minus ordinary budget/bill protection, goal reservations, emergency reserve and buffer. Independently compare each reward price to H; reorder only changes display/preferences. Multiple unlocks are alternatives sharing the same underlying dollars, not simultaneous reservations. Every actual purchase posts once and immediately invalidates/recomputes every reward. Forecast uses confirmed I-X-G, next-month-end steps, provisional maximum 24 months.

**Alternatives:** rejected strict queue; balance>=price; AI; full daily cash-flow forecast.

**Rationale:** users may choose a small reward or keep funds for a larger one. Goal allocations remain protected; no reward wallet or points.

**Tradeoffs:** unlocked totals may exceed H, so UI must say “Choose from these rewards; buying one changes what remains affordable.” Batch affordability would need a separate sum check, not individual statuses. No payment authorization or automatic spending.

**Future:** see [engine](REWARD_ENGINE.md) for overlap/recalculation/confirmation rules and examples. Configurable initial policies: 7-day confirmation, 5-minute cached snapshot, immediate mutation invalidation, 24-month forecast. Stale data warns/suppresses confident statuses but never blocks app access.

## ADR-007 — Transaction-level ordinary/reward classification

**Status/history:** approved with modification 2026-11-19. Replaces rejected category-level immutable spending_role; categories only describe what was purchased.

**Decision:** expense ledger operation has ordinary/reward classification independently of category. Optional wishlist association supports spontaneous rewards. Ordinary budget-drawing expenses consume category budget; reward expenses reduce L without releasing budget/bill protection. Both count in total actual spending once. Correct/reclassify with atomic reversal and replacement, preserving audit and invalidating snapshots.

**Alternatives:** category role (rejected), separate wallet, decrement budget for every expense.

**Rationale:** the same dining category can represent ordinary lunch or a discretionary dinner. Reward spending must reduce derived headroom rather than be offset by released ordinary protection.

**Tradeoffs:** reward→ordinary correction can legitimately release up to remaining budget protection, but no cash is created. Recompute from current ledger instead of incrementally crediting headroom; confirm impact, validate occurrence links and clear/reopen any wishlist link when no longer reward. Ordinary→reward restores budget reserve and reduces H. No unbounded benefit by toggling classification.

**Future:** no new category migration when users change classification; detailed examples and tests in engine specification.

## ADR-008 — Single currency, asset accounts, online-first MVP

**Decision:** USD-only checking/savings, posted manual transactions, complete monthly ordinary budgets and manual monthly recurring obligations, no offline edits or persistent financial cache; explicit I/X/G forecast settings.

**Alternatives:** multi-currency/full debt ledger/daily cash-flow simulation/offline sync at launch.

**Rationale:** bound the financial correctness surface and deliver meaningful purchase planning first.

**Tradeoffs:** limited international/debt usefulness, network required for authoritative views and edits; no automatic bill protection outside entered budgets. Existing users' data cannot be migrated by simply changing currency symbol.

**Future:** extend per-currency ledgers with explicit conversions, liability/account semantics, dated obligations and reconciliation policies as distinct features. US audience, USD-only checking/savings creation and future liability compatibility are approved; see ADR-015/016.

## ADR-009 — RLS plus secure transactional commands

**Decision:** user JWT RLS reads, same-owner composite FKs, narrow definer RPCs for protected writes, profile row lock/revision, owner-derived identity, default-deny function grants.

**Alternatives:** trust client checks; broad table CRUD; service-role API for every request; event-sourced distributed concurrency.

**Rationale:** protect cross-user boundaries and multirow invariants even against a malicious client; a profile lock is sufficient for individual-user concurrency.

**Tradeoffs:** definer functions require careful review/test because they can bypass RLS; SQL/domain summary parity must be verified; unrelated writes for one user serialize.

**Future:** split lock granularity only after measured contention, maintain migration/grant tests for every new API. Source: [Supabase functions](https://supabase.com/docs/guides/database/functions).

## ADR-010 — TanStack Query and minimal Zustand

**Decision:** Query owns volatile server caches; Zustand only transient local state. Invariant-sensitive screens consume an atomic financial snapshot; clear all caches on auth changes.

**Alternatives:** all server data in Zustand; Redux everywhere; per-screen ad hoc requests; offline-first persistence/realtime subscriptions.

**Rationale:** clear ownership, established invalidation and simple failure recovery without duplicating ledger state.

**Tradeoffs:** two small state tools and explicit mutation invalidation; snapshot reads may duplicate some display queries. No financial optimism on failed/pending writes.

**Future:** persist/sync only with a separately designed device privacy/conflict model. Small state needs may make Zustand usage minimal.

## ADR-011 — Verified email auth, secure sessions, destructive privacy controls

**Decision:** email/password first, SecureStore session adapter, no analytics SDK; user export, financial reset and in-app account deletion with recent authentication. Privileged deletion only in server function.

**Alternatives:** social login first; tokens in plaintext AsyncStorage; soft-delete-only account; local-only anonymous finance data.

**Rationale:** straightforward cross-platform auth, confidentiality on device and user control over sensitive information. Account deletion is a store requirement for apps supporting account creation.

**Tradeoffs:** email delivery/reset support; SecureStore payload-size/reinstall/refresh behavior must be tested; live data deletion does not instantly purge backups. Hosted backend has access to plaintext financial records; no end-to-end encryption claim.

**Future:** social login changes redirect and Apple login requirements; optional biometrics app lock is separate from session refresh. Privacy policy/retention/region choices must match actual service configuration. Sources: [SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/), [Apple deletion](https://developer.apple.com/support/offering-account-deletion-in-your-app/).

## ADR-012 — Continuous Native Generation and capability adapters

**Decision:** generate native projects from app config/plugins; custom Swift/Kotlin in local Expo modules, typed platform wrappers, generated ios/android uncommitted initially.

**Alternatives:** permanent hand-edited native folders; eject/rewrite when Mac arrives; native SwiftUI app alongside unrelated RN app; force all native features into Expo Go.

**Rationale:** same TypeScript source/lockfile travels between WSL and macOS; native changes remain reproducible and EAS-compatible. SwiftUI can be exposed as native views without replacing app architecture.

**Tradeoffs:** plugin/module learning and clean-generation testing; native debug still needs Mac; Expo Go cannot run custom modules.

**Future:** commit native projects only with a separate ownership decision if CNG stops fitting actual requirements. iOS capability gets Android fallback or explicit unavailability; shared logic has no Swift imports. Sources: [customization](https://docs.expo.dev/workflow/customizing/), [modules](https://docs.expo.dev/modules/overview/).

## ADR-013 — Tests throughout, Linux CI and early native proof

**Decision:** pure financial tests + component tests in WSL, migration/pgTAP/real-user API isolation tests, prepared EAS profiles and separately tracked iPhone/signed-build milestones. No Docker/Supabase dependency in Phase 1; ARM64 backend checks occur when needed.

**Alternatives:** simulator-only workflow requiring Mac; mocks only; testing/RLS deferred until release; production DB test fixtures.

**Rationale:** financial invariants and data isolation are core functionality; early binary proof avoids late iOS surprises. Local foundation checks do not require paid Apple enrollment or local backend tooling.

**Tradeoffs:** device/manual accessibility coverage remains necessary; native automated iOS UI tests need hosted/macOS runners; local backend may need hosted disposable fallback on ARM64.

**Future:** broaden native automation as regressions justify it. Add indexes based on measured queries before balance caches or services. Keep dev/prod projects and credentials separate.

## ADR-014 — Subtle derived gamification and staged release

**Decision:** progress/milestone/goal completion displays only; derive current unlocks; EAS/TestFlight followed by explicitly authorized store release. OTA, remote notifications, subscriptions and points deferred.

**Alternatives:** persistent achievement/points economy, automatic purchase encouragement, OTA from day one.

**Rationale:** reward responsible behavior without pressuring spending or introducing an event/notification infrastructure.

**Tradeoffs:** celebration history may reset locally; fewer engagement mechanisms; binary updates require store distribution.

**Future:** add durable milestone/unlock events with idempotency if notifications need them; subscriptions require server entitlements and platform billing review; OTA requires runtime/channel/environment policy. Recheck [Apple review rules](https://developer.apple.com/app-store/review/guidelines/) before release.

## ADR-015 — Future liabilities without implementing debt tracking

**Decision:** reserve account kinds checking/savings/credit_card/student_loan/auto_loan/mortgage/other with explicit asset/liability class and MVP constraint enabling only checking/savings assets. Signed liquid assets alone feed H. Liabilities represent positive amount owed; future net worth subtracts them. Principal repayment lowers cash and liability, not a second expense; borrowing is not income. Interest/fees are expense components. No debt tables/calculations now.

**Alternatives:** assume all accounts spendable; prematurely implement debt engine.

**Rationale/tradeoffs:** retain ledger identities and modular operation validation while recognizing that future repayment is not ordinary sum-zero asset transfer. Historical manual loan-payment cash expenses need deliberate migration/reporting treatment.

**Future:** enable types only with reviewed operation semantics, settlement overlap rules and tests; never treat credit limits as funds.

## ADR-016 — Manual recurring obligations with explicit coverage

**Decision:** monthly template and occurrence tables, optional ordinary payment links, partial settlements, overdue carryover and explicit budget/separate coverage. Protect max(category remaining budget, unpaid budget-covered bills) plus separately protected unpaid bills. Separate-covered payments do not release ordinary budgets. No debt account needed for a minimum loan payment.

**Alternatives:** defer bills (superseded), automatically add all bills to full budgets (double counting), complex arbitrary recurrence scheduler.

**Rationale/tradeoffs:** users can enter rent/utilities/minimum debt payments manually with deterministic overlap rules. Monthly cadence initially; review variable amounts, dates and month rollover. Unlinked payments cannot be guessed reliably. Coverage cannot also duplicate a goal/reserve.

**Future:** other recurrence cadences/calendar forecasts need explicit extension; no worker infrastructure now.

## ADR-017 — Local foundation completion independent of paid Apple enrollment

**Decision:** WSL install/typecheck/lint/tests/Metro/Expo diagnostics and EAS config preparation complete local Phase 1 gates. iPhone testing, Expo credentials, signed development builds and TestFlight are separate external milestones. Paid Apple enrollment is not required to start or finish local foundation.

**Alternatives/history:** supersedes 2026-11-16 Phase 1 acceptance requiring installed signed development binary.

**Rationale/tradeoffs:** progress without a Mac or paid program; no claim that Expo Go/bundling validates native standalone dependencies.

**Future:** enroll and link actual Expo project/signing before cloud device builds; use Xcode later from same source via Prebuild/config plugins. Production provisioning remains forbidden in Phase 1.

## Approval and outstanding decisions

| Topic                                                    | Current status                                     | Remaining gate                                                                               |
| -------------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| US/USD/checking+savings; future liabilities              | Approved                                           | Debt semantics implementation deferred                                                       |
| Pooled virtual goals and separate Rewards                | ADR-005 approved                                   | No further product approval                                                                  |
| Independent reward eligibility/display order             | ADR-006 accepted revision                          | Shared-funds UI disclosure/test                                                              |
| Transaction-level classification; optional wishlist link | ADR-007 accepted revision                          | Reversal/reclassification tests in later phases                                              |
| Recurring obligations                                    | Approved, ADR-016                                  | Phase 3 implementation/security tests                                                        |
| Freshness/forecasts                                      | Approved provisional configurable policies         | Reassess with actual usability evidence                                                      |
| Email/password, verified auth, online-first              | Approved                                           | Auth implementation Phase 2                                                                  |
| SDK 58 + StyleSheet; defer NativeWind                    | Explicitly approved 2026-11-19                     | Exact version and local diagnostics evidence                                                 |
| Paid Apple membership                                    | Not Phase 1 prerequisite                           | Signed device build/TestFlight pending credentials                                           |
| US hosting/privacy/retention/recovery                    | US region preferred, no Phase 1 provisioning       | Select region, actual log/backup retention, legal requirements and RPO/RTO before production |
| Bundle ID/Expo ownership/product name                    | Local identifiers provisional, Savora working name | Confirm owned namespace, Expo project and name availability before distribution              |

No previously rejected sequential-queue or category-role rule remains active. New major architecture changes still require explanation/approval; minor foundation choices proceed under current authorization.
