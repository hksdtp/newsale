# Contributing to Qatalog Task Management System

Thank you for your interest in contributing to our project! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- VS Code (recommended)

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/qatalog-login.git`
3. Install dependencies: `npm install`
4. Set up environment: `cp .env.example .env.local`
5. Start development: `npm run dev:full`

## 📋 Development Guidelines

### Code Style
- **TypeScript**: Use strict mode, proper typing
- **React**: Functional components with hooks
- **Styling**: Tailwind CSS classes, no inline styles
- **Naming**: PascalCase for components, camelCase for functions/variables
- **File Structure**: Group related files, use index.ts for exports

### Component Development
```typescript
// ✅ Good
interface ButtonProps {
  variant: 'primary' | 'secondary';
  onClick: () => void;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ variant, onClick, children }) => {
  return (
    <button
      className={`px-4 py-2 rounded ${variant === 'primary' ? 'bg-blue-500' : 'bg-gray-500'}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// ❌ Avoid
export const Button = (props: any) => {
  return <button style={{padding: '8px'}} {...props} />;
};
```

### Testing Requirements
- **Unit Tests**: Required for all new components
- **E2E Tests**: Required for new user flows
- **Coverage**: Maintain >80% test coverage
- **Storybook**: Add stories for UI components

### Commit Guidelines
Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: add new DatePicker component
fix: resolve dropdown positioning issue
docs: update README with new scripts
test: add unit tests for TaskModal
refactor: improve task filtering logic
style: format code with prettier
```

## 🧪 Testing

### Before Submitting
```bash
# Run all checks
npm run lint
npm run type-check
npm run test:all
npm run build
```

### Writing Tests
```typescript
// Unit Test Example
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button variant="primary" onClick={jest.fn()}>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button variant="primary" onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### E2E Test Example
```typescript
// Playwright Test Example
import { test, expect } from '@playwright/test';

test('should create new task', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="create-task-button"]');
  await page.fill('[data-testid="task-name-input"]', 'New Task');
  await page.click('[data-testid="submit-task-button"]');
  await expect(page.locator('text=New Task')).toBeVisible();
});
```

## 🎨 UI/UX Guidelines

### Design Principles
- **macOS/iPhone Inspired**: Clean, minimal, intuitive
- **Dark Theme**: Primary theme with good contrast
- **Accessibility**: WCAG 2.1 AA compliance
- **Responsive**: Mobile-first approach
- **Performance**: 60fps animations, <100ms interactions

### Component Guidelines
- Use semantic HTML elements
- Include proper ARIA labels
- Support keyboard navigation
- Provide loading states
- Handle error states gracefully

### Animation Guidelines
```css
/* ✅ Good - Smooth, purposeful animations */
.modal-enter {
  opacity: 0;
  transform: scale(0.95);
  transition: all 0.2s ease-out;
}

.modal-enter-active {
  opacity: 1;
  transform: scale(1);
}

/* ❌ Avoid - Jarring, slow animations */
.bad-animation {
  transition: all 1s linear;
}
```

## 🗄️ Database Guidelines

### Schema Changes
1. Create migration: `npx supabase migration new description`
2. Write SQL in migration file
3. Test locally: `npm run db:reset`
4. Update TypeScript types: `npm run db:generate-types`

### Migration Example
```sql
-- Add new column
ALTER TABLE tasks ADD COLUMN estimated_hours INTEGER;

-- Create index
CREATE INDEX idx_tasks_estimated_hours ON tasks(estimated_hours);

-- Update existing data
UPDATE tasks SET estimated_hours = 8 WHERE estimated_hours IS NULL;
```

## 📝 Documentation

### Code Documentation
- Use JSDoc for complex functions
- Add README for new features
- Update Storybook stories
- Include usage examples

### Storybook Stories
```typescript
export const Default: Story = {
  args: {
    variant: 'primary',
    children: 'Button Text',
  },
};

export const WithIcon: Story = {
  args: {
    variant: 'primary',
    icon: <PlusIcon />,
    children: 'Add Item',
  },
  parameters: {
    docs: {
      description: {
        story: 'Button with an icon for enhanced visual communication.',
      },
    },
  },
};
```

## 🔄 Pull Request Process

### Before Creating PR
1. Create feature branch: `git checkout -b feature/description`
2. Make changes following guidelines
3. Add/update tests
4. Update documentation
5. Run all checks: `npm run test:all`

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Screenshots
(If applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] Documentation updated
```

### Review Process
1. Automated checks must pass
2. At least one code review required
3. All conversations resolved
4. Up-to-date with main branch

## 🐛 Bug Reports

### Bug Report Template
```markdown
**Describe the bug**
Clear description of the issue

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment:**
- OS: [e.g. macOS]
- Browser: [e.g. Chrome 91]
- Version: [e.g. 1.0.0]

**Additional context**
Any other relevant information
```

## 💡 Feature Requests

### Feature Request Template
```markdown
**Is your feature request related to a problem?**
Description of the problem

**Describe the solution you'd like**
Clear description of desired feature

**Describe alternatives you've considered**
Alternative solutions considered

**Additional context**
Mockups, examples, or other context
```

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

## 📞 Getting Help

- **Questions**: Open a discussion
- **Bugs**: Create an issue
- **Features**: Create a feature request
- **Security**: Email security@company.com

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.
