# Savora development and verification

Phase 1, 2026-11-19. Source is a single Expo TypeScript application, initialized from the verified SDK 58 default-template dependency baseline with a deliberately smaller hand-authored foundation. The template was inspected in `/tmp`; its demo code/assets were not copied over existing files. Existing Git history, AGENTS.MD and architecture docs are preserved. No production backend or remote Expo project has been provisioned.

## Setup in WSL2

Keep repository in `/home/mitch/projects/earnest` (Linux filesystem); product rename does not require moving the directory. Use VS Code Remote WSL, Linux Node/npm and case-correct paths. Architecture is ARM64; JS Metro/tests require no local iOS toolchain. Docker and Supabase CLI are not prerequisites for Phase 1.

```bash
nvm install
nvm use
node --version
npm --version
npm ci
npm run check
npm run deps:check
npm run doctor
npm run start:lan
```

Node pinned to 24.22.3 in `.nvmrc`/`.node-version` and package engines, npm 11.19.1 in packageManager/engines. If npm differs, install that version through your Node manager/toolchain; avoid mixing Windows executables with Linux modules. Lockfile is authoritative; use npm ci for clean installs, expo install for SDK-managed peers. Do not use legacy-peer-deps/force to hide incompatibilities. Fresh dependencies require registry network access; restricted environments may require explicit network approval. Do not paste credentials into shell command text.

`npm run check` runs strict TypeScript, ESLint (zero warnings), Prettier check and Jest in sequence. `npm run format` formats maintained source/docs (AGENTS.MD is excluded to preserve instructions). `npm run test:watch` is optional. `npm run export:ios` verifies JS bundle resolution, not native compilation. GitHub Actions performs npm ci/check/Expo dependency diagnostics on Linux; adding the workflow is not evidence that a remote run has occurred.

## Structure

```text
app/
  _layout.tsx                 root stack, config guard, error/loading boundaries
  (tabs)/                    Dashboard, Transactions, Goals, Rewards, Profile
  (auth)/                    placeholder sign-in route; no auth backend
  +not-found.tsx
src/
  components/ui/             text, button, safe-area screen, feedback
  components/                shared placeholder composition
  config/                    typed, validated public environment config
  theme/                     typography/colors/spacing/radii
tests/                       config, routing, feedback integration tests
docs/                        architecture, phase plan, dependency/setup evidence
.github/workflows/ci.yml
app.config.ts                declarative portable Expo config
eas.json                     prepared build/submit profiles
```

Expo CLI generates/ignores expo-env.d.ts and .expo route types locally; clean-checkout typecheck was also verified without them.

Create feature modules under `src/features`, pure money/ledger/reward logic under `src/domain`, backend adapters under `src/data`, shared hooks/types/constants alongside them, `assets` for consumed visual assets, and versioned SQL under `supabase/migrations` when those phases need actual files. No empty directory tree or speculative finance code is created. Tests stay outside app/ so Router doesn't discover them as screens. No state/data/auth libraries are installed before consumption.

Theme uses StyleSheet per approved fallback. Screen uses safe area, scrollable width-constrained content and flexible text. Placeholder navigation uses Router's standard stack/tabs (no external React Navigation imports). Profile links to future account-access placeholder and back to Dashboard. It is not authentication. Loading/error primitives do not display raw exception payloads. Status/data/cache behavior in financial docs is later-phase design, not current functionality.

## Public environment configuration

