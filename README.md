# Savora

Save with purpose. Spend with confidence.

An Expo/React Native personal finance app for US consumers. Phase 1 provides the application foundation and placeholder navigation. Authentication, finance features and backend resources are not implemented yet. Savora is a working name; trademark/name availability is unverified.

Use Node **24.22.3** and npm **11.19.1** inside WSL's Linux filesystem:

```bash
nvm use
npm ci
npm run check
npm run start:lan
```

No Supabase configuration, Docker, Mac, Expo login or paid Apple account is required for local placeholders. If WSL LAN networking is unavailable, use `npm run start:tunnel` (may prompt to install Expo's tunnel helper). A matching physical-device Expo Go client is required to open the app; device and signed native build checks are separate from local checks.

- [Development, device testing and EAS guide](docs/DEVELOPMENT.md)
- [Dependency evidence and native requirements](docs/DEPENDENCIES.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Decisions](docs/DECISIONS.md)
- [Implementation phases](docs/IMPLEMENTATION_PLAN.md)
- [Proposed schema](docs/DATABASE_SCHEMA.md)
- [Reward engine specification](docs/REWARD_ENGINE.md)

Repository instructions live in [AGENTS.MD](AGENTS.MD), preserving its existing case-sensitive filename. No database migrations or financial engine are deployed in Phase 1.
