# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a funding management application built with Next.js 15, focusing on managing funding requests, donation agreements, and organizational relationships. The application serves three primary user roles: Organizations (funding recipients), Teams (funding providers), and Admins (system administrators).

## Development Commands

```bash
# Development server with Turbopack
yarn dev

# Build the application
yarn build

# Start production server
yarn start

# Run linting
yarn lint

# Database operations
npx prisma generate      # Generate Prisma client
npx prisma migrate dev   # Run database migrations
npx prisma db push       # Push schema changes to database
npx prisma studio        # Open Prisma Studio
```

## Architecture Overview

### Core Domain Models
- **Organizations**: Non-profit entities that submit funding requests
- **Teams**: Funding providers that review and approve requests
- **Users**: Individuals with roles (Organization, Team, Admin)
- **FundingRequests**: Applications for funding with status workflow
- **DonationAgreements**: Legal agreements between teams and organizations
- **Transactions**: Financial transfers with receipt tracking
- **Files**: Document management with S3 storage

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with email-based login
- **UI**: Tailwind CSS with Radix UI components (shadcn/ui)
- **File Storage**: AWS S3
- **Email**: Brevo/Nodemailer for notifications
- **Monitoring**: Sentry for error tracking

### Project Structure
- `app/` - Next.js App Router pages and API routes
  - `admin/` - Admin dashboard pages
  - `organizations/[organizationId]/` - Organization-specific pages
  - `teams/[teamId]/` - Team-specific pages
  - `api/` - API endpoints for all entities
- `components/` - Reusable UI components
  - `ui/` - Base UI components (shadcn/ui)
  - `forms/` - Form components with validation
  - `table/` - Data table components
- `services/` - Business logic layer for each domain
- `lib/` - Utilities (Prisma client, S3 client, etc.)
- `types/` - TypeScript type definitions
- `validations/` - Zod schemas for form validation
- `prisma/` - Database schema and migrations

### Authentication & Authorization
- Email-based authentication via NextAuth.js
- Role-based access control (Organization, Team, Admin)
- Middleware handles route protection and role-based redirects
- Sessions include user roles, organizationId, and teamId

### Database Schema
Key relationships:
- Users belong to Organizations and/or Teams (many-to-many)
- Organizations belong to Teams (many-to-one)
- FundingRequests belong to Organizations
- DonationAgreements link FundingRequests with signature tracking
- Transactions track financial transfers between Teams and Organizations

### Status Workflows
FundingRequest statuses:
- Submitted → Accepted → WaitingForSignature → Approved → FundsDisbursing → Completed
- Can be Rejected at any stage

### Code Conventions
- Follow existing Cursor rules in `.cursor/rules/nextjs.mdc`
- Use TypeScript with strict typing
- Implement early returns for better readability
- Use Tailwind classes exclusively for styling
- Descriptive naming with "handle" prefix for event functions
- Implement accessibility features on interactive elements
- Use const arrow functions over function declarations

### Email System
- Template-based emails using Handlebars
- Templates stored in `templates/` directory
- Email notifications for funding status changes, document uploads, reminders
- Team-specific email template management

### File Management
- AWS S3 integration for file storage
- Pre-signed URLs for secure uploads
- File type classification (tax certificates, reports, receipts, etc.)
- Automatic file association with organizations and funding requests

### Testing
No test framework is currently configured. Check with the user before setting up testing infrastructure.