# Earnest implementation plan

Status: **architecture approval required before Phase 1**. This document describes future work, not commands executed. No application initialization, installs, Supabase setup or code is authorized by this planning task. All financial rules are specified in [REWARD_ENGINE.md](REWARD_ENGINE.md), tables in [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md), platform/security/workflow in [ARCHITECTURE.md](ARCHITECTURE.md), and tradeoffs in [DECISIONS.md](DECISIONS.md).

## Scope and release discipline

Solo-developer vertical slices; each ends with a reviewable PR, passing relevant tests, updated docs and a usable demonstration. No fixed delivery estimates before the compatibility spike. Start security/financial tests alongside features; Phase 7 is a final independent validation pass, not the first security work. Avoid bank integrations, debt/FX, payments, subscriptions, remote notifications, persistent offline writes and advanced gamification. Never use real financial data in CI/fixtures.

Approval must establish USD-only assets, email/password auth, online-first behavior, virtual pooled goal allocations, ordinary vs reward category distinction, budget-based obligation protection, strict wishlist order and manual forecasts. User explicitly enters reserve and buffer (zero permitted), confirms current-month completeness, and accepts forecast assumptions. Proposed plan reconfirmation: 7 days and monthly rollover; live snapshot refresh: 5 minutes; projection horizon: 24 months. Confirm these thresholds and early Apple enrollment availability. NativeWind/SDK fallback is not preapproved if the preferred combination fails validation.

## Phase 1 — Project Foundation

**Objectives:** establish a reproducible WSL/macOS-compatible app foundation and prove the native delivery path early.

**Dependencies:** explicit architecture approval; access to a physical iPhone and Expo account. Paid Apple enrollment when using signed development builds/TestFlight. Working network and a supported Node version.

**Tasks:**

- Resolve supported stable Expo/React Native/Router/NativeWind/React/Reanimated peers; record exact versions. Validate stable SDK 58 combination rather than assuming NativeWind's documented SDK 57 support covers it. If unsupported, present evidence and seek the specific fallback decision.
- Initialize one Expo TypeScript app, npm lockfile, Node version pin, lint/format/typecheck/Jest scripts, jest-expo and React Native Testing Library. Install native peers with Expo tooling; add only small justified dependencies.
- Create proposed directories, route layouts/auth and five tab placeholders, theme primitives, loading/error boundary and typed public environment validation. No real finance UI yet.
- Document local setup, scripts and `.env.example`; ignore secrets and generated native folders. Create GitHub CI for static checks and component/domain test execution; define environment separation.
- Verify ARM64 Supabase CLI/container feasibility and Docker Desktop WSL integration before relying on local stack. Document disposable hosted-test fallback if necessary.
- Configure EAS development profile and stable development bundle identifier; create/install an early cloud iOS development build when credentials are available. Validate clean Prebuild on a disposable copy and EAS build, keeping native config declarative. Track SDK/client compatibility in a dependency register.

**Acceptance criteria:** clean checkout installs from lockfile on WSL; typecheck/lint/tests pass; iPhone can open matching Expo Go (or explicitly approved client fallback), navigate placeholders, and load Metro via tunnel/LAN. Early EAS iOS development binary installs on phone; if Apple account unavailable, record native proof as pending and do not declare full Phase 1 complete. No macOS needed for these gates.

**Testing:** configuration smoke/component tests; real-phone connectivity and font/safe-area checks; Expo dependency diagnostics, clean cloud build and launch. No low-value tests asserting placeholder strings merely to fill coverage.

**Deliverables:** runnable foundation, reproducible toolchain/CI, environment/setup guide, compatibility evidence, development binary and native dependency register. No production resource configuration.

## Phase 2 — Authentication & Database

**Objectives:** secure owner isolation and ledger command infrastructure before financial screens.

**Dependencies:** Phase 1, selected Supabase region and isolated development project/local test stack, email delivery plan.

**Tasks:**

