# Commit Guide

This guide helps you create meaningful commits that improve code quality without changing functionality.

## Commit Strategy

We'll create commits in logical groups:

1. **Documentation improvements** - Add JSDoc comments and inline documentation
2. **Code comments** - Add explanatory comments for complex logic
3. **Type improvements** - Enhance type definitions with better documentation
4. **Code organization** - Add section comments and improve structure

## Making Commits

### Step 1: Stage your changes
```bash
git add .
```

### Step 2: Create meaningful commit messages

Here are some good commit message examples:

```bash
# Commit 1: Documentation
git commit -m "docs: add JSDoc comments to GeminiService class

- Add comprehensive JSDoc documentation for all public methods
- Document method parameters and return types
- Add inline comments explaining complex logic
- Improve code readability without changing functionality"

# Commit 2: Type definitions
git commit -m "docs: enhance type definitions with inline documentation

- Add JSDoc comments to Email interface
- Document EmailCategory and EmailPriority types
- Add inline comments explaining AI-generated fields
- Improve type documentation for better IDE support"

# Commit 3: Component documentation
git commit -m "docs: add component documentation to EmailInbox

- Add JSDoc comment for main component
- Document key functions with parameter descriptions
- Add inline comments explaining filter logic
- Improve code maintainability"

# Commit 4: Configuration documentation
git commit -m "docs: improve configuration file documentation

- Add comprehensive JSDoc for GEMINI_CONFIG
- Document environment variable requirements
- Add usage notes and security warnings
- Improve developer onboarding experience"

# Commit 5: Integration documentation
git commit -m "docs: enhance Supabase client documentation

- Add detailed configuration comments
- Document environment variable requirements
- Explain auth configuration options
- Improve integration setup clarity"
```

### Step 3: Push to repository
```bash
git push origin main
# or
git push origin master
# or your branch name
```

## Commit Message Format

Follow this format for consistency:

```
<type>: <subject>

<body>

<footer>
```

**Types:**
- `docs`: Documentation only changes
- `refactor`: Code refactoring without behavior change
- `style`: Code style changes (formatting, whitespace)
- `chore`: Maintenance tasks

**Examples:**
- `docs: add JSDoc comments to service classes`
- `refactor: improve code organization with section comments`
- `style: add inline comments for complex logic`

## Tips

1. **Keep commits focused** - One logical change per commit
2. **Write clear messages** - Explain what and why, not how
3. **Use present tense** - "Add comments" not "Added comments"
4. **Be descriptive** - Future you will thank present you

## Verification

After committing, verify your changes don't break anything:

```bash
# Check for linting errors
npm run lint

# Build the project
npm run build

# Run in development mode
npm run dev
```

