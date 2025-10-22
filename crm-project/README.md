# CRM System - Auggie Academy

A full-stack Customer Relationship Management (CRM) system built with modern web technologies. This project features a GraphQL API backend and a responsive React frontend for managing sales leads and tracking customer interactions.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Development](#development)
- [Testing](#testing)
- [API Documentation](#api-documentation)
- [Production Readiness](#production-readiness)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

This CRM system provides a complete solution for managing sales leads and tracking all interactions with potential customers. It includes:

- **Backend API**: NestJS-based GraphQL API with PostgreSQL database
- **Frontend Application**: Modern React application with real-time updates
- **Data Management**: Full CRUD operations for leads and interactions
- **Interaction Tracking**: Record calls, emails, and meetings with leads
- **Status Management**: Track lead progression through the sales pipeline

## ✨ Features

### Lead Management
- ✅ Create, read, update, and delete leads
- ✅ Track lead status (New, Contacted, Qualified, Proposal, Negotiation, Won, Lost)
- ✅ Store contact information (name, email, phone, location)
- ✅ Budget tracking
- ✅ Search and filter leads
- ✅ Pagination for large datasets

### Interaction Tracking
- ✅ Record interactions: Calls, Emails, Meetings
- ✅ Add notes to each interaction
- ✅ Timestamp tracking for all interactions
- ✅ View complete interaction history per lead
- ✅ Relationship linking between leads and interactions

### User Interface
- ✅ Modern, responsive design
- ✅ Clean, intuitive navigation
- ✅ Loading states with skeleton loaders
- ✅ Toast notifications for user feedback
- ✅ Page transitions and animations
- ✅ Mobile-first responsive design
- ✅ Error boundaries for graceful error handling
- ✅ Dark mode ready (theme system in place)

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CRM System                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────┐         ┌─────────────────┐      │
│  │                 │         │                 │      │
│  │    Frontend     │◄───────►│    Backend      │      │
│  │   (React UI)    │  HTTP   │  (NestJS API)   │      │
│  │                 │ GraphQL │                 │      │
│  │  Port: 5173     │         │  Port: 3000     │      │
│  │                 │         │                 │      │
│  └─────────────────┘         └────────┬────────┘      │
│                                       │               │
│                                       │               │
│                              ┌────────▼────────┐      │
│                              │                 │      │
│                              │   PostgreSQL    │      │
│                              │    Database     │      │
│                              │                 │      │
│                              │  Port: 5432     │      │
│                              │                 │      │
│                              └─────────────────┘      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Data Flow
1. **User Interaction**: User interacts with React frontend
2. **GraphQL Request**: Frontend sends GraphQL query/mutation to backend
3. **Business Logic**: NestJS processes request through services
4. **Database Operation**: Sequelize ORM interacts with PostgreSQL
5. **Response**: Data flows back through the stack to the UI

## 🛠️ Technology Stack

### Backend (`crm-backend/`)
- **Framework**: NestJS v11.0.1
- **API Layer**: GraphQL with Apollo Server v5.0.0
- **Database**: PostgreSQL (v14 or higher recommended)
- **ORM**: Sequelize v6.37.7 with sequelize-typescript v2.1.6
- **Language**: TypeScript v5.7.3
- **Testing**: Jest v30.0.0
- **Package Manager**: pnpm

### Frontend (`crm-frontend/`)
- **Framework**: React v19.1.1
- **Language**: TypeScript v5.9.3
- **Build Tool**: Vite v7.1.7
- **Styling**: Tailwind CSS v3.4.16
- **Components**: shadcn/ui (Radix UI primitives)
- **GraphQL Client**: Apollo Client v3.12.3
- **Routing**: React Router v7.9.4
- **Animations**: Framer Motion v12.23.24
- **Notifications**: Sonner v2.0.7
- **Date Handling**: date-fns v4.1.0
- **Icons**: Lucide React v0.546.0
- **Package Manager**: pnpm

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18 or higher ([Download](https://nodejs.org/))
- **pnpm**: v8 or higher ([Installation](https://pnpm.io/installation))
  ```bash
  npm install -g pnpm
  ```
- **PostgreSQL**: v14 or higher ([Download](https://www.postgresql.org/download/))
- **Git**: For version control ([Download](https://git-scm.com/))

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd crm-project
```

### 2. Database Setup

```bash
# Start PostgreSQL service (if not running)
# macOS:
brew services start postgresql@14

# Linux:
sudo systemctl start postgresql

# Windows: Start PostgreSQL from Services

# Create the database
psql -U postgres
CREATE DATABASE crm_db;
\q
```

### 3. Backend Setup

```bash
cd crm-backend

# Install dependencies
pnpm install

# Configure environment variables
# Update .env file with your PostgreSQL credentials
# Default values:
# DB_HOST=localhost
# DB_PORT=5432
# DB_USERNAME=postgres
# DB_PASSWORD=postgres
# DB_NAME=crm_db
# PORT=3000

# Start the backend server
pnpm run start:dev
```

The backend will be available at: **http://localhost:3000**
GraphQL Playground: **http://localhost:3000/graphql**

### 4. Seed the Database (Optional)

```bash
# From the crm-backend directory
pnpm run seed
```

This will populate the database with 15 sample leads and ~50 interactions.

### 5. Frontend Setup

```bash
# Open a new terminal
cd crm-frontend

# Install dependencies
pnpm install

# Start the frontend server
pnpm run dev
```

The frontend will be available at: **http://localhost:5173**

### 6. Access the Application

Open your browser and navigate to **http://localhost:5173**

## 📁 Project Structure

```
crm-project/
├── crm-backend/                    # Backend API
│   ├── src/
│   │   ├── leads/                  # Lead management module
│   │   │   ├── dto/               # Data Transfer Objects
│   │   │   ├── leads.module.ts
│   │   │   ├── leads.resolver.ts  # GraphQL resolver
│   │   │   ├── leads.service.ts   # Business logic
│   │   │   └── leads.service.spec.ts
│   │   ├── interactions/          # Interaction tracking module
│   │   │   ├── dto/
│   │   │   ├── interactions.module.ts
│   │   │   ├── interactions.resolver.ts
│   │   │   ├── interactions.service.ts
│   │   │   └── interactions.service.spec.ts
│   │   ├── models/                # Database models
│   │   │   ├── lead.model.ts
│   │   │   └── interaction.model.ts
│   │   ├── app.module.ts          # Root module
│   │   ├── main.ts                # Application entry
│   │   └── seed.ts                # Database seeding
│   ├── test/                      # E2E tests
│   ├── .env                       # Environment variables
│   ├── package.json
│   ├── README.md                  # Backend documentation
│   └── current_implementation.md  # Detailed implementation docs
│
├── crm-frontend/                  # Frontend application
│   ├── src/
│   │   ├── components/            # React components
│   │   │   ├── ui/               # shadcn/ui components
│   │   │   ├── Layout.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── PageTransition.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   ├── pages/                # Route pages
│   │   │   ├── LeadList.tsx
│   │   │   ├── LeadDetail.tsx
│   │   │   ├── CreateLead.tsx
│   │   │   ├── EditLead.tsx
│   │   │   └── AddInteraction.tsx
│   │   ├── graphql/              # GraphQL queries/mutations
│   │   │   ├── leads.ts
│   │   │   └── interactions.ts
│   │   ├── types/                # TypeScript types
│   │   │   └── lead.ts
│   │   ├── lib/                  # Utilities
│   │   │   ├── apollo-client.ts
│   │   │   └── utils.ts
│   │   ├── App.tsx               # Router configuration
│   │   ├── main.tsx              # App entry point
│   │   └── index.css             # Global styles
│   ├── package.json
│   ├── README.md                 # Frontend documentation
│   ├── IMPLEMENTATION_PLAN.md    # Setup plan
│   ├── PROGRESS.md               # Progress tracker
│   └── TESTING_RESULTS.md        # Test results
│
└── README.md                     # This file
```

## 💻 Development

### Backend Development

```bash
cd crm-backend

# Development mode with hot reload
pnpm run start:dev

# Build for production
pnpm run build

# Start production build
pnpm run start:prod

# Run unit tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Generate test coverage
pnpm run test:cov

# Run E2E tests
pnpm run test:e2e

# Lint code
pnpm run lint

# Format code
pnpm run format

# Seed database
pnpm run seed
```

### Frontend Development

```bash
cd crm-frontend

# Development mode
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview

# Run linter
pnpm run lint
```

### Environment Variables

#### Backend `.env`
```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=crm_db

# Application Configuration
PORT=3000
```

#### Frontend `.env` (Optional)
```bash
VITE_API_URL=http://localhost:3000/graphql
```

## 🧪 Testing

### Backend Tests

The backend includes comprehensive unit tests for the leads service:

```bash
cd crm-backend

# Run all tests
pnpm run test

# Run tests with coverage
pnpm run test:cov

# Run specific test file
pnpm run test leads.service.spec.ts
```

**Test Coverage**:
- ✅ 17 test cases for LeadsService
- ✅ Tests for create, read, update, delete operations
- ✅ Error handling tests
- ✅ Edge case coverage

### Frontend Tests

The frontend has been manually tested with Playwright:

**Verified Features**:
- ✅ Application loading and rendering
- ✅ Navigation between routes
- ✅ Lead list with search and filtering
- ✅ Lead detail page with interactions
- ✅ Create/Edit lead forms
- ✅ Add interaction functionality
- ✅ Toast notifications
- ✅ Loading states and error boundaries

See `crm-frontend/TESTING_RESULTS.md` for detailed test results.

## 📚 API Documentation

### GraphQL API

Access the GraphQL Playground at **http://localhost:3000/graphql** when the backend is running.

### Available Operations

#### Queries

**Leads:**
```graphql
# Get all leads
leads: [Lead!]!

# Get single lead by ID
lead(id: Int!): Lead
```

**Interactions:**
```graphql
# Get all interactions
interactions: [Interaction!]!

# Get single interaction
interaction(id: Int!): Interaction

# Get interactions for a lead
interactionsByLead(leadId: Int!): [Interaction!]!
```

#### Mutations

**Leads:**
```graphql
# Create new lead
createLead(createLeadInput: CreateLeadInput!): Lead!

# Update lead
updateLead(updateLeadInput: UpdateLeadInput!): Lead!

# Delete lead
removeLead(id: Int!): Boolean!
```

**Interactions:**
```graphql
# Create interaction
createInteraction(createInteractionInput: CreateInteractionInput!): Interaction!

# Update interaction
updateInteraction(updateInteractionInput: UpdateInteractionInput!): Interaction!

# Delete interaction
removeInteraction(id: Int!): Boolean!
```

### Example Queries

See detailed examples in `crm-backend/README.md` sections on testing the API.

## 🚦 Production Readiness

### Current Status

**Frontend**: ✅ **Production Ready**
- All features complete (Phases 1-5)
- Performance optimized with code splitting
- Error boundaries implemented
- Loading states and animations
- Mobile-responsive design
- Toast notifications
- Production build verified

**Backend**: ⚠️ **Development Ready - Requires Hardening**
- Core functionality complete
- Well-structured and tested
- Missing production features:
  - Authentication & Authorization
  - Input validation (email format, phone, budget range)
  - Pagination
  - Filtering and sorting
  - Security measures (CORS, rate limiting)
  - Database migrations (currently uses `synchronize: true`)
  - Performance optimization (caching, indexes)
  - Logging and monitoring
  - Error handling improvements

### Production Checklist

See `crm-backend/current_implementation.md` for a detailed production readiness checklist and recommendations.

**Estimated Time to Production**: 7-11 weeks

**Recommended Phases**:
1. Security (2-3 weeks) - Authentication, validation, CORS
2. Database (1-2 weeks) - Migrations, indexes
3. Scalability (2-3 weeks) - Pagination, caching, filtering
4. Production Readiness (2-3 weeks) - Logging, monitoring, reliability

## 🐛 Troubleshooting

### Backend Issues

**Database Connection Errors**:
```bash
# Check PostgreSQL is running
pg_isready

# Verify credentials in .env file
cat .env

# Test database connection
psql -U postgres -d crm_db
```

**GraphQL Schema Issues**:
```bash
# Restart the development server
pnpm run start:dev
```

**Port Already in Use**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Frontend Issues

**Backend Connection Error**:
- Ensure backend is running at http://localhost:3000
- Check CORS is enabled in backend (`main.ts`)
- Verify GraphQL endpoint is accessible

**Port Already in Use**:
- Vite will automatically try the next available port (5174, 5175, etc.)
- Check terminal output for the actual port

**Missing Dependencies**:
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**Build Errors**:
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Reinstall dependencies
pnpm install
```

## 🤝 Contributing

### Development Workflow

1. Create a new branch for your feature
2. Make changes and test locally
3. Run tests and linting
4. Submit a pull request

### Code Style

**Backend**:
- Follow NestJS best practices
- Use TypeScript strict mode
- Write unit tests for services
- Document complex business logic

**Frontend**:
- Follow React best practices
- Use TypeScript for type safety
- Use shadcn/ui components when possible
- Maintain responsive design
- Add loading states for async operations

## 🔮 Future Enhancements

### Planned Features
- [ ] Dashboard with analytics and charts
- [ ] Contacts management separate from leads
- [ ] Opportunities pipeline with drag-and-drop
- [ ] Reports and data exports (CSV, PDF)
- [ ] Advanced filtering and sorting
- [ ] Bulk operations (import/export, mass updates)
- [ ] Real-time updates with GraphQL subscriptions
- [ ] File attachments for leads and interactions
- [ ] Email integration (send emails directly from CRM)
- [ ] Calendar integration
- [ ] Activity timeline
- [ ] Lead assignment to sales reps
- [ ] Notifications system
- [ ] User roles and permissions

### Technical Improvements
- [ ] Authentication system (JWT, OAuth)
- [ ] Database migrations
- [ ] API documentation with GraphQL schema docs
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Comprehensive E2E tests
- [ ] Performance monitoring
- [ ] Error tracking (Sentry)
- [ ] Application logging (Winston/Pino)
- [ ] Rate limiting
- [ ] API versioning

## 📄 License

This project is part of the Auggie Academy CRM training program.

## 📞 Support

For issues and questions:
- Check the troubleshooting section above
- Review backend docs: `crm-backend/README.md`
- Review frontend docs: `crm-frontend/README.md`
- Review implementation details: `crm-backend/current_implementation.md`

---

**Built with ❤️ for Auggie Academy**