No `.env` is needed for placeholders. If preparing a **development** Supabase backend later, copy `.env.example` to `.env.local` and supply both `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, or leave both empty. Public config is read with Expo's statically inlined property syntax, validated without logging input, and has a typed nullable Supabase configuration. It does not construct a client or contact a backend. URL must be HTTPS, with no userinfo/query/path (HTTP allowed only for loopback local development). Only `sb_publishable_*` key form is accepted; legacy JWT and service-role/secret keys are rejected. Phase 2 uses RLS/user sessions, not key secrecy, for authorization.

Every EXPO_PUBLIC value is visible in the bundle. Validation cannot undo exposure if someone places a secret in a public variable: never do so. DB passwords, Supabase secret/service-role keys, Apple private keys and Expo access tokens belong only in backend/CI credential stores where required. General app storage is not a token store. No tokens/sessions are persisted in Phase 1. Ignore env files except the placeholder example, signing material, credentials.json, generated native projects, artifacts and node_modules. App config includes no project ID/owner/account secrets. A malformed optional pair shows a generic startup error; local setup should fix values, not weaken validation.

## Metro, LAN and tunnel

```bash
npm run start:lan
# Alternative when the phone cannot route to WSL's address:
npm run start:tunnel
# Once a signed development client is installed:
npm run start:dev
```

The start/LAN/tunnel scripts explicitly select Expo Go (`--go`); start:dev selects the installed development client instead. Metro default port 8081 must be reachable. On WSL2 NAT, phone localhost refers to the phone, not WSL. Prefer supported WSL mirrored networking or carefully scoped Windows firewall/forwarding on trusted LAN; VPN and guest Wi-Fi isolation can interfere. A tunnel may install/use `@expo/ngrok`, needs network access and exposes the dev server publicly. Use synthetic data, no secrets in code, stop it after testing. No tunnel helper is installed as a production dependency. Current Phase 1 has no backend requests; later a physical phone generally uses a separate hosted development Supabase URL, not loopback. [Expo WSL guide](https://github.com/expo/fyi/blob/main/wsl.md).

To smoke-test Metro locally, run `CI=1 npx expo start --go --localhost --port 8081`, query `http://127.0.0.1:8081/status`, request the iOS manifest with `expo-platform: ios`, then stop the process. This validates server startup/manifest only. `npm run export:ios` separately bundles all iOS routes. Both fall short of actual native runtime validation.

## Physical iPhone procedure — pending external verification

