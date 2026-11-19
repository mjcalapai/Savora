# Savora implementation plan

Status: architecture and Phase 1 approved on 2026-11-19 with owner revisions. Later phases remain planned. [Engine](REWARD_ENGINE.md), [schema](DATABASE_SCHEMA.md), [architecture](ARCHITECTURE.md), [decisions](DECISIONS.md) define approved behavior; [development setup](DEVELOPMENT.md) records actual foundation commands/results.

## Scope and release discipline

Solo-developer vertical slices with passing relevant tests, maintained docs and reviewable changes. No commits without explicit authorization. US/USD checking+savings MVP, future liability-compatible ledger, online-first verified email/password, virtual Goals separate from independently evaluated Rewards, transaction-level classification and monthly recurring obligations. No bank integrations, debt tracking/interest/FX, payments, subscriptions, remote notifications or offline synchronization. Stale data does not block app access. Initial configurable policies: 7-day confirmations, 5-minute maximum snapshots with immediate mutation invalidation, 24-month reward forecasts. StyleSheet is explicitly approved for Phase 1; NativeWind deferred. No production provisioning in this phase.

## Phase 1 — Project Foundation

**Objectives:** establish a reproducible WSL/macOS-compatible local app and prepare cloud native build workflow without requiring paid enrollment.

**Dependencies:** architecture approval (received); WSL Linux Node/npm, network access for packages. Physical iPhone, Expo credentials and paid Apple membership are external validation dependencies only, not local foundation prerequisites. No Docker or Supabase instance required.

**Tasks:**

- Verify current stable Expo's React/React Native/Router peers, Node minimum and future Reanimated matrix from primary sources/package manifests before initialization; document resolved versions. Use SDK 58 + StyleSheet per explicit fallback approval; no unsupported NativeWind combination.
- Initialize single TypeScript Expo app, npm lockfile and pinned Node/npm; strict typecheck, lint, formatting, Jest/jest-expo/React Native Testing Library. Only install currently consumed libraries.
- Build route layouts, five tabs and future-auth placeholder route; shared safe-area layout, typography/colors/spacing/radii, loading/error components. No auth or finance functionality.
- Typed public config validation with optional paired Supabase URL/publishable key, no backend credentials required to launch. Add `.env.example`, secret/native ignores and Linux CI checks.
- Prepare EAS development/preview/production profiles and provisional Savora app identifiers; no remote project creation, signed build or production resources. Document Expo linking/signing/device and future macOS procedures.
- Verify reproducible `npm ci`, typecheck, lint, formatting, tests, Expo CLI/config/dependency diagnostics, Metro startup and iOS JS bundling. Record limitations honestly. Do not investigate Docker/ARM64 backend tooling until needed.

**Acceptance criteria by dependency:**

| Category          | Required validation                                                                                                                                                             | Completion boundary                                                    |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| WSL only          | npm ci, strict TypeScript, lint/format, automated tests, five Router tabs/auth structure, safe-area conventions, validated public config, Metro and Expo dependency diagnostics | Local Phase 1 gates; no native-runtime claims                          |
| Repository/config | Lockfile/toolchain pin, GitHub Actions, EAS profiles and complete setup docs; architecture preserved/consistent                                                                 | Local Phase 1 gates                                                    |
| Physical iPhone   | Expo Go launch with matching SDK, tab navigation, safe areas/large text; record device/OS/client/results                                                                        | Separate unverified milestone if device unavailable                    |
| Expo credentials  | Login, confirm owned identifier/Expo project, link project; cloud build submission                                                                                              | External milestone, not performed without credentials                  |
| Apple enrollment  | Signed physical iOS development build install/launch, then TestFlight store binary                                                                                              | Deferred external milestone; not required for local Phase 1 completion |
| macOS/Xcode       | Simulator/local native build/custom Swift debug                                                                                                                                 | Deferred until native development needs it                             |

**Testing:** meaningful public-config, route navigation and loading/error recovery tests; actual commands above plus device procedure. Expo Go is not evidence of standalone custom native dependency compatibility. JS bundle/Metro is not proof of signed native runtime.

**Deliverables:** runnable local foundation, reproducible toolchain/CI, theme/layout/routes, validated public config, EAS preparation, version evidence and development/verification guide with explicit pending device/native milestones.

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

- Build account creation/opening entries, archive rules, income/ordinary expense/reward expense recording and category management. Keep category independent from operation ordinary/reward classification; allow spontaneous rewards without wishlist link.
- Add same-currency transfers, annotated reconciliation adjustments and reverse/replace flows. Post financial dates explicitly; never overwrite balances or ledger history.
- Build paginated/filterable transaction history and month/category summaries; distinguish income/expenses from transfers/opening/adjustments.
- Build monthly recurring obligation templates/occurrences, linked partial payments and budget/separate coverage protections, review/waive/arrears flows without debt accounts.
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

**Objectives:** implement the independent reward choices and transparent deterministic engine.

**Dependencies:** Phases 3–4, approved versioned engine policy and complete planning data.

**Tasks:**

- Implement pure engine and exact money DTO validation first, using all documented examples as golden fixtures; keep adapters outside domain.
- Build wishlist create/edit/archive, accessible display reorder, priority labels and expense category selection; ordering never gates eligibility.
- Add plan setup/confirmation, I/X/G coherence checks, reserve/buffer controls, conditional projections, status reasons and expandable calculation breakdown.
- Integrate consistent snapshots, revision checks, staleness/month rollover suppression and derived unlock progress; never store unlock as entitlement.
- Implement actual-price purchase recording and reversal linkage atomically. Add subtle in-app celebration without spending pressure or notifications.

**Acceptance criteria:** examples in engine doc produce exact expected values/dates; each reward compares independently to shared headroom, with explicit alternative-choice disclosure; priority never gates unlocks. No future income unlocks current purchases. Missing/stale/deficit inputs visibly constrain status. A reward purchase consumes headroom once; reversal restores funds and item. Every projection displays assumptions and conditional language. Engine imports neither React nor Supabase.

**Testing:** golden/boundary/invariant tests, monetary serialization/rounding, independent-order/shared-funds tests, date/horizon tests, SQL/domain parity and atomic optional-wishlist/spontaneous purchase and reclassification integration tests; component stale/error/assumptions accessibility and real-phone edit→reorder→purchase→reverse flow.

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

## Current authorization and validation reporting

Architecture revisions and Phase 1 implementation are approved. No Phase 2 functionality is authorized by this task. Report local foundation gates separately from iPhone, Expo credential, signed iOS build, TestFlight and Xcode milestones. Lack of paid membership cannot block local completion; unexecuted native checks cannot be claimed successful. Source code remains shared across WSL/macOS, with future Swift isolated in Expo Modules/config plugins.
