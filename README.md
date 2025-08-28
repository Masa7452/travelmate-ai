# TravelMate AI

An AI-powered travel companion application built with Next.js, TypeScript, and Supabase.

## Features

- **Travel Planning**: Create and manage personalized travel itineraries
- **AI Recommendations**: Get intelligent suggestions for destinations and activities
- **Trip Management**: Organize and track your trips in one place
- **Explore Mode**: Discover new destinations and travel ideas

## Tech Stack

- **Framework**: Next.js 15.5 with App Router
- **Language**: TypeScript 5
- **Database**: Supabase
- **Styling**: Tailwind CSS v4
- **State Management**: TanStack Query
- **Testing**: Vitest + Testing Library + Playwright
- **Package Manager**: pnpm

## Prerequisites

- Node.js 18.x or higher
- pnpm 8.x or higher
- Supabase account (for backend services)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/travelmate-ai.git
cd travelmate-ai
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your environment variables in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# Add other required environment variables
```

## Development

Start the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm typecheck` - Check TypeScript types
- `pnpm test` - Run unit tests
- `pnpm test:e2e` - Run end-to-end tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm format` - Format code with Prettier
- `pnpm check` - Run lint, typecheck, and tests
- `pnpm verify` - Run all checks including e2e tests

## Project Structure

```
travelmate-ai/
├── src/
│   ├── app/             # Next.js App Router pages and API routes
│   │   ├── api/         # API endpoints
│   │   ├── explore/     # Explore feature
│   │   ├── my-trips/    # Trip management
│   │   └── plan/        # Trip planning
│   ├── Core/            # Core business logic
│   ├── Shared/          # Shared utilities and components
│   └── test/            # Test utilities
├── tests/               # E2E tests
├── docs/                # Documentation
└── CLAUDE.md            # Development guidelines
```

## Testing

The project follows Test-Driven Development (TDD) principles:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run e2e tests
pnpm test:e2e
```

## Code Quality

Pre-commit hooks ensure code quality:
- ESLint for code linting
- TypeScript for type checking
- Prettier for code formatting
- Tests must pass

## Contributing

1. Follow TDD principles - write tests first
2. Ensure all tests pass (`pnpm check`)
3. Follow the conventions in `CLAUDE.md`
4. Use conventional commits format
5. Keep PRs small and focused

## Architecture

The application follows clean architecture principles:

- **Core Layer**: Domain models and business logic
- **Application Layer**: Use cases and application services
- **Infrastructure Layer**: External services (Supabase, APIs)
- **Presentation Layer**: Next.js pages and components

## License

Private - All rights reserved

## Support

For issues and questions, please open an issue in the GitHub repository.
