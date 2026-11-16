# Architectural decision log

Status: all entries **proposed**, dated 2026-11-16. Approval of architecture accepts these choices subject to the stated compatibility/product gates. Record implementation date, exact dependency versions and evidence when accepted; supersede decisions with new entries rather than silently changing financial behavior.

## ADR-001 — Expo React Native with cloud iOS builds

**Decision:** TypeScript, React Native, Expo Router, EAS cloud build/submit, initially matching Expo Go then development builds.

**Alternatives:** native Swift app; Flutter; bare React Native; web wrapper.

**Rationale:** proposed stack supports WSL iteration, iPhone testing and hosted compilation while retaining Android potential.

**Tradeoffs:** Expo Go has a fixed native runtime; signed builds need Apple enrollment/credentials; cloud builds introduce service dependency and turnaround. Local iOS simulator and Swift debugging still require macOS/Xcode.

**Future:** native modules use Expo Modules; verify submission toolchain requirements each release. Sources: [development builds](https://docs.expo.dev/develop/development-builds/introduction/), [EAS iOS submit](https://docs.expo.dev/submit/ios/).

## ADR-002 — Stable dependency combination with explicit compatibility gate

**Decision:** prefer current stable Expo with stable NativeWind, npm lockfile and Expo-managed native peer versions; do not pin untested SDK 58/NativeWind combination in the plan.

**Alternatives:** NativeWind prerelease; older SDK immediately; StyleSheet-only from start; installing latest React Native peers independently.

**Rationale:** current Expo reference is SDK 58 while stable NativeWind guide explicitly covers SDK 57/v4.2.7. Compatibility must be proven, including the physical iPhone client and new native architecture.

**Tradeoffs:** small up-front spike and potential approval of fallback; stable styling preference may conflict with latest SDK/Go availability.

**Future:** pin resolved versions, supported Node LTS and EAS image; upgrade as a tested batch. An unsupported combination requires evidence and explicit revised choice, not silent prerelease adoption. Sources: [Expo versions](https://docs.expo.dev/versions/latest/), [NativeWind stable installation](https://www.nativewind.dev/docs/getting-started/installation), [Go mismatch](https://docs.expo.dev/troubleshooting/expo-go-version-mismatch/).

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

**Tradeoffs:** JSON/BigInt adapters required; ledger aggregates/operation triggers are more work than CRUD; asset-only model is not a general accounting system. Zero-balance account setup omits a zero-value entry.

**Future:** provider staging/deduplication can post existing commands. Debt/FX need explicit new semantics; widening enum or currency labels alone is insufficient. Never overwrite balance with imported provider total.

## ADR-005 — Separate pooled goal reservations from real funds

**Decision:** one current virtual allocation per goal against pooled liquid accounts; no account movement when funding a goal; no persisted reward wallet.

**Alternatives:** special goal accounts with duplicate balances; account-by-account allocation ledger; independent rewards balance.

**Rationale:** makes earmarking explicit and prevents duplicated money with minimal tables.

**Tradeoffs:** no account-specific envelope reporting/allocation audit log in MVP; spending can create an allocation deficit that must be shown rather than automatically hidden.

**Future:** add allocation history/account earmarks only if needed, preserving invariant that sum reservations is not additional cash. Emergency reserve setting is separate; additional emergency goal must be intentional.

## ADR-006 — Conservative deterministic reward engine and sequential queue

**Decision:** H = liquid funds minus remaining ordinary category budgets, goal allocations, emergency reserve and buffer. Queue prefixes compete for H. Forecast uses manually confirmed I-X-G from next month-end, maximum 24 steps, assumptions always visible.

**Alternatives:** balance>=price; independent affordability per item; AI recommendation; detailed daily recurring-obligation cash-flow simulator.

**Rationale:** transparent, independently testable and realistic for manual MVP. No future income counted as current funds; no two wishlist items claim the same dollars.

**Tradeoffs:** conservative estimates, no exact bill/paycheck timing, reliance on manual completeness. Strict queue can block cheap lower items; users must reorder explicitly. Seven-day confirmation and five-minute snapshot freshness add friction in exchange for visible reliability.

**Future:** dated obligations require a new policy/version and overlap rules with budgets; persisted unlock events only if notifications need them. Exact formula/examples/edge cases in [engine](REWARD_ENGINE.md).

## ADR-007 — Separate ordinary budget and reward expense categories

**Decision:** immutable expense-category role ordinary/reward. Ordinary budgets protect baseline spending, reward purchases consume derived extra headroom and never release baseline budget reserve.

**Alternatives:** use all spending to decrement protected budget; add independent points/reward wallet; double-count planned purchases and queue entries.

**Rationale:** if a reward purchase decreases both L and R equally, H would remain unchanged, allowing repeated “rewards” against the same discretionary headroom. Separating roles avoids this while preserving all expenses in actual spending reports.

**Tradeoffs:** users must understand optional purchases versus ordinary spending; one category cannot serve both roles. Reward categories have no monthly envelope cap beyond derived headroom in MVP.

**Future:** if users need rewards inside category budgets, redesign overlapping reservation rules with new tests/policy rather than adding another balance. This distinction specifically needs product approval.

## ADR-008 — Single currency, asset accounts, online-first MVP

**Decision:** USD-only checking/savings, posted manual transactions, complete monthly ordinary budgets, no offline edits or persistent financial cache; explicit I/X/G forecast settings.

**Alternatives:** multi-currency/credit/debt/recurring calendar/offline sync at launch.

**Rationale:** bound the financial correctness surface and deliver meaningful purchase planning first.

**Tradeoffs:** limited international/debt usefulness, network required for authoritative views and edits; no automatic bill protection outside entered budgets. Existing users' data cannot be migrated by simply changing currency symbol.

**Future:** extend per-currency ledgers with explicit conversions, liability/account semantics, dated obligations and reconciliation policies as distinct features. Confirm USD and asset-only scope with owner before implementation.

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

**Decision:** pure financial tests + component tests in WSL, migration/pgTAP/real-user API isolation tests, early EAS iOS build and physical iPhone validation; ARM64 local stack verification required.

**Alternatives:** simulator-only workflow requiring Mac; mocks only; testing/RLS deferred until release; production DB test fixtures.

**Rationale:** financial invariants and data isolation are core functionality; early binary proof avoids late iOS surprises. Local Docker is currently unavailable in inspected WSL environment.

**Tradeoffs:** device/manual accessibility coverage remains necessary; native automated iOS UI tests need hosted/macOS runners; local backend may need hosted disposable fallback on ARM64.

**Future:** broaden native automation as regressions justify it. Add indexes based on measured queries before balance caches or services. Keep dev/prod projects and credentials separate.

## ADR-014 — Subtle derived gamification and staged release

**Decision:** progress/milestone/goal completion displays only; derive current unlocks; EAS/TestFlight followed by explicitly authorized store release. OTA, remote notifications, subscriptions and points deferred.

**Alternatives:** persistent achievement/points economy, automatic purchase encouragement, OTA from day one.

**Rationale:** reward responsible behavior without pressuring spending or introducing an event/notification infrastructure.

**Tradeoffs:** celebration history may reset locally; fewer engagement mechanisms; binary updates require store distribution.

**Future:** add durable milestone/unlock events with idempotency if notifications need them; subscriptions require server entitlements and platform billing review; OTA requires runtime/channel/environment policy. Recheck [Apple review rules](https://developer.apple.com/app-store/review/guidelines/) before release.

## Outstanding approval decisions

| Question | Proposed answer | Required before |
|---|---|---|
| Initial audience/currency/accounts? | USD, checking/savings only, no debt/FX | Architecture/Phase 1 |
| Rewards budget semantics? | Additional to ordinary budgets; separate category roles | Architecture/Phase 1 |
| Wishlist competition? | Strict order; explicit manual reorder | Architecture/Phase 1 |
| Planning/freshness thresholds? | Explicit reserves, 7-day confirmation/month rollover, 5-minute snapshot, 24-step forecast | Engine implementation |
| Auth/offline requirements? | Verified email/password, online-first | Architecture/Phase 1 |
| Early Apple account? | Prefer enrollment early for signed native proof | Native build gate |
| Stack compatibility fallback? | Evidence first; supported prior SDK or StyleSheet only with approval | Phase 1 if spike fails |
| Region/retention/recovery/privacy audience? | Decide based on launch geography and hosting capabilities; no invented legal retention period | Production provisioning |

Unresolved choices are explicit gates, not reasons to write speculative infrastructure. Present concrete alternatives/evidence when resolving them; keep this log synchronized with actual behavior.