- Create versioned migrations for proposed schema, indexes, checks, ownership FKs, operation-shape triggers, profile bootstrap, grants/RLS and explicit RPC execute privileges. Generate database TypeScript types after migration.
- Implement owner-locked financial command primitives, revision/idempotency behavior, string money serialization and one-statement snapshot RPC. Test ledger commands here before exposing them in Phase 3.
- Implement email/password verification/login/logout/reset, route guards, auth link allowlists, secure session persistence/refresh/AppState lifecycle and per-user cache cleanup.
- Add recent-authenticated Edge Function account deletion, financial-data reset and authenticated export path; ensure ownership cascades, retries and stale-token behavior. Build settings UI later as feature screens mature.
- Add boundary validation, sanitized logging and user-safe errors. Keep privileged keys on backend only. Configure production-ready email delivery by TestFlight release.

**Acceptance criteria:** two users cannot observe or alter each other's records through tables, functions, joins or snapshots. Anonymous access denied. Direct ledger writes fail. No privileged credential is bundled. Session survives intended restart but clears correctly on logout/account switch. Verification/reset links work on a signed iPhone build. Deletion demonstrably removes live owned data and prevents access with old token.

**Testing:** migration replay plus upgrade fixtures, pgTAP grants/checks/RLS, API tests with genuine A/B tokens, direct-write/owner-spoof tests, secure-storage size/failure tests, auth lifecycle and device deep-link testing, deletion cascade/partial-failure/retry tests. Secrets scan of committed source and build environment configuration.

**Deliverables:** reviewed migrations/policies/RPC contracts, generated types, auth/data infrastructure, tested deletion/reset/export backend, isolation test suite and auth/privacy lifecycle documentation.

## Phase 3 — Financial Management

**Objectives:** trustworthy actual balances, corrections, transactions and ordinary monthly budgets.

**Dependencies:** Phase 2 isolated backend and secured command contracts.

**Tasks:**

- Build account creation/opening entries, archive rules, income/ordinary expense/reward expense recording and category management. Explain category roles.
- Add same-currency transfers, annotated reconciliation adjustments and reverse/replace flows. Post financial dates explicitly; never overwrite balances or ledger history.
- Build paginated/filterable transaction history and month/category summaries; distinguish income/expenses from transfers/opening/adjustments.
- Build monthly budget setup, line limits, unplanned allowance, overspend warnings and confirmation/completeness workflow. Preserve historical categories and periods.
- Implement Dashboard actual totals and a snapshot breakdown; wire invalidations/revisions and disable stale actionable states. Add export/reset/delete controls under Profile with reauthentication.

**Acceptance criteria:** balances equal posted legs exactly; transfers conserve total liquid money; corrections reverse exactly and change appropriate historical reports. Budgets reserve category remainders without offsetting another category's overspend. Reward expenses reduce actual funds while not freeing ordinary budget reserve. Concurrent/stale edits resolve visibly; timeouts cannot duplicate ledger commands. Actual expenses can be recorded even when reserves become underfunded.

**Testing:** money parsing and aggregate fixtures, transaction-shape/reversal/idempotency/concurrency integration tests, date/category reporting tests, component form validation and manual phone income→transfer→expense→correction flow. Confirm no IEEE floating-point money arithmetic.

**Deliverables:** usable accounts/transactions/budgets, first financial dashboard, export/reset/delete UI, test fixtures and documented command examples.

## Phase 4 — Financial Goals

**Objectives:** funded goals that reserve existing cash without duplicating it.

**Dependencies:** reliable liquid totals/budget protection from Phase 3.

**Tasks:**

- Build goal create/edit/prioritize/archive flows, targets/dates and optional monthly contribution intentions.
- Implement pooled funding/release with owner lock and target/reserve bounds; display allocated versus held balances distinctly.
- Add exact progress, supported completion estimates, deficit states and emergency-reserve explanation. Confirm total monthly intentions fit G and I-X.
- Build completion/release and goal-funded actual expense as atomic workflows; retain ledger history.

