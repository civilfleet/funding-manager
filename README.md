# Funding Manager

A comprehensive funding management application built with Next.js 15, designed to streamline the relationship between funding providers (Teams) and recipients (Organizations). The platform manages the complete funding lifecycle from application submission to fund disbursement.

## 🎯 Overview

Funding Manager serves three primary user roles:
- **Organizations**: Non-profit entities that submit funding requests
- **Teams**: Funding providers that review and approve requests
- **Admins**: System administrators managing the platform

## ✨ Key Features

- **Funding Request Management**: Complete workflow from submission to approval
- **Document Management**: Secure file uploads and storage with AWS S3
- **Digital Signatures**: Electronic signature workflow for donation agreements
- **Financial Tracking**: Transaction management with receipt tracking
- **Email Notifications**: Automated notifications for status changes and reminders
- **Role-based Access Control**: Secure access management for different user types
- **Real-time Status Updates**: Live tracking of funding request progress

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with email-based login
- **UI**: Tailwind CSS with Radix UI components (shadcn/ui)
- **File Storage**: AWS S3
- **Email**: SMTP via Nodemailer for notifications
- **Monitoring**: Sentry for error tracking
- **Language**: TypeScript

## 🏗 Architecture

### Core Domain Models
- **Organizations**: Non-profit entities submitting funding requests
- **Teams**: Funding providers reviewing applications
- **Users**: Individuals with specific roles and permissions
- **FundingRequests**: Applications with status workflow management
- **DonationAgreements**: Legal agreements with signature tracking
- **Transactions**: Financial transfers with receipt management
- **Files**: Document management with secure storage

### Status Workflow
```
Submitted → Accepted → WaitingForSignature → Approved → FundsDisbursing → Completed
                    ↘ Rejected (possible at any stage)
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- AWS S3 bucket for file storage
- SMTP email service

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd funding-manager
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Environment Setup**

   Copy the environment template and configure your variables:
   ```bash
   cp .env.example .env.local
   ```

   Required environment variables:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/funding_manager"

   # NextAuth
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"

   # AWS S3
   AWS_ACCESS_KEY_ID="your-aws-access-key"
   AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
   AWS_S3_BUCKET_NAME="your-bucket-name"
   AWS_REGION="us-east-1"

   # Email Configuration (SMTP)
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_SECURE="false"
   SMTP_USER="your-smtp-username"
   SMTP_PASS="your-smtp-password"
   SMTP_FROM="noreply@yourdomain.com"

   # Sentry (optional)
   SENTRY_DSN="your-sentry-dsn"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run database migrations
   npx prisma migrate dev

   # (Optional) Open Prisma Studio
   npx prisma studio
   ```

5. **Start Development Server**
   ```bash
   yarn dev
   ```

   The application will be available at `http://localhost:3000`

## 📜 Available Scripts

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

## 📁 Project Structure

```
├── app/                 # Next.js App Router
│   ├── admin/          # Admin dashboard pages
│   ├── organizations/  # Organization-specific pages
│   ├── teams/         # Team-specific pages
│   └── api/           # API endpoints
├── components/         # Reusable UI components
│   ├── ui/            # Base UI components (shadcn/ui)
│   ├── forms/         # Form components with validation
│   └── table/         # Data table components
├── services/          # Business logic layer
├── lib/              # Utilities (Prisma, S3, etc.)
├── types/            # TypeScript type definitions
├── validations/      # Zod schemas for validation
├── prisma/           # Database schema and migrations
└── templates/        # Email templates
```

## 🔐 Authentication & Authorization

- **Email-based Authentication**: Secure login via NextAuth.js
- **Role-based Access Control**: Organization, Team, and Admin roles
- **Route Protection**: Middleware handles access control and redirects
- **Session Management**: Includes user roles, organizationId, and teamId

## 📧 Email Configuration

The application uses SMTP for sending emails. Configure these variables:

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-smtp-username"
SMTP_PASS="your-smtp-password"
SMTP_FROM="noreply@yourdomain.com"
```

**Common SMTP Providers:**
- **Gmail**: `smtp.gmail.com:587` (requires app-specific password, `SMTP_SECURE="false"`)
- **Outlook**: `smtp-mail.outlook.com:587` (`SMTP_SECURE="false"`)
- **SendGrid**: `smtp.sendgrid.net:587` (`SMTP_SECURE="false"`)
- **Mailgun**: `smtp.mailgun.org:587` (`SMTP_SECURE="false"`)
- **Brevo**: `smtp-relay.brevo.com:587` (`SMTP_SECURE="false"`)
- **Amazon SES**: `email-smtp.[region].amazonaws.com:587` (`SMTP_SECURE="false"`)

**Port Settings:**
- Port 587: Use `SMTP_SECURE="false"` (STARTTLS)
- Port 465: Use `SMTP_SECURE="true"` (SSL/TLS)

**Note**: If SMTP is not configured, the application will attempt to use localhost:25, which will likely fail. At least one email provider must be configured for the application to send emails.

## 🚀 Deployment

The application is designed to be deployed on platforms that support Next.js:

### Environment Variables for Production

Ensure all required environment variables are configured in your deployment environment. Pay special attention to:

- `NEXTAUTH_URL`: Must match your production domain
- `DATABASE_URL`: Production database connection string
- AWS credentials and S3 bucket configuration
- Email service configuration

### Database Migrations

Run migrations in production:
```bash
npx prisma migrate deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Code Conventions

- Follow TypeScript strict typing
- Use Tailwind CSS exclusively for styling
- Implement early returns for better readability
- Use const arrow functions over function declarations
- Prefix event handlers with "handle"
- Include accessibility features on interactive elements

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Issues & Support

If you encounter any issues or have questions, please [open an issue](../../issues) on GitHub.