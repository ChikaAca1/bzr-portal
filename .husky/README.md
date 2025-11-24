# Husky Git Hooks

This project uses [Husky](https://typicode.github.io/husky/) to enforce code quality checks before commits and ensure consistent commit messages.

## Available Hooks

### `pre-commit`
Runs before every commit to ensure code quality:

1. **Backend ESLint** - Checks backend code for linting errors
2. **Backend Tests** - Runs all backend unit and integration tests
3. **Frontend ESLint** - Checks frontend code for linting errors
4. **Frontend TypeScript** - Validates TypeScript types

All checks must pass for the commit to proceed.

### `commit-msg`
Validates commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <subject>
```

**Allowed types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, semicolons, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks
- `perf` - Performance improvements
- `ci` - CI/CD changes
- `build` - Build system changes
- `revert` - Revert previous commit

**Examples:**
```bash
git commit -m "feat(auth): add login functionality"
git commit -m "fix(api): resolve null pointer exception in user service"
git commit -m "docs(readme): update installation instructions"
git commit -m "test(pib): add unit tests for PIB validator"
```

## Bypassing Hooks (Not Recommended)

In rare cases where you need to bypass hooks:

```bash
git commit --no-verify -m "your message"
```

**⚠️ Warning:** Only use `--no-verify` in exceptional circumstances (e.g., WIP commits during pair programming). All commits to `main` branch must pass hooks.

## Troubleshooting

### Hook Not Running
If hooks aren't running after pulling latest changes:

```bash
cd bzr-portal
npx husky install
```

### Permission Errors (Unix/Mac)
If you get permission errors:

```bash
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
```

### Slow Pre-commit Checks
Pre-commit checks can take 30-60 seconds. To speed up development:

1. Run tests frequently during development (`npm test`)
2. Fix linting errors as you code (use IDE ESLint extension)
3. Use `git commit --amend` to update last commit without re-running all checks

## Maintenance

### Adding New Checks
Edit `.husky/pre-commit` to add new validation steps.

### Updating Commit Message Format
Edit `.husky/commit-msg` to modify the regex pattern.