**Acceptance criteria:** funding never changes actual balances; parallel allocations cannot exceed eligible pool; lowering target/archiving funded goal requires explicit release. Spending can show funding deficit honestly. Estimates disappear if contribution plan is missing or unsupported. Completing via purchase releases corresponding allocation and posts expense exactly once.

**Testing:** allocation/transfer invariants, concurrent funding/release, stale revisions, target reduction and underfunding integration tests; exact progress/date edge cases; phone funding/release/completion flows and accessible progress labels.

**Deliverables:** goal screens, safe allocation commands, progress/projection module, goal financial invariants and completion tests.

## Phase 5 — Rewards System

**Objectives:** implement the differentiating purchase queue and transparent deterministic engine.

**Dependencies:** Phases 3–4, approved versioned engine policy and complete planning data.

**Tasks:**

- Implement pure engine and exact money DTO validation first, using all documented examples as golden fixtures; keep adapters outside domain.
- Build wishlist create/edit/archive, accessible reorder, priority labels and reward category selection; keep queue order authoritative.
- Add plan setup/confirmation, I/X/G coherence checks, reserve/buffer controls, conditional projections, status reasons and expandable calculation breakdown.
- Integrate consistent snapshots, revision checks, staleness/month rollover suppression and derived unlock progress; never store unlock as entitlement.
- Implement actual-price purchase recording and reversal linkage atomically. Add subtle in-app celebration without spending pressure or notifications.

**Acceptance criteria:** examples in engine doc produce exact expected values/dates; earlier queue prices consume headroom before later items. No future income unlocks current purchases. Missing/stale/deficit inputs visibly constrain status. A reward purchase consumes headroom once; reversal restores funds and item. Every projection displays assumptions and conditional language. Engine imports neither React nor Supabase.

**Testing:** golden/boundary/invariant tests, monetary serialization/rounding, queue-prefix tests, date/horizon tests, SQL/domain parity and atomic purchase integration tests; component stale/error/assumptions accessibility and real-phone edit→reorder→purchase→reverse flow.

**Deliverables:** independently reusable engine, wishlist/reward screens, transparent breakdown, policy version metadata and complete core financial regression suite.

## Phase 6 — User Experience

**Objectives:** cohesive premium fintech experience and accessible, understandable financial states.

**Dependencies:** complete core flows Phases 3–5, stable compatibility baseline.

**Tasks:**

- Refine typography/spacing/colors, Dashboard summaries, accessible charts with textual equivalents, onboarding and consistent loading/empty/error states.
- Add restrained milestones/goal completion and reduced-motion behavior; no points economy or pressure to spend.
- Improve currency input, keyboard avoidance, confirmation/error recovery, small/large phone and tablet layouts.
- Audit VoiceOver/TalkBack semantics, dynamic text, contrast, focus order and accessible queue movement. Conduct task-based usability sessions with synthetic data.

**Acceptance criteria:** users can identify actual funds versus reserved/projected funds and explain an unlock from its breakdown. Core tasks work with large text, screen reader and reduced motion. No clipping, color-only status, inaccessible chart-only information or fixed-width phone assumptions.

**Testing:** targeted component accessibility checks, real-phone screen-reader/manual contrast/large-text/keyboard testing, small and wide viewport review; chart native dependency build check if introduced. Record usability findings and fixes.

**Deliverables:** polished UI/design token guide, accessible charts and interactions, usability notes, native dependency register updated for any visuals.

## Phase 7 — Testing & Security

**Objectives:** validate the integrated release candidate and operational recovery; fix material gaps.

**Dependencies:** core scope complete; security/invariant tests already running from earlier phases.

**Tasks:**

