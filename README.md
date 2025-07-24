# Qatalog Task Management System

A modern, comprehensive task management application built with React, TypeScript, and Supabase. Features beautiful macOS/iPhone-inspired UI components, comprehensive testing, and automated development workflows.

## 🚀 Features

- **Modern UI Components**: DatePicker and Dropdown components with macOS/iPhone-like design
- **Task Management**: Create, edit, delete, and organize tasks by teams and locations
- **Advanced Filtering**: Search and filter tasks by status, priority, work type, and more
- **Team Organization**: Manage tasks across different teams and locations (Hà Nội/Hồ Chí Minh)
- **Real-time Updates**: Instant UI updates with localStorage persistence
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Theme**: Beautiful dark theme with smooth animations

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Testing**: Jest, React Testing Library, Playwright
- **Code Quality**: ESLint, Prettier, Husky
- **Documentation**: Storybook
- **Development**: Hot reload, TypeScript strict mode

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Git

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd qatalog-login
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
```

### 3. Database Setup

```bash
# Start local Supabase instance
npm run db:start

# Run migrations
npm run db:migrate

# Seed with sample data
npm run db:seed
```

### 4. Start Development

```bash
# Start both frontend and database
npm run dev:full

# Or start frontend only (uses localStorage)
npm run dev
```

Visit [http://localhost:3003](http://localhost:3003) to see the application.

## 📚 Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run dev:full` - Start both frontend and Supabase
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Testing
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run test:e2e` - Run end-to-end tests
- `npm run test:e2e:ui` - Run E2E tests with UI
- `npm run test:e2e:debug` - Debug E2E tests
- `npm run test:all` - Run all tests

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - TypeScript type checking

### Database
- `npm run db:start` - Start local Supabase
- `npm run db:stop` - Stop local Supabase
- `npm run db:reset` - Reset database with fresh data
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:generate-types` - Generate TypeScript types

### Documentation
- `npm run storybook` - Start Storybook
- `npm run build-storybook` - Build Storybook

## 🧪 Testing

### Unit Tests
```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### End-to-End Tests
```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Debug E2E tests
npm run test:e2e:debug
```

## 🗄️ Database

### Local Development
The project uses Supabase for database management. For local development:

```bash
# Start local Supabase (includes PostgreSQL, Auth, API)
npm run db:start

# Stop local Supabase
npm run db:stop

# Reset database with fresh migrations and seed data
npm run db:reset
```

### Schema
- **teams**: Team information and locations
- **members**: Team members and their roles
- **tasks**: Task details with work types, priorities, and assignments
- **locations**: Location reference data (HN, HCM)

### Migrations
Database migrations are located in `supabase/migrations/`. To create a new migration:

```bash
npx supabase migration new migration_name
```

## 📖 Component Documentation

### Storybook
Interactive component documentation is available via Storybook:

```bash
npm run storybook
```

Visit [http://localhost:6006](http://localhost:6006) to explore components.

### Key Components
- **DatePicker**: macOS-style date picker with quick actions
- **Dropdown**: Customizable dropdown with icons and colors
- **CreateTaskModal**: Comprehensive task creation form
- **TaskList**: Task display with filtering and search
- **TaskDetailModal**: Task details with edit/delete actions

## 🔧 Development Workflow

### Code Quality
The project enforces code quality through:
- **ESLint**: Code linting with TypeScript rules
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks
- **lint-staged**: Staged file linting

### Pre-commit Hooks
Before each commit, the following checks run automatically:
- ESLint fixes
- Prettier formatting
- Related unit tests

### TypeScript
- Strict mode enabled
- Path mapping configured (`@/` for `src/`)
- Type checking in CI/CD

## 🚀 Deployment

### Build
```bash
npm run build
```

### Environment Variables
Required environment variables:
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm run test:all`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Coding Standards
- Use TypeScript strict mode
- Follow ESLint and Prettier configurations
- Write unit tests for new components
- Add Storybook stories for UI components
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

**Port already in use**
```bash
# Kill process on port 3003
lsof -ti:3003 | xargs kill -9
```

**Supabase connection issues**
```bash
# Check Supabase status
npx supabase status

# Restart Supabase
npm run db:stop && npm run db:start
```

**Test failures**
```bash
# Clear Jest cache
npx jest --clearCache

# Update snapshots
npm run test -- --updateSnapshot
```

**TypeScript errors**
```bash
# Check types
npm run type-check

# Restart TypeScript server in VS Code
Ctrl+Shift+P -> "TypeScript: Restart TS Server"
```

### Getting Help
- Check existing [Issues](https://github.com/your-repo/issues)
- Create a new issue with detailed description
- Include error messages and environment details