1. Install Expo Go compatible with SDK 58. Confirm current client availability at [Expo Go](https://expo.dev/go) and [version mismatch guide](https://docs.expo.dev/troubleshooting/expo-go-version-mismatch/); do not silently downgrade project. If App Store client mismatches, use an appropriate development client when credentials exist; record the dependency instead of claiming success.
2. Start Metro LAN/tunnel above, scan QR in iPhone Camera and open Expo Go.
3. Confirm Dashboard cold launch; tap Transactions, Goals, Rewards, Profile; open Account access preview and return. Verify deep link `/sign-in` where client supports it. No saving/auth should occur.
4. Check notch/home-indicator clearance, rotation/tablet width, large dynamic text, VoiceOver labels/focus, keyboard-free placeholders and tab labels on small screen. Confirm no clipping and sufficient contrast.
5. Record device/OS, Expo client/version, date, route steps and defects. No device launch has been performed by this workspace session. Tests mock native APIs and do not prove these checks.

## EAS configuration and pending native workflow

Profiles: development = internal dev-client; preview = release-like internal; production = store binary/auto-increment. Each selects matching EAS environment and pinned Node. No OTA update channels/runtime or auto deployment; no signing keys/project ID fabricated. `com.savora.app` and scheme `savora` are **provisional**, not verified owned namespace; confirm/change consistently for both platforms before first signing. Development/preview may later get distinct IDs to coexist with production. Production Supabase/resources are not created now.

When an Expo account is available, using registry-verified CLI version 27.10.0 (engine compatibility checked; executable not installed/run in this session):

```bash
npx eas-cli@27.10.0 login
npx eas-cli@27.10.0 whoami
npx eas-cli@27.10.0 init
npx eas-cli@27.10.0 build --platform ios --profile development
```

`init` creates/links a real remote project. Because app.config.ts is dynamic, EAS may ask you to add its returned extra.eas.projectId/owner to the config manually; never fabricate those values. Run intentionally under the owner's Expo account, not during credential-free local validation. Confirm namespace/ownership first. Cloud build uploads source; EAS handles iOS native compilation on hosted macOS. A paid Apple Developer team, registered physical test device/ad hoc profile and valid signing are required for internal physical iPhone distribution. EAS can manage certificates/profiles with owner oversight. Install the signed artifact and perform the actual device checklist before marking native validation complete. Expo Go does not prove custom native dependencies compile. No EAS build/submission or login has been executed in this task.

Later TestFlight/store release needs Apple membership/agreements, App Store Connect app matching bundle ID, correct signing/credentials, privacy/support materials and explicit release authorization. Store-ready binary uses production profile; `eas submit` uploads for processing, not automatic public approval. Configure ascAppId/least-privileged App Store Connect API credentials only when real accounts exist. No enrollment/Expo login/native signing is required to finish the local foundation. [EAS build](https://docs.expo.dev/build/introduction/), [iOS submission](https://docs.expo.dev/submit/ios/).

## Moving to macOS/Xcode later

Clone same repo, install same supported Node/npm, npm ci, then `npx expo prebuild --platform ios` and `npx expo run:ios` with installed supported Xcode/toolchain. These commands generate native projects/compile locally and have not been run in WSL. Initially ios/android remain ignored; config/plugins/local Expo module sources are authoritative. Never rely on untracked handwritten Xcode-file changes. Add Swift/SwiftUI through Expo Modules and typed iOS capability adapters with Android fallback; native changes require a new development binary and clean-regeneration/EAS validation. Shared TypeScript does not need a platform rewrite. Confirm Apple's then-current Xcode/iOS submission matrix when releasing.

## Validation record

Executed in WSL2 aarch64 on 2026-11-19:

| Command/check                                    | Result                                                                                           |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| node --version / npm --version                   | 24.22.3 / 11.19.1                                                                                |
| npm install then clean npm ci                    | Passed; exact dependency tree recorded, no Git commit created                                    |
| npm run typecheck                                | Passed strict checks (including all tests/routes)                                                |
| npm run lint                                     | Passed, zero warnings                                                                            |
| npm run format:check                             | Passed                                                                                           |
| npm test                                         | 3 suites, 14 tests passed, including real-file tab/auth navigation                               |
| npm run deps:check                               | Dependencies up to date                                                                          |
| npm run doctor                                   | 20/20 checks passed (final minimal dependency set rechecked)                                     |
| npx expo config --type public                    | Savora SDK 58 config resolves                                                                    |
| npm run export:ios                               | iOS JavaScript/Hermes bundle exported, not native compilation                                    |
| CI=1 npx expo start --go --localhost --port 8081 | Metro started; local HTTP status packager-status:running                                         |
| iOS manifest HTTP request                        | application/expo+json, Savora/savora/58.0.0, launch asset present; server stopped afterward      |
| npm audit                                        | 22 moderate, 0 high/critical; reviewed unresolved upstream tooling advisories in DEPENDENCIES.md |
| Git diff/check and instruction file              | No whitespace errors; AGENTS.MD unchanged; no commit/history modification                        |

Initial typecheck needed explicit Jest types; one loading accessibility test needed `accessible` on its view; both fixed and rerun. Doctor's initial font-peer finding belonged to optional symbol/template packages; after peer metadata review those unused native UI/symbol/font packages were removed and relevant checks rerun. No incompatibility is suppressed with overrides or forced dependency changes. Local sandbox initially prevented npm network/Expo user-cache writes; authorized command escalation enabled normal validation, without changing app storage/security rules.

The local foundation meets the WSL gates above. This is not full end-to-end or native verification. Device, signed iOS cloud build, TestFlight and Xcode/simulator are separate pending external milestones. Docker/Supabase integration tests belong in Phase 2 and were not executed. Production retention/logs/backups/recovery/region/name clearance remain unresolved before launch, not local blockers.
