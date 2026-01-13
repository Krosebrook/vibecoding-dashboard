# Contributing to Dashboard VibeCoder

Thank you for your interest in contributing! This guide will help you get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

## Code of Conduct

This project follows a Code of Conduct to ensure a welcoming environment:

- **Be Respectful**: Treat everyone with respect and kindness
- **Be Constructive**: Provide helpful, actionable feedback
- **Be Collaborative**: Work together toward common goals
- **Be Patient**: Remember that contributors have varying experience levels
- **Be Inclusive**: Welcome people of all backgrounds and identities

Unacceptable behavior includes harassment, discrimination, trolling, or any behavior that makes others feel unwelcome.

## Getting Started

1. **Read the documentation**:
   - [README.md](./README.md) - Project overview
   - [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical architecture
   - [DEVELOPMENT.md](./DEVELOPMENT.md) - Development guide
   - [API.md](./API.md) - API reference

2. **Set up your development environment**:
   ```bash
   git clone <repository-url>
   cd spark-template
   npm install
   npm run dev
   ```

3. **Explore the codebase**:
   - Browse existing components
   - Review code patterns
   - Run the application locally

4. **Find something to work on**:
   - Check open issues labeled `good first issue`
   - Look for `help wanted` labels
   - Review the [ROADMAP.md](./ROADMAP.md) for future features

## How to Contribute

There are many ways to contribute:

### 1. Code Contributions
- Fix bugs
- Implement new features
- Improve performance
- Refactor code
- Add tests

### 2. Documentation
- Fix typos or errors
- Improve explanations
- Add examples
- Create tutorials
- Translate documentation

### 3. Design
- Improve UI/UX
- Create new themes
- Design dashboard templates
- Build pattern presets
- Create animation presets

### 4. Testing
- Report bugs
- Test new features
- Write automated tests
- Perform accessibility testing
- Test on different devices/browsers

### 5. Community
- Answer questions
- Help other contributors
- Write blog posts
- Create videos or tutorials
- Share the project

## Development Setup

### Prerequisites

- Node.js 18+ and npm 8+
- Git
- Modern browser (Chrome 90+, Firefox 88+, Safari 14+)
- Code editor (VS Code recommended)

### Installation

```bash
# Fork the repository on GitHub first

# Clone your fork
git clone https://github.com/YOUR_USERNAME/spark-template.git
cd spark-template

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/spark-template.git

# Install dependencies
npm install

# Start development server
npm run dev
```

### Recommended VS Code Extensions

- ESLint
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- Prettier
- GitLens

## Coding Standards

### TypeScript

**Use explicit types**:
```typescript
// ✅ Good
function processUser(user: UserData): void {
  // ...
}

// ❌ Avoid
function processUser(user: any) {
  // ...
}
```

**Prefer interfaces over types for objects**:
```typescript
// ✅ Good
interface User {
  id: string
  name: string
}

// ⚠️ Use types for unions/primitives
type Status = 'active' | 'inactive' | 'pending'
```

**Use async/await over promises**:
```typescript
// ✅ Good
async function fetchData() {
  const response = await fetch(url)
  return await response.json()
}

// ❌ Avoid
function fetchData() {
  return fetch(url).then(r => r.json())
}
```

### React

**Use functional components**:
```typescript
// ✅ Good
export function MyComponent({ data }: Props) {
  return <div>{data}</div>
}

// ❌ Avoid class components
export class MyComponent extends React.Component {
  // ...
}
```

**Use hooks properly**:
```typescript
// ✅ Good - Functional update with useKV
const [items, setItems] = useKV("items", [])
setItems((current) => [...current, newItem])

// ❌ Wrong - Closure value
setItems([...items, newItem]) // items may be stale!
```

**Extract complex logic to hooks**:
```typescript
// ✅ Good
function useUserData(userId: string) {
  const [user, setUser] = useState<User | null>(null)
  // ... complex logic
  return user
}

function MyComponent({ userId }: Props) {
  const user = useUserData(userId)
  // ... simple rendering
}
```

### Styling

**Use Tailwind utility classes**:
```typescript
// ✅ Good
<div className="flex items-center gap-4 p-6 rounded-lg bg-card">

// ❌ Avoid inline styles
<div style={{ display: 'flex', padding: '24px' }}>
```

**Follow existing patterns**:
```typescript
// Use consistent spacing scale
<div className="space-y-4"> // 16px
<div className="space-y-6"> // 24px
<div className="gap-2">     // 8px
<div className="p-4">       // 16px padding
```

### File Organization

**Group related files**:
```
components/
  ├── Dashboard/
  │   ├── DashboardPreview.tsx
  │   ├── DashboardConfig.tsx
  │   └── DashboardHeader.tsx
  └── Connectors/
      ├── DataConnectorManager.tsx
      └── WebhookManager.tsx
```

**Use consistent naming**:
- Components: `PascalCase.tsx`
- Hooks: `use-kebab-case.ts`
- Utils: `kebab-case.ts`
- Types: `types.ts` or `ComponentName.types.ts`

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples**:
```
feat(dashboard): add funnel chart component

Implements funnel chart visualization with drill-down support.
Uses Recharts library with custom styling.

Closes #123
```

```
fix(webhook): correct signature verification

SHA-256 signature verification was failing for GitHub webhooks
due to incorrect header parsing.

Fixes #456
```

```
docs(api): update data connector examples

Added examples for custom authentication headers and
improved error handling documentation.
```

### Commit Best Practices

- Write clear, descriptive commit messages
- Keep commits focused (one logical change per commit)
- Reference issue numbers when applicable
- Use present tense ("add feature" not "added feature")
- Keep subject line under 72 characters

## Pull Request Process

### Before Submitting

1. **Create a branch**:
   ```bash
   git checkout -b feature/my-feature
   # or
   git checkout -b fix/my-bug-fix
   ```

2. **Make your changes**:
   - Follow coding standards
   - Add/update tests if applicable
   - Update documentation

3. **Test your changes**:
   ```bash
   npm run dev      # Test in browser
   npm run build    # Verify build works
   npm run lint     # Check for linting errors
   ```

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add my feature"
   ```

5. **Sync with upstream**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

6. **Push to your fork**:
   ```bash
   git push origin feature/my-feature
   ```

### Creating the Pull Request

1. Go to your fork on GitHub
2. Click "Pull Request" button
3. Select your branch
4. Fill out the template:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Code refactoring
- [ ] Performance improvement

## Testing
- [ ] Tested locally
- [ ] Added/updated tests
- [ ] All tests passing

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Closes #123
```

### PR Review Process

1. **Automated checks** will run:
   - TypeScript compilation
   - ESLint
   - Build verification

2. **Maintainers will review**:
   - Code quality
   - Functionality
   - Tests
   - Documentation

3. **Address feedback**:
   - Make requested changes
   - Push updates to your branch
   - Respond to comments

4. **Merge**:
   - Once approved, maintainers will merge
   - Your changes will be in the next release!

## Reporting Bugs

### Before Reporting

1. **Search existing issues** to avoid duplicates
2. **Test in latest version** to see if already fixed
3. **Gather information**:
   - Browser and version
   - Operating system
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots/videos if helpful

### Bug Report Template

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- Browser: Chrome 120
- OS: macOS 14
- Version: 1.0.0

## Screenshots
Add screenshots if helpful

## Additional Context
Any other relevant information
```

## Suggesting Features

### Before Suggesting

1. **Check the roadmap** ([ROADMAP.md](./ROADMAP.md))
2. **Search existing issues** for similar requests
3. **Consider the scope** - does it fit the project vision?

### Feature Request Template

```markdown
## Feature Description
Clear description of the feature

## Use Case
What problem does this solve?
Who would benefit?

## Proposed Solution
How should this work?

## Alternatives Considered
What other approaches were considered?

## Additional Context
Mockups, examples, references
```

## Development Tips

### Debugging

**Use React DevTools**:
- Inspect component props/state
- Profile performance
- Track re-renders

**Check console**:
```typescript
console.log('Debug:', { variable, another })
console.table(arrayData)
console.group('API Call')
// ...
console.groupEnd()
```

**Use breakpoints**:
- Set breakpoints in browser DevTools
- Add `debugger` statement in code

### Testing Locally

**Test different scenarios**:
- Empty states
- Loading states
- Error states
- Large datasets
- Mobile viewport
- Different browsers

**Test data persistence**:
```typescript
// Check Spark KV storage
const keys = await spark.kv.keys()
console.log('Stored keys:', keys)

const value = await spark.kv.get('key-name')
console.log('Value:', value)
```

### Getting Help

- **Documentation**: Check docs first
- **Issues**: Search or create an issue
- **Discussions**: Use GitHub Discussions for questions
- **Code Review**: Ask for early feedback on complex changes

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Given credit in relevant documentation

Significant contributors may be invited to join as maintainers.

## License

By contributing, you agree that your contributions will be licensed under the same MIT License that covers this project.

---

Thank you for contributing to Dashboard VibeCoder! 🎉
