# AGENTS.md

## 1. Project Overview

This repository contains a mobile-first personal finance application designed to help users manage their money responsibly while rewarding themselves for achieving financial goals.

The application combines:

- Personal financial tracking
- Income and expense management
- Budgeting
- Savings goals
- Purchase wishlists
- Reward-based spending
- Financial progress visualization
- Subtle gamification

### Product Philosophy

**Save with purpose. Spend with confidence.**

Unlike traditional budgeting applications that primarily emphasize spending restrictions, this application helps users understand when they can responsibly afford purchases they want.

The application should encourage financial responsibility without discouraging users from enjoying their money.

### Core Product Principle

Every major feature should support at least one of these objectives:

1. Help users understand their financial situation.
2. Help users make progress toward financial goals.
3. Help users determine what they can responsibly afford.
4. Reinforce positive financial habits.

Avoid introducing features that distract from these objectives.

---

## 2. Agent Role and Responsibilities

You are acting as a senior software engineer contributing to a production-oriented mobile application.

Your responsibilities include:

- Implementing maintainable, well-structured code.
- Following the established software architecture.
- Preserving compatibility with iOS.
- Protecting sensitive financial information.
- Maintaining accurate financial calculations.
- Writing appropriate tests.
- Identifying potential security vulnerabilities.
- Updating documentation when architecture changes.
- Avoiding unnecessary complexity.

### General Working Principles

- Understand existing code before modifying it.
- Prefer small, focused changes over extensive rewrites.
- Follow existing conventions unless improvements are justified.
- Do not introduce unnecessary dependencies.
- Avoid premature optimization.
- Avoid overengineering.
- Prefer explicit, readable code over clever abstractions.
- Keep changes aligned with the current development phase.
- Never silently modify unrelated functionality.

Before implementing significant changes, explain the proposed approach and identify architectural implications.

For routine, low-risk changes, proceed without requiring additional approval.

---

## 3. Development Environment

The primary development environment is:

- Windows 11
- WSL2 Ubuntu
- VS Code
- OpenAI Codex
- Git and GitHub

Development must not require macOS or Xcode.

The application will eventually be deployed to iOS.

### Environment Constraints

- Use Node.js LTS compatible with the installed Expo SDK.
- Use npm unless the repository establishes another package manager.
- Prefer development within the WSL2 Linux filesystem.
- Do not assume access to macOS-specific utilities.
- Do not introduce dependencies that unnecessarily require local Xcode.
- Keep development compatible with Expo Application Services (EAS).
- Support testing on physical iPhones using Expo Go or Expo development builds.
- Do not assume that Expo Go supports every native dependency.

### Future macOS Compatibility

The project must support future development using macOS and Xcode without requiring a rewrite.

Prefer:

- Expo-compatible packages
- Expo Modules for custom native functionality
- Expo config plugins for native configuration
- Modular interfaces for platform-specific implementations

Avoid unnecessary direct modifications to generated native project files.

Never assume that generated `ios/` or `android/` directories can be safely modified or regenerated without checking the repository's native workflow.

---

## 4. Technology Stack

The intended technology stack is:

### Frontend

- React Native
- Expo
- TypeScript
- Expo Router
- NativeWind

### Backend

- Supabase
- PostgreSQL
- Supabase Authentication
- Supabase Edge Functions when justified

### State Management

- Zustand for appropriate local application state
- TanStack Query for server-state management where appropriate

### Testing

- Jest
- React Native Testing Library
- Integration tests
- Financial calculation unit tests
- Database security tests

### Deployment

- GitHub
- Expo EAS Build
- Expo EAS Submit
- Apple App Store Connect
- TestFlight

These technologies represent the intended architecture.

Do not install every listed dependency automatically.

Only introduce packages when their functionality is required by the current implementation.

Verify package compatibility with the installed Expo SDK before adding dependencies.

---

## 5. Application Architecture

Follow a modular architecture with clear separation of concerns.

The application should distinguish between:

1. Presentation layer
2. Application state
3. Domain and business logic
4. Data access layer
5. Backend services

### Presentation Layer

Responsible for:

- Screens
- Navigation
- Reusable UI components
- User interactions
- Financial visualizations
- Accessibility

UI components should not contain complex financial calculations or database access logic.

### Domain Layer

Responsible for:

- Budget calculations
- Financial goal progress
- Reward eligibility
- Affordability projections
- Financial validation
- Business rules

