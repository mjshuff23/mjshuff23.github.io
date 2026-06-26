# [Repo Quality] Remove ESLint suppressions and block new inline disables

## Goal

Remove all existing `eslint-disable`, `eslint-disable-next-line`, and `eslint-disable-line` suppressions from the repo by fixing the underlying issues directly, then configure ESLint/quality gates so new inline ESLint suppression comments are automatically blocked.

This is a repo hardening pass. The desired end state is:

```text
0 eslint-disable comments
0 eslint-disable-next-line comments
0 eslint-disable-line comments
No new inline ESLint suppression comments can pass quality gates
```

Related ticket: [TSH-270](https://linear.app/michaelshuff/issue/TSH-270/controller-add-production-hardened-jsx-a11y-linting) adds production-hardened JSX a11y linting. This ticket generalizes that standard across the repo.

## Why

Inline lint suppressions are a quality leak. They make lint output look clean while hiding typing, React, accessibility, or configuration issues that should usually be fixed directly.

ESLint's own docs say inline rule disabling should be restricted, used only with a clear valid reason, and should not be the default solution for resolving lint errors. ESLint also recommends preferring configuration files whenever possible for consistent project-wide rule handling.

## Official sources

Use these as implementation guidance:

* ESLint flat config / linter options: [https://eslint.org/docs/latest/use/configure/configuration-files](<https://eslint.org/docs/latest/use/configure/configuration-files>)
* ESLint configure rules / disable rules guidance: [https://eslint.org/docs/latest/use/configure/rules](<https://eslint.org/docs/latest/use/configure/rules>)
* TypeScript ESLint `no-explicit-any`: [https://typescript-eslint.io/rules/no-explicit-any/](<https://typescript-eslint.io/rules/no-explicit-any/>)

Relevant source notes:

* ESLint flat config supports `linterOptions`.
* `linterOptions.noInlineConfig` is a boolean that disallows inline configuration comments such as `/* eslint ... */`; when enabled, inline configuration is ignored.
* `linterOptions.reportUnusedDisableDirectives` reports disable directives that are no longer needed and can be configured with a severity string such as `"error"`.
* ESLint docs describe disable directives such as `/* eslint-disable */`, `/* eslint-enable */`, and `/* eslint-disable-next-line */`.
* ESLint docs say disabling rules inline should be restricted, used with caution, and should not be the default solution to resolve linting errors.
* ESLint docs say that, whenever possible, configuration files should be preferred over disable comments for consistent project-wide rule handling.
* TypeScript ESLint documents `@typescript-eslint/no-explicit-any`; many current suppressions appear related to this rule, so most should be fixed with narrower types, `unknown`, typed mocks, typed test helpers, or module-specific interfaces.

## Initial inventory

A VS Code search for `eslint-disable` currently shows roughly 23 results in 16 files, including suppressions in areas like:

```text
controller/__tests__/settings-directories-init.route.test.ts
controller/__tests__/settings-directories.route.test.ts
controller/__tests__/settings.route.test.ts
controller/__tests__/task-detail-socket.test.tsx
controller/components/task-detail-view.tsx
controller/components/task-log-pane.tsx
controller/e2e/push-notifications.e2e.ts
controller/features/tasks/use-task-detail.ts
controller/lib/realtime/use-task-events.ts
docs/agent-context/tsh-270.md
src/features/integrations/figma/figma-integration.module.ts
src/features/integrations/github/github-integration.module.ts
src/features/integrations/linear/linear-integration.module.ts
src/features/integrations/notion/notion-integration.module.ts
src/features/worktrees/merge-detection.service.spec.ts
src/features/worktrees/pr-generator.service.spec.ts
```

Do not assume this list is exhaustive. Re-run a repo-wide search before implementing.

## Implementation plan

### 1. Create the branch and inventory current suppressions

Create a branch from `main`:

```bash
git checkout main
git pull --ff-only
git checkout -b mjshuff23/tsh-eslint-disable-cleanup
```

Inventory all current suppressions:

```bash
grep -RIn "eslint-disable\|eslint-enable" . \
  --exclude-dir=node_modules \
  --exclude-dir=.next \
  --exclude-dir=dist \
  --exclude-dir=coverage \
  --exclude-dir=.git
```

Also check for file-level suppressions and rule-specific inline configs:

```bash
grep -RIn "eslint " . \
  --exclude-dir=node_modules \
  --exclude-dir=.next \
  --exclude-dir=dist \
  --exclude-dir=coverage \
  --exclude-dir=.git
```

Save the inventory in the PR description. Do not commit a generated inventory file unless it is intentionally useful documentation.

### 2. Remove suppressions by fixing the cause

For each suppression:

1. identify the rule being suppressed
2. understand why the rule fires
3. fix the code, test, mock, hook, or configuration
4. remove the suppression
5. run the relevant lint/test command

Do not mass-delete comments without fixing the underlying issue.

Common fix strategies:

#### `@typescript-eslint/no-explicit-any`

Prefer:

* typed DTOs/interfaces
* `unknown` plus narrowing
* typed test helpers
* `Partial<T>` / `Pick<T>` / `Record<string, unknown>` where appropriate
* typed mocks/spies
* extracted fixture factories
* module-specific interfaces for integration payloads

Avoid:

```ts
const value = foo as any;
```

Prefer patterns like:

```ts
type IntegrationTestModule = {
  service: IntegrationService;
  client: MockedClient;
};
```

or:

```ts
const payload = rawPayload as Record<string, unknown>;
if (typeof payload.id !== 'string') {
  throw new Error('Expected string id');
}
```

#### `react-hooks/exhaustive-deps`

Prefer:

* include the real dependency
* stabilize callbacks with `useCallback`
* derive values outside the effect
* split effects by responsibility
* move non-reactive values into refs only when that is the actual lifecycle intent

Avoid suppressing dependency warnings just to stop re-renders.

#### `react-hooks/refs`

Prefer callback refs, state, or effect-safe ref access patterns that match React's rules.

#### `react-hooks/incompatible-library`

Inspect why the rule fires. Prefer adapting the integration/wrapper rather than suppressing unless the library usage is formally safe and documented at the config level.

#### a11y / JSX rules

Prefer:

* semantic elements
* accessible names for icon-only buttons
* proper labels and `htmlFor` / `id` wiring
* keyboard-accessible controls
* native button/link behavior where possible

#### Tests and mocks

Tests are not exempt from this standard. If repeated suppressions exist in tests, create typed helpers rather than local bypasses.

### 3. Configure ESLint to block future inline suppressions

After suppressions are removed, configure ESLint flat config to prevent new inline config comments.

Preferred strongest setting if compatible with the repo:

```js
// eslint.config.mjs or equivalent flat config file
export default [
  {
    linterOptions: {
      noInlineConfig: true,
      reportUnusedDisableDirectives: 'error',
      reportUnusedInlineConfigs: 'error',
    },
  },
  // existing config entries
];
```

Important behavior:

* `noInlineConfig: true` disallows/ignores inline ESLint configuration comments.
* `reportUnusedDisableDirectives: 'error'` fails unused disable directives.
* `reportUnusedInlineConfigs: 'error'` fails unused inline config comments.

If full `noInlineConfig: true` is too broad because the repo uses legitimate inline ESLint configuration that cannot be removed in this ticket, do **not** silently weaken the standard. Instead:

1. explain the blocker in the PR
2. remove all suppressions that can be removed
3. set `reportUnusedDisableDirectives: 'error'`
4. add a dedicated grep/check script that fails when `eslint-disable`, `eslint-disable-next-line`, `eslint-disable-line`, or `eslint-enable` appears outside explicitly allowed paths
5. create a follow-up ticket for the remaining blocker

### 4. Add a direct no-suppression check if needed

If `noInlineConfig: true` alone does not provide the desired failure mode in all existing quality scripts, add a small script such as:

```js
// scripts/check-no-eslint-disable.mjs
import { execFileSync } from 'node:child_process';

const output = execFileSync(
  'git',
  [
    'grep',
    '-n',
    '-E',
    'eslint-disable|eslint-enable',
    '--',
    ':!node_modules',
    ':!.next',
    ':!dist',
    ':!coverage',
    ':!.git',
  ],
  { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
);

if (output.trim()) {
  console.error('ESLint suppression comments are not allowed:');
  console.error(output);
  process.exit(1);
}
```

But be careful: `git grep` exits non-zero when there are no matches, so the real implementation must handle that case cleanly. A robust implementation should distinguish "no matches" from command failure.

Suggested root package script if this route is needed:

```json
{
  "scripts": {
    "lint:no-eslint-disable": "node scripts/check-no-eslint-disable.mjs"
  }
}
```

Then wire it into quality scripts:

```json
{
  "scripts": {
    "quality:fast": "pnpm lint:no-eslint-disable && pnpm typecheck && pnpm --filter controller lint && pnpm --filter controller lint:a11y",
    "quality:backend": "pnpm lint:no-eslint-disable && pnpm prisma:generate && pnpm typecheck && pnpm build && pnpm test && pnpm test:e2e",
    "quality:controller": "pnpm lint:no-eslint-disable && pnpm prisma:generate && pnpm --filter controller lint && pnpm --filter controller lint:a11y && pnpm --filter controller test && pnpm --filter controller build"
  }
}
```

Avoid duplicating the check unnecessarily if a higher-level script already calls a lower-level script that includes it. Keep the quality flow readable and avoid double-running expensive checks.

### 5. Keep Husky thin

Do not add direct suppression checks to `.husky/pre-push` if the hook already runs `pnpm quality:local`.

Preferred flow:

```text
.husky/pre-push -> pnpm quality:local -> quality scripts -> no inline suppressions enforced
```

### 6. Update docs if needed

If the repo has agent or contribution guidance, add a short standard:

```text
Do not add eslint-disable comments. Fix the underlying issue or update project-level ESLint config with a documented reason.
```

Potential docs to inspect:

```text
AGENTS.md
README.md
docs/agent-context/**
docs/development/**
```

Do not over-document. A short policy is enough.

## Guardrails

* Do not add new `eslint-disable` comments while removing old ones.
* Do not replace `eslint-disable` with `ts-ignore`, `ts-expect-error`, or equivalent bypasses.
* Do not weaken lint rules globally just to make the cleanup easy.
* Do not disable `@typescript-eslint/no-explicit-any` globally.
* Do not remove React hook rules.
* Do not remove a11y rules added in [TSH-270](https://linear.app/michaelshuff/issue/TSH-270/controller-add-production-hardened-jsx-a11y-linting).
* Do not mass-cast to `unknown as SomeType` without validation or a clear test-only reason.
* Do not let tests become untyped escape hatches.
* Keep Husky as a thin entrypoint into quality scripts.
* If a rule is legitimately too broad, prefer documented config-level overrides over local inline suppressions.
* If an exception is truly unavoidable, stop and document it in the PR rather than sneaking in an inline disable.

## Acceptance criteria

* Repo-wide search for `eslint-disable` returns zero production/test suppressions.
* Repo-wide search for `eslint-enable` returns zero production/test suppressions.
* Existing suppressions are removed by fixing underlying issues.
* No new `ts-ignore`, `ts-expect-error`, or similar bypasses are introduced as replacements.
* ESLint flat config includes `linterOptions` hardening, preferably:

```js
linterOptions: {
  noInlineConfig: true,
  reportUnusedDisableDirectives: 'error',
  reportUnusedInlineConfigs: 'error',
}
```

* If `noInlineConfig: true` cannot be enabled, the PR explains why and adds the strongest automated alternative.
* A no-suppression check script is added only if needed to enforce the standard reliably.
* Quality scripts enforce the no-suppression policy locally and in CI.
* `.husky/pre-push` remains thin and continues to flow through `pnpm quality:local`.
* Existing lint, typecheck, unit tests, e2e tests, build, docs, and audit checks pass.
* PR description includes before/after suppression count and exact verification commands.

## Suggested verification commands

```bash
grep -RIn "eslint-disable\|eslint-enable" . \
  --exclude-dir=node_modules \
  --exclude-dir=.next \
  --exclude-dir=dist \
  --exclude-dir=coverage \
  --exclude-dir=.git

pnpm quality:fast
pnpm quality:backend
pnpm quality:controller
pnpm quality:local
pnpm quality:ci
```

If `quality:ci` is too slow locally because of browser/runtime install, run it in CI and document the CI result in the PR.

## PR notes

Include:

* before count of ESLint suppression comments
* after count of ESLint suppression comments
* categories of suppressions removed
* summary of typing/hook/a11y/test fixes made
* whether `noInlineConfig: true` was enabled
* whether any no-suppression script was needed
* exact commands run
* confirmation that no new bypass mechanism replaced the suppressions

## Metadata
- URL: [https://linear.app/michaelshuff/issue/TSH-271/repo-quality-remove-eslint-suppressions-and-block-new-inline-disables](https://linear.app/michaelshuff/issue/TSH-271/repo-quality-remove-eslint-suppressions-and-block-new-inline-disables)
- Identifier: TSH-271
- Status: In Review
- Priority: Medium
- Assignee: Mike
- Labels: ARC: Architecture
- Project: [Agents With Remote Control Mobile Controller](https://linear.app/michaelshuff/project/agents-with-remote-control-mobile-controller-181d4f51202c/overview). Post-MVP: Refactor, UI/UX Cleanup, Productization
- Related issues: TSH-270
- Created: 2026-06-26T17:38:50.179Z
- Updated: 2026-06-26T20:54:57.980Z

## Pull requests

- [chore(quality): Remove ESLint suppressions and block new inline disables (TSH-271)](https://github.com/mjshuff23/agents-with-remote-control-mobile-controller/pull/117)