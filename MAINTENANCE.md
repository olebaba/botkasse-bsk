# Repository Maintenance Guide

This document outlines the maintenance infrastructure set up for this repository.

## CI/CD Pipeline

A comprehensive GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push and pull request:

- **Lint** — Code quality checks via ESLint
- **TypeScript** — Type checking and build validation
- **Tests** — Unit tests via Vitest
- **Auto-merge** — Automatically merges passing Dependabot PRs

All checks must pass before code can be merged to `main`.

## Branch Protection

The `main` branch is protected with the following rules:

- ✅ **Requires status checks** — All CI checks (Lint, TypeScript, Tests) must pass
- ✅ **Requires code review** — At least 1 approval required before merging
- ✅ **Dismisses stale reviews** — Old reviews are dismissed when new commits are pushed
- ✅ **Blocks force push** — Prevents force pushes to `main`
- ✅ **Blocks deletion** — Prevents accidental deletion of `main`

### Setting Up Branch Protection (First Time Only)

If branch protection is not yet configured, run this command once:

```bash
bash scripts/setup-branch-protection.sh
```

**Requirements:**
- GitHub CLI (`gh`) installed
- Authenticated with `gh auth login` or `GH_TOKEN` environment variable set
- Admin access to the repository

## Automated Dependency Updates

Dependabot is configured to:

- **Check for updates** — Weekly on Mondays at 9:00 AM (Europe/Oslo timezone)
- **Group updates** — Minor and patch updates are grouped into a single PR to reduce noise
- **Auto-merge** — Passing minor/patch updates are automatically merged via PR
- **Major updates** — Opened separately for manual review

### Dependabot Configuration

See `.github/dependabot.yml` for detailed settings.

## Scripts

### Available Commands

```bash
# Code quality
bun lint              # Run ESLint
bun format            # Format code with Prettier
bun build             # TypeScript build check
bun test              # Run tests in watch mode
bun test:run          # Run tests once

# Development
bun dev               # Start dev server (with Turbopack)
bun start             # Start production server
```

### Setup Branch Protection

```bash
bash scripts/setup-branch-protection.sh
```

## Workflow

### Creating a Pull Request

1. Create a feature branch from `main`
2. Make your changes
3. Push to your branch — CI will run automatically
4. Create a PR
5. Address any CI failures
6. Request review
7. Once approved and all checks pass, merge will be available

### Merging Dependencies

Dependabot PRs for minor/patch updates are automatically merged after CI passes. Major updates require manual review and approval.

## Troubleshooting

### CI Checks Failing

1. Check the workflow output in the "Checks" tab of your PR
2. Run the failing check locally (`bun lint`, `bun build`, `bun test:run`)
3. Fix issues and commit
4. Push — CI will re-run automatically

### Branch Protection Not Working

- Ensure you have admin access to the repository
- Run `bash scripts/setup-branch-protection.sh` with proper GitHub authentication
- Check that the `main` branch exists and is the default branch

### Dependabot PRs Not Opening

- Verify `.github/dependabot.yml` is on the `main` branch
- Check repository settings — Dependabot must be enabled (usually enabled by default)
- Wait up to 24 hours for the first run

## Further Reading

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)
- [Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