Domain logic should be independent of React Native whenever practical.

### Data Access Layer

Responsible for:

- Supabase queries
- Data persistence
- Data retrieval
- Mapping database records to domain objects
- Handling database errors

Avoid making raw database queries directly inside presentation components.

### Backend Layer

Responsible for:

- Authentication and authorization
- Database constraints
- Row Level Security
- Protected operations
- Sensitive server-side calculations when required

Never rely exclusively on frontend validation for security-sensitive operations.

---

## 6. Project Structure

Follow the existing repository structure.

If the repository has not yet been initialized, propose a structure similar to:

```text
app/
  (auth)/
  (tabs)/
  _layout.tsx

components/
  ui/
  finance/
  goals/
  rewards/

features/
  accounts/
  transactions/
  budgets/
  goals/
  rewards/

domain/
  finance/
  affordability/
  validation/

hooks/

lib/
  supabase/
  utils/

types/

constants/

assets/

supabase/
  migrations/
  functions/

tests/

docs/
  ARCHITECTURE.md
  DATABASE_SCHEMA.md
  REWARD_ENGINE.md
  IMPLEMENTATION_PLAN.md
  DECISIONS.md
```

This is a reference structure, not a requirement to create every directory immediately.

Do not restructure an existing repository without a clear reason.

---

## 7. Financial Data Integrity

Financial correctness is a critical requirement.

### Monetary Values

- Never use binary floating-point arithmetic for financial calculations.
- Prefer integer minor units, such as cents, for USD.
- Use exact decimal representations where required.
- Define consistent currency representations.
- Handle rounding explicitly.
- Never silently discard monetary precision.

### Financial Accounts

Account balances must be calculated consistently.

Distinguish between:

- Actual account balances
- Available funds
- Reserved funds
- Savings allocations
- Projected balances

Allocating money toward a goal must not automatically create additional money.

### Transactions

Ensure that:

- Transactions have stable identifiers.
- Income and expenses have consistent representations.
- Transfers do not count as income or expenses.
- Transaction corrections preserve financial consistency.
- Duplicate transactions are prevented where appropriate.
- Financial totals are calculated from reliable data.

### Financial Projections

Predictions must be distinguishable from confirmed financial information.

Do not present estimated future income or savings as guaranteed.

Clearly communicate assumptions behind affordability estimates.

---

## 8. Reward and Affordability Engine

The reward and affordability engine is a core differentiating feature.

It should evaluate whether a user can responsibly afford a wishlist item.

### Important Inputs

Potential inputs include:

- Available liquid funds
- Upcoming obligations
- Recurring expenses
- Budget limits
- Savings commitments
- Emergency reserves
- Financial safety buffers
- Wishlist priorities
- Expected income

### Reward States

The initial engine should support states equivalent to:

**Unlocked**

The purchase fits within the user's currently available discretionary funds.

**Upcoming**

The purchase is not currently affordable but may become affordable based on clearly defined projections.

**Locked**

The purchase currently conflicts with the user's financial constraints.

### Implementation Requirements

- Keep the engine separate from UI components.
- Use deterministic calculations.
- Define inputs and outputs explicitly.
- Document all financial assumptions.
- Handle missing or incomplete financial information.
- Avoid double counting funds.
- Provide explainable eligibility results.
- Do not automatically interpret insufficient data as proof of affordability.

### Testing Requirements

Test scenarios including:

- Zero income
- Zero expenses
- Negative balances
- Insufficient savings
- Multiple savings goals
- Competing wishlist priorities
- Upcoming financial obligations
- Irregular income
- Changes to monthly budgets
- Unexpected expenses
- Missing financial data

Do not introduce AI-generated financial recommendations or machine learning without an explicit product requirement.

---

## 9. Security Requirements

This application handles sensitive financial information.

Security is mandatory.

### Authentication

Use Supabase Authentication.

Follow established secure session-management practices for mobile applications.

### Database Security

- Enable Row Level Security on every user-owned table.
- Define appropriate policies for authenticated users.
- Prevent cross-user data access.
- Validate ownership relationships.
- Use database constraints to protect data integrity.
- Apply least-privilege principles.

### Credentials

Never:

- Commit API secrets.
- Hardcode privileged credentials.
- Expose Supabase service-role or secret keys in the client.
- Log authentication tokens.
- Store plaintext passwords.
- Commit production environment files.

Public client configuration values must be distinguished from privileged secrets.

### Sensitive Data

