# BZR Portal - AI-Powered Risk Assessment Platform

> Sistem za automatizovanu izradu Akta o proceni rizika u skladu sa srpskim zakonodavstvom (Zakon o bezbednosti i zdravlju na radu Sl. glasnik RS 101/2005, 91/2015, 113/2017)

## Features

- ✅ Legally compliant risk assessment document generation (Serbian BZR law)
- 🧮 E×P×F risk calculation methodology with real-time validation
- 📄 DOCX document generation with legal template structure
- 🤖 AI-powered hazard suggestions (Phase 2)
- 📊 Excel import for work position systematization
- 🔐 GDPR-compliant data protection (JMBG encryption, audit logs)
- 🌐 Serbian Cyrillic language support

## Tech Stack

### Backend
- **Runtime**: Node.js 20+ / Bun
- **Framework**: Hono
- **Database**: PostgreSQL 16+ with Drizzle ORM
- **API**: tRPC (type-safe)
- **Document Generation**: docx-templates
- **AI**: Anthropic Claude
- **Language**: TypeScript 5.0+ (strict mode)

### Frontend
- **Framework**: React 18+ with Vite
- **State Management**: Zustand + TanStack Query
- **UI**: shadcn/ui + Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **Language**: TypeScript 5.0+ (strict mode)

## Project Structure

```
bzr-portal/
├── backend/           # Backend API server
│   ├── src/
│   │   ├── db/       # Database schemas and migrations
│   │   ├── services/ # Business logic layer
│   │   ├── api/      # tRPC routes and middleware
│   │   └── lib/      # Utilities, templates, jobs
│   └── tests/        # Unit, contract, integration tests
├── frontend/          # React SPA
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── pages/      # Page components
│   │   ├── hooks/      # Custom React hooks
│   │   └── services/   # API client
│   └── tests/          # E2E tests (Playwright)
├── shared/            # Shared types and validators
└── specs/             # Design specifications
    └── main/
        ├── spec.md           # Feature specification
        ├── plan.md           # Implementation plan
        ├── tasks.md          # Task breakdown (160 tasks)
        ├── data-model.md     # Database schema
        ├── contracts/        # API contracts
        └── checklists/       # Quality checklists
```

## Quick Start

See [quickstart.md](./specs/main/quickstart.md) for detailed setup instructions.

### Prerequisites

- Node.js 20+ or Bun
- PostgreSQL 16+
- npm/yarn/pnpm

### Development

```bash
# Install dependencies
cd backend && npm install
cd frontend && npm install

# Setup environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Run database migrations
cd backend && npm run db:push

# Seed hazard codes
cd backend && npm run db:seed

# Start development servers
cd backend && npm run dev  # Backend on :3000
cd frontend && npm run dev # Frontend on :5173
```

### Testing

```bash
# Backend tests
cd backend && npm test
cd backend && npm run test:coverage

# Frontend E2E tests
cd frontend && npm run test:e2e
```

## Legal Compliance

This system generates "Akt o proceni rizika" documents compliant with:

- **Zakon o bezbednosti i zdravlju na radu** (Sl. glasnik RS 101/2005, 91/2015, 113/2017)
- **Pravilnik o preventivnim merama** (Sl. glasnik RS 5/2018)
- **Pravilnik o načinu i postupku procene rizika** (Sl. glasnik RS 23/2009, 83/2014)

See [Legal Compliance Checklist](./specs/main/checklists/legal-compliance.md) for quality validation.

## Documentation

- [Feature Specification](./specs/main/spec.md)
- [Implementation Plan](./specs/main/plan.md)
- [Task Breakdown](./specs/main/tasks.md) (160 tasks, 8 phases)
- [Data Model](./specs/main/data-model.md)
- [API Contracts](./specs/main/contracts/README.md)
- [Quick Start Guide](./specs/main/quickstart.md)

## Implementation Status

**Current Phase**: Phase 1 - Setup ✅

- [x] Project structure created
- [x] TypeScript configuration
- [x] ESLint + Prettier setup
- [ ] Dependencies installation (next step)
- [ ] Phase 2: Foundational infrastructure
- [ ] Phase 3: User Story 1 (MVP)

See [tasks.md](./specs/main/tasks.md) for full task list.

## MVP Scope (User Story 1)

The MVP enables BZR officers to:

1. Create company profile
2. Define work position
3. Assess risks using E×P×F methodology
4. Generate legally compliant DOCX document
5. Download "Akt o proceni rizika"

**Timeline**: ~10-14 days for MVP (Phases 1-3, Tasks T001-T078)

## Contributing

See [Development Guidelines](./CLAUDE.md) for coding standards.

## License

MIT