- Re-run and review isolation/privilege matrix across every exposed table/view/RPC and deletion/export/reset path. Review server secrets, redirect allowlists, logs and dependencies.
- Test upgrade migrations/backward compatibility, double submission, network interruption, auth expiry, month rollover, concurrent devices and stale screens.
- Measure representative transaction-history/snapshot queries with realistic synthetic volumes; use pagination and EXPLAIN before adding caches/indexes. No arbitrary optimization layer.
- Drill backup restoration and owner deletion in isolated backend, record retention/RPO/RTO, and rehearse release rollback/forward-fix.
- Run release-like physical-device regression; optional cloud/macOS native UI automation supplements, not replaces, WSL tests. Resolve high-impact accessibility/performance defects.

**Acceptance criteria:** complete financial suite and A/B/anonymous policy tests pass; no unresolved critical/high security issues; no financial data/tokens in diagnostics. Fresh database and previous-version migration paths both work. Restored data obeys RLS and replay does not duplicate money. Representative scroll/snapshot performance meets an explicit measured device baseline agreed after measurement.

**Testing:** full CI, real-role API tests, concurrency/fault injection, dependency audit with reviewed findings, manual signed-build regression, recovery drill. Broaden tests only for new changes/failures or unresolved risks.

**Deliverables:** release verification report, resolved findings, recovery/deletion/retention runbook, migration compatibility evidence and updated architecture/schema/engine docs.

## Phase 8 — iOS Deployment

**Objectives:** reproducible TestFlight and App Store release from WSL/EAS.

**Dependencies:** Phase 7 signoff, Apple Developer enrollment and agreements, Expo account, production Supabase region/backup/email settings, permanent bundle ID and privacy/support URLs.

**Tasks:**

- Configure isolated EAS development/preview/production environments/profiles and production App Store Connect app. Protect credentials; EAS manages signing with owner oversight. Register ad hoc devices where applicable.
- Provision production backend by reviewed migrations; confirm RLS, production email, auth redirects, no development keys/data, and monitoring without sensitive payloads.
- Set semantic app version and monotonic buildNumber; record Git SHA/backend version and supported EAS/Xcode image. Review entitlements/privacy manifests/required-reason APIs and encryption declaration for actual dependencies.
- Build production via EAS cloud, submit via EAS Submit to App Store Connect, test on TestFlight; validate account creation/reset/deletion and review demo access against production-like setup.
- Complete screenshots, description, age/content rating, support/privacy URLs, data collection disclosures and review notes; verify deletion/retention policy matches behavior. Check current Apple guidelines before submission.
- Submit for review, address findings, release deliberately (phased if appropriate), monitor sanitized errors and maintain rollback/forward-fix plan. OTA updates remain deferred.

**Acceptance criteria:** TestFlight production-style binary passes real-iPhone core/auth/deletion/accessibility regression. Privacy answers reflect actual client/backend/SDK behavior. Build signing and release can be repeated without Mac; account owner controls credentials. App Review submission is complete; production rollout occurs only when user explicitly authorizes that concrete release. Store approval is an external gate, not guaranteed by architecture.

**Testing:** production configuration and smoke tests with synthetic/reviewer accounts, deep links, cold launch/session refresh, privacy controls and no cross-environment data. Verify no dev client in store artifact and no privileged secrets. Repeat native build if dependency/config changes.

**Deliverables:** signed production artifact, TestFlight report, complete store listing/privacy materials, versioned release record and release/runbook. App Store availability follows Apple approval and release authorization.

## Future native development checkpoint

When a feature needs custom native code, document necessity and SDK/platform matrix, add typed capability interface, put Swift/SwiftUI implementation in local Expo module, use config plugins for project configuration, and switch that workflow to development builds. On temporary macOS access, clone/install same lockfile, Prebuild and use Xcode for local debug; verify clean regeneration and EAS cloud build. Add Android fallback/module without restructuring domain/data/screens. Do not hand-edit generated native files as the only source of a change. This is a feature-triggered checkpoint, not extra MVP native work.

## Documentation completion and approval

The five requested planning files are the deliverable for the present task. They require review, especially engine policy and ordinary/reward budget distinction. The next action is **explicit architecture approval**, followed by Phase 1; neither these task lists nor sample command names authorize application implementation or external account changes now.