- Minimize collection of financial information.
- Avoid storing unnecessary personally identifiable information.
- Do not implement bank credential storage.
- Use encrypted transport.
- Protect authentication sessions.
- Avoid exposing sensitive values in logs or error messages.

### Authorization

Never assume that hiding a UI element provides authorization.

Protected operations must enforce permissions through appropriate backend controls.

### Security Testing

Include tests for:

- Unauthorized database access
- Cross-user data access
- Invalid ownership references
- Malformed financial inputs
- Unauthorized modifications
- Sensitive data exposure

Do not weaken security policies to simplify development.

---

## 10. UI/UX Guidelines

The application should feel like a modern premium fintech product.

### Visual Principles

- Minimalist
- Clean
- Professional
- Trustworthy
- Approachable
- Motivating
- Consistent

Avoid excessive gamification or unnecessarily complicated interfaces.

### User Experience

Prioritize:

- Clear navigation
- Accessible controls
- Readable financial information
- Consistent spacing
- Reusable components
- Responsive layouts
- Meaningful feedback
- Clear loading states
- Informative error messages
- Empty states
- Accessible color contrast

Do not rely on color alone to communicate financial status.

### Financial Communication

Financial recommendations must be understandable.

Users should be able to understand why a purchase is classified as unlocked, upcoming, or locked.

Avoid misleading claims about affordability or financial outcomes.

---

## 11. Code Quality Standards

### TypeScript

- Use strict TypeScript wherever practical.
- Avoid `any` unless justified.
- Prefer explicit domain types.
- Validate external data at trust boundaries.
- Avoid unsafe type assertions.
- Keep interfaces focused.

### React Native

- Prefer functional components.
- Follow React Hooks rules.
- Separate presentation from business logic.
- Avoid unnecessary rerenders.
- Use reusable components when appropriate.
- Support platform-specific behavior without duplicating entire features unnecessarily.

### General Code Quality

- Keep functions focused.
- Use meaningful variable names.
- Avoid unnecessary abstractions.
- Handle errors explicitly.
- Remove dead code.
- Avoid commented-out implementations.
- Write comments that explain reasoning rather than restating code.

Do not add dependencies merely to reduce a few lines of straightforward code.

---

## 12. Testing Requirements

Tests should accompany meaningful changes.

Prioritize:

1. Financial calculation correctness
2. Reward eligibility correctness
3. Database security
4. Authentication behavior
5. Data persistence
6. UI interactions

### Unit Tests

Use unit tests for deterministic business logic.

Financial calculations must have clearly defined test cases and expected results.

### Integration Tests

Verify that:

- Database operations behave correctly.
- Authentication boundaries are respected.
- Records remain isolated between users.
- Financial updates preserve consistency.

### UI Tests

Test important interactions such as:

- Adding transactions
- Creating budgets
- Creating savings goals
- Managing wishlist items
- Viewing reward eligibility

### Test Execution

Before completing implementation work:

- Run relevant tests.
- Run TypeScript checks.
- Run available linting tools.
- Report failed tests.
- Identify tests that could not be executed.

Do not claim tests passed unless they were actually executed.

---

## 13. Documentation Requirements

Maintain documentation under `docs/`.

Important documents include:

- `ARCHITECTURE.md`
- `DATABASE_SCHEMA.md`
- `REWARD_ENGINE.md`
- `IMPLEMENTATION_PLAN.md`
- `DECISIONS.md`

Before making major architectural changes, review the relevant documentation.

Update documentation when implementation changes:

- Database relationships
- Major dependencies
- Security boundaries
- Financial calculations
- Deployment workflows
- Architectural decisions

Document important technical decisions and their tradeoffs.

Do not generate excessive documentation for trivial code changes.

---

## 14. Database Migrations

All persistent database schema changes must use version-controlled migrations.

### Requirements

- Do not manually modify production schemas.
- Use descriptive migration names.
- Consider compatibility with existing data.
- Preserve financial records.
- Include appropriate constraints.
- Review security implications.
- Test migrations before production deployment.

Never reset or delete production financial data without explicit authorization.

Destructive migrations require additional review.

---

## 15. Git and Repository Management

Follow standard Git development practices.

### Branching

Use `main` as the primary branch.

Prefer feature branches for substantial work.

Example:

```text
feature/authentication
feature/transaction-tracking
feature/savings-goals
feature/rewards-engine
fix/financial-calculations
```

### Commits

Use descriptive commit messages.

