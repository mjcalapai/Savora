# Savora dependency evidence

Selection date: 2026-11-19, before initialization. Node 24.22.3/npm 11.19.1 observed in WSL2 aarch64. Registry stable tags: expo 58.0.26, expo-router 58.0.32, expo-template-default 58.0.35, nativewind 4.2.7 (v5 is RC). Package metadata and Expo 58.0.26 bundledNativeModules.json agree on React 19.3.0 / React Native 0.88.1 / Router ~58.0.32. Expo Node engines allow ^22.13.0 / ^24.3.0 / ^26.0.0 / >=27; observed Node meets this. React Native peer requires React ^19.3.0. Use bundled peers, never arbitrary independent upgrades.

NativeWind stable guide explicitly covers SDK 57, not SDK 58. Owner approved SDK 58 + React Native StyleSheet for Phase 1; NativeWind deferred. No prerelease/downgrade. Expo's bundle lists Reanimated 4.7.1 and Worklets 0.13.0; install only if a currently consumed feature needs them. Expo Go/native pairing must match exactly; metadata is not standalone native runtime proof.

Primary evidence: [Expo SDK matrix](https://docs.expo.dev/versions/latest/), [Router SDK reference](https://docs.expo.dev/versions/latest/sdk/router/), [NativeWind guide](https://www.nativewind.dev/docs/getting-started/installation), [Reanimated troubleshooting](https://docs.swmansion.com/react-native-reanimated/docs/guides/troubleshooting/), [Expo Jest setup](https://docs.expo.dev/develop/unit-testing/), [Router tests](https://docs.expo.dev/router/reference/testing/). Registry evidence is reproducible with npm view expo@58.0.26 engines, npm view expo-template-default@58.0.35 dependencies devDependencies, npm view react-native@0.88.1 engines peerDependencies, npm view expo-router@58.0.32 peerDependencies, and expo's bundled manifest. The installed dependency register and verification boundaries are recorded below.

## Installed register

All versions below are resolved in package-lock.json, not unbounded latest tags. Primary runtime libraries are MIT licensed; React Native is MIT (bundled third-party native code retains upstream notices). No custom Swift or native module is introduced. Native UI/symbol/font optional template packages are deliberately omitted; stable JavaScript tabs consume the base Router/screen/safe-area runtime.

| Package                        | Version | Purpose / native requirement                                                                           |
| ------------------------------ | ------- | ------------------------------------------------------------------------------------------------------ |
| expo                           | 58.0.26 | SDK runtime/config/CLI; Expo Go runtime must match SDK                                                 |
| expo-constants                 | 58.0.16 | Router runtime/config peer; included in Expo runtime                                                   |
| expo-dev-client                | 58.0.21 | Prepared development-build runtime; needs rebuilt signed client when used, not needed for Expo Go      |
| expo-linking                   | 58.0.17 | Router link runtime; custom scheme declared by config, authentic standalone links require native build |
| expo-router                    | 58.0.32 | File routes/stack/JS tabs; expo-router config plugin; no external @react-navigation imports            |
| expo-status-bar                | 58.0.5  | System status bar styling; Expo Go compatible                                                          |
| react                          | 19.3.0  | UI runtime matched to RN                                                                               |
| react-dom                      | 19.3.0  | Compatible Router web peer; optional future web target                                                 |
| react-native                   | 0.88.1  | Native renderer; no local iOS compile in WSL                                                           |
| react-native-safe-area-context | 5.11.1  | Safe-area provider/layout; Expo Go native module, rebuild when changing versions                       |
| react-native-screens           | 4.30.1  | Native stack peer; Expo Go version must match, rebuild standalone for native updates                   |
| react-native-web               | 0.21.4  | Compatible Router web runtime; optional future web target                                              |

No application feature requests camera/contacts/location/notification access; inspect final merged native manifests and development-launcher behavior when native builds are available. Router/dev-client plugins are declarative in app.config.ts. Every native package update must pass Expo's bundled version check and require a rebuilt development/production binary for standalone use; passing Go or bundling alone is insufficient. No custom native dependencies have been verified on a signed device. Android native runtime is also unverified. Additional third-party privacy manifests/licenses must be reviewed for final production binary.

| Development tool              | Resolved version |
| ----------------------------- | ---------------- |
| @react-native/jest-preset     | 0.88.1           |
| @testing-library/react-native | 14.1.0           |
| @types/jest                   | 30.0.0           |
| @types/node                   | 24.19.2          |
| @types/react                  | 19.3.0           |
| eslint                        | 9.39.5           |
| eslint-config-expo            | 58.0.4           |
| expo-doctor                   | 1.21.8           |
| jest                          | 30.5.2           |
| jest-expo                     | 58.0.15          |
| prettier                      | 3.10.1           |
| typescript                    | 6.0.3            |

RNTL 14 uses test-renderer 1.x (its peer installed by npm) rather than adding deprecated react-test-renderer manually. Router 58 testing utilities require RNTL >=14; jest-expo 58 uses the matching standalone @react-native/jest-preset 0.88.1. Keep Jest/Expo preset/renderer peers aligned. Expo's own Babel/Metro defaults suffice; no NativeWind or worklet Babel transforms are configured. Reanimated 4.7.1/Worklets 0.13.0 are the SDK manifest's future-compatible pair and are **not installed**, because no foundation feature consumes animation worklets.

## Reviewed installation/audit findings

2026-11-19 npm ci succeeded. npm audit reports 22 moderate findings, 0 high/critical. Underlying advisories are [glob cancellation traversal](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4) and [minimatch glob amplification](https://github.com/advisories/GHSA-g3hv-75wg-m249), propagating through Jest instrumentation and Expo fingerprint/build tooling. This foundation does not accept user-supplied glob patterns. Findings remain unresolved; monitor upstream compatible fixes before production and do not describe the dependency tree as vulnerability-free. npm's proposed “fix” downgrades Expo to SDK 52/Jest to 29 or the Expo Jest preset; no force fix/override/downgrade was applied.

ESLint 9.39.5 emits a maintenance deprecation warning. It currently satisfies expo-config and eslint-plugin-react's published peers; the installed eslint-plugin-react 7.37.5 does not declare ESLint 10 support. Do not replace it with an unsupported major solely to suppress the warning. Review newer supported Expo lint tooling before release. Other deprecation notices (inflight/older glob/whatwg-encoding) are upstream tooling, not extra application features. npm also notes optional @parcel/watcher's source-build script is unapproved under its install-script policy; no blanket script allowance was added. Actual Metro/export checks determine whether that optional path affects this ARM64 environment.

## Verification boundary

Initial Doctor found the font peer missing for the template-derived optional symbol package. Installing its matched peer resolved that check; final peerDependenciesMeta review then established @expo/ui/expo-symbols are optional and unused by our JavaScript tabs. Both and the now-unneeded font/plugin were removed instead of carrying extra native modules. Final diagnostics are recorded in DEVELOPMENT.md. Tests use mocked native modules; they do not validate standalone native compilation. Actual iPhone, EAS signed build, TestFlight and Xcode/simulator remain pending. The complete executed command record is in DEVELOPMENT.md. CI workflow exists but has not run on GitHub in this session. No Expo login or Apple enrollment is needed for local checks.
