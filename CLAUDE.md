# bzr-portal Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-10-21

## Active Technologies
- TypeScript 5.0+ (strict mode), Node.js 20+ / Bun runtime + React 18+, Fastify (or Hono), Drizzle ORM, TanStack Query, Zustand, shadcn/ui, Tailwind CSS, docx-templates, AWS SDK v3 (@aws-sdk/client-s3) for Wasabi storage (main)
- TypeScript 5.0+ (strict mode), Node.js 20+ + Hono (API framework for Vercel serverless), Drizzle ORM (with Drizzle Kit for migrations), docx-templates (Mustache-based DOCX templating), AWS SDK v3 (@aws-sdk/client-s3, @aws-sdk/s3-request-presigner for Wasabi S3 integration), Resend (transactional email), React 18+ with Vite (frontend), TanStack Query (data fetching), Zustand (state management), shadcn/ui + Tailwind CSS (UI components), React Hook Form + Zod (validation) (main)
- PostgreSQL (Supabase) for ContactFormSubmission entity (main)

## Project Structure
```
backend/
frontend/
tests/
```

## Commands
npm test; npm run lint

## Code Style
TypeScript 5.0+ (strict mode), Node.js 20+ / Bun runtime: Follow standard conventions

## Recent Changes
- main: Added TypeScript 5.0+ (strict mode), Node.js 20+
- main: Added TypeScript 5.0+ (strict mode), Node.js 20+ + Hono (API framework for Vercel serverless), Drizzle ORM (with Drizzle Kit for migrations), docx-templates (Mustache-based DOCX templating), AWS SDK v3 (@aws-sdk/client-s3, @aws-sdk/s3-request-presigner for Wasabi S3 integration), Resend (transactional email), React 18+ with Vite (frontend), TanStack Query (data fetching), Zustand (state management), shadcn/ui + Tailwind CSS (UI components), React Hook Form + Zod (validation)
- main: Added TypeScript 5.0+ (strict mode), Node.js 20+ / Bun runtime + React 18+, Fastify (or Hono), Drizzle ORM, TanStack Query, Zustand, shadcn/ui, Tailwind CSS, docx-templates

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