Examples:

```text
feat: implement savings goal creation
fix: prevent duplicate transaction totals
test: add reward eligibility edge cases
docs: update database architecture
```

### Restrictions

- Do not force-push without explicit authorization.
- Do not rewrite shared Git history without approval.
- Do not delete branches unnecessarily.
- Do not commit secrets.
- Do not introduce unrelated changes.

Only create commits when requested or when the active workflow explicitly authorizes them.

---

## 16. Dependency Management

Before adding a dependency:

1. Determine whether existing dependencies can solve the problem.
2. Verify compatibility with the installed Expo SDK.
3. Check whether native configuration is required.
4. Consider iOS compatibility.
5. Consider ongoing maintenance requirements.
6. Evaluate security implications.

Prefer established, actively maintained libraries.

Use the Expo-recommended installation workflow for Expo-managed dependencies.

Do not replace major libraries without discussing the architectural impact.

---

## 17. iOS Compatibility

iOS is the primary target platform.

All new features should consider eventual App Store distribution.

### Requirements

- Preserve compatibility with Expo EAS Build.
- Avoid unnecessary platform-specific dependencies.
- Document native module requirements.
- Consider iOS safe areas and navigation conventions.
- Consider system appearance and accessibility.
- Avoid relying exclusively on web-specific APIs.
- Use development builds when required by native functionality.

### Future Native Development

The architecture must support:

- Xcode debugging
- iOS Simulator testing
- Custom Swift modules
- SwiftUI integrations
- Apple-specific functionality

Native iOS functionality should be encapsulated behind modular interfaces where appropriate.

Do not prematurely eject from Expo or introduce custom native code without justification.

---

## 18. Development Phases

Consult `docs/IMPLEMENTATION_PLAN.md` for the authoritative development roadmap.

The expected high-level sequence is:

**Phase 1:** Project Foundation

**Phase 2:** Authentication and Database

**Phase 3:** Financial Tracking

**Phase 4:** Savings Goals

**Phase 5:** Rewards and Wishlist

**Phase 6:** UI/UX Improvements

**Phase 7:** Testing and Security

**Phase 8:** iOS Deployment

Do not implement future phases unnecessarily while working on an earlier phase.

Prefer completing functional, tested vertical slices over creating large amounts of unfinished infrastructure.

---

## 19. Agent Workflow

For each substantial task, follow this process.

### Step 1 — Inspect

Review relevant existing code, documentation, and dependencies.

Understand the current implementation before making changes.

### Step 2 — Plan

Identify:

- Files requiring modification
- Implementation approach
- Dependencies
- Security implications
- Relevant tests

For major changes, communicate the plan before implementation.

### Step 3 — Implement

Make focused, maintainable changes consistent with the established architecture.

Avoid modifying unrelated files.

### Step 4 — Validate

Run relevant:

- Tests
- TypeScript checks
- Linting
- Build or configuration checks

When applicable, verify database constraints and authorization behavior.

### Step 5 — Document

Update relevant documentation if behavior or architecture changes.

### Step 6 — Report

Summarize:

- What changed
- Why it changed
- Tests performed
- Outstanding issues
- Important follow-up work

Never claim a feature works without appropriate verification.

---

## 20. Actions Requiring Explicit Approval

Do not perform the following without explicit authorization:

- Deploying to production
- Publishing to the App Store
- Modifying production databases
- Deleting user data
- Executing destructive migrations
- Changing the primary technology stack
- Introducing paid infrastructure
- Adding external financial data integrations
- Introducing real payment processing
- Disabling security controls
- Rewriting Git history
- Replacing major architectural components

For routine implementation decisions within an approved task, use reasonable engineering judgment.

---

## 21. Final Engineering Principles

The application should be:

**Correct:** Financial calculations must be reliable.

**Secure:** User financial information must be protected.

**Maintainable:** Code should be understandable and easy to modify.

**Modular:** Features should remain reasonably independent.

**Testable:** Important business logic must support automated testing.

**Portable:** Development should work on WSL2 and later macOS.

**Scalable:** The architecture should support reasonable product growth.

**Simple:** Avoid unnecessary complexity during MVP development.

**User-focused:** Every feature should improve financial understanding, progress, or responsible spending.

### Primary Directive

Build a secure, maintainable, production-oriented personal finance application while prioritizing the reward-based spending experience that differentiates this product.

Do not sacrifice financial correctness, security, or maintainability for implementation speed.
