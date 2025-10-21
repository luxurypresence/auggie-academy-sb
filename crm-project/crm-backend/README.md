# CRM Backend - NestJS with GraphQL and Sequelize

A CRM (Customer Relationship Management) backend application built with NestJS, featuring GraphQL API, Sequelize ORM, and PostgreSQL database.

## Tech Stack

- **NestJS** - Progressive Node.js framework
- **GraphQL** - API query language with Apollo Server
- **Sequelize** - TypeScript ORM for PostgreSQL
- **PostgreSQL** - Relational database
- **pnpm** - Fast, disk space efficient package manager
- **TypeScript** - Typed superset of JavaScript

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- pnpm (v8 or higher)
- PostgreSQL (v14 or higher)

## Database Setup

1. Install PostgreSQL if you haven't already
2. Create the database:

```bash
psql -U postgres
CREATE DATABASE crm_db;
\q
```

## Installation

1. Install dependencies:

```bash
pnpm install
```

2. Configure environment variables:

The `.env` file has been created with default values:

```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=crm_db
PORT=3000
```

Update these values according to your PostgreSQL configuration.

## Running the Application

```bash
# Development mode with hot reload
pnpm run start:dev

# Production mode
pnpm run start:prod

# Regular development mode
pnpm run start
```

The application will be available at:
- API: http://localhost:3000
- GraphQL Playground: http://localhost:3000/graphql

## Seeding the Database

The project includes a seed script that populates the database with sample leads and interactions from a CSV file.

### Running the Seed Script

```bash
# Seed the database with sample data
pnpm run seed
```

**⚠️ Warning**: The seed script will drop existing tables and recreate them with fresh data. All existing data will be lost!

### What the Seed Script Does

1. Reads leads from `seed-leads.csv` (15 sample leads included)
2. Creates each lead in the database
3. Generates 2-5 random interactions for each lead
4. Each interaction has a random type (CALL, EMAIL, or MEETING) and date within the last 30 days

### Customizing Seed Data

To add your own leads, edit the `seed-leads.csv` file in the project root:

```csv
firstName,lastName,email,phone,budget,location,status
John,Doe,john.doe@example.com,555-0101,50000.00,San Francisco CA,new
Jane,Smith,jane.smith@example.com,555-0102,75000.00,New York NY,contacted
```

Required fields: `firstName`, `lastName`, `email`
Optional fields: `phone`, `budget`, `location`, `status`

## Project Structure

```
src/
├── leads/
│   ├── dto/
│   │   ├── create-lead.input.ts        # Input type for creating leads
│   │   └── update-lead.input.ts        # Input type for updating leads
│   ├── leads.module.ts                 # Leads module
│   ├── leads.resolver.ts               # GraphQL resolver for leads
│   └── leads.service.ts                # Business logic for leads
├── interactions/
│   ├── dto/
│   │   ├── create-interaction.input.ts # Input type for creating interactions
│   │   └── update-interaction.input.ts # Input type for updating interactions
│   ├── interactions.module.ts          # Interactions module
│   ├── interactions.resolver.ts        # GraphQL resolver for interactions
│   └── interactions.service.ts         # Business logic for interactions
├── models/
│   ├── lead.model.ts                   # Lead model with Sequelize and GraphQL decorators
│   └── interaction.model.ts            # Interaction model with associations
├── app.module.ts                       # Root module with database and GraphQL configuration
├── app.controller.ts                   # Basic HTTP controller
├── app.service.ts                      # Basic service
└── main.ts                             # Application entry point
```

## Features

### Lead Model

The application includes a Lead model with the following fields:

- `id` (Integer, Primary Key, Auto-increment)
- `firstName` (String, Required)
- `lastName` (String, Required)
- `email` (String, Required, Unique)
- `phone` (String, Optional)
- `budget` (Decimal, Optional)
- `location` (String, Optional)
- `status` (String, Required, Default: 'new')
- `createdAt` (DateTime, Auto-generated)
- `updatedAt` (DateTime, Auto-generated)
- `interactions` (Relation, One-to-Many with Interaction)

### Interaction Model

The application includes an Interaction model to track communications with leads:

- `id` (Integer, Primary Key, Auto-increment)
- `type` (Enum: 'call', 'email', 'meeting', Required)
- `date` (DateTime, Required)
- `notes` (Text, Optional)
- `leadId` (Integer, Foreign Key, Required)
- `lead` (Relation, Many-to-One with Lead)
- `createdAt` (DateTime, Auto-generated)

### GraphQL API

Access the GraphQL Playground at http://localhost:3000/graphql to explore and test the API.

#### Available Queries

**Leads:**
- `leads` - Get all leads
- `lead(id: Int!)` - Get a single lead by ID

**Interactions:**
- `interactions` - Get all interactions
- `interaction(id: Int!)` - Get a single interaction by ID
- `interactionsByLead(leadId: Int!)` - Get all interactions for a specific lead

#### Available Mutations

**Leads:**
- `createLead(createLeadInput: CreateLeadInput!)` - Create a new lead
- `updateLead(updateLeadInput: UpdateLeadInput!)` - Update an existing lead
- `removeLead(id: Int!)` - Delete a lead

**Interactions:**
- `createInteraction(createInteractionInput: CreateInteractionInput!)` - Create a new interaction
- `updateInteraction(updateInteractionInput: UpdateInteractionInput!)` - Update an existing interaction
- `removeInteraction(id: Int!)` - Delete an interaction

## Testing the API

Once your application is running, open http://localhost:3000/graphql in your browser to access the GraphQL Playground. Here are some example queries and mutations to test the functionality:

### 1. Query All Leads

```graphql
query {
  leads {
    id
    firstName
    lastName
    email
    phone
    budget
    location
    status
    createdAt
    updatedAt
  }
}
```

### 2. Create a New Lead

```graphql
mutation {
  createLead(createLeadInput: {
    firstName: "Jane"
    lastName: "Smith"
    email: "jane@example.com"
    phone: "555-5678"
    budget: 50000.00
    location: "San Francisco, CA"
  }) {
    id
    firstName
    lastName
    email
    phone
    budget
    location
    status
  }
}
```

### 3. Query a Single Lead by ID

```graphql
query {
  lead(id: 1) {
    id
    firstName
    lastName
    email
    phone
    budget
    location
    status
    createdAt
    updatedAt
  }
}
```

### 4. Update a Lead

```graphql
mutation {
  updateLead(updateLeadInput: {
    id: 1
    status: "contacted"
    phone: "555-9999"
    budget: 75000.00
  }) {
    id
    firstName
    lastName
    email
    status
    phone
    budget
    updatedAt
  }
}
```

### 5. Create an Interaction

```graphql
mutation {
  createInteraction(createInteractionInput: {
    type: CALL
    date: "2025-10-20T10:00:00Z"
    notes: "Initial contact call. Lead expressed interest in our services."
    leadId: 1
  }) {
    id
    type
    date
    notes
    leadId
    createdAt
  }
}
```

### 6. Query All Interactions

```graphql
query {
  interactions {
    id
    type
    date
    notes
    leadId
    lead {
      firstName
      lastName
      email
    }
    createdAt
  }
}
```

### 7. Query Interactions by Lead

```graphql
query {
  interactionsByLead(leadId: 1) {
    id
    type
    date
    notes
    createdAt
  }
}
```

### 8. Query Lead with All Interactions

```graphql
query {
  lead(id: 1) {
    id
    firstName
    lastName
    email
    phone
    budget
    location
    status
    interactions {
      id
      type
      date
      notes
      createdAt
    }
  }
}
```

### 9. Delete a Lead

```graphql
mutation {
  removeLead(id: 1)
}
```

### Important Notes

**Leads:**
- **Unique Email Constraint**: Each lead must have a unique email address. If you try to create a lead with an existing email, you'll receive a validation error.
- **Required Fields**: When creating a lead, `firstName`, `lastName`, and `email` are required fields.
- **Optional Fields**: `phone`, `budget`, `location`, and `status` are optional. If `status` is not provided, it defaults to `'new'`.

**Interactions:**
- **Required Fields**: When creating an interaction, `type`, `date`, and `leadId` are required fields.
- **Interaction Types**: The `type` field must be one of: `CALL`, `EMAIL`, or `MEETING` (uppercase).
- **Foreign Key**: Each interaction must be associated with a valid lead via the `leadId` field.
- **Cascade Delete**: When a lead is deleted, all associated interactions are automatically deleted.

## Database Migrations

Sequelize is configured with `synchronize: true` for development, which automatically syncs your models with the database. For production, you should:

1. Set `synchronize: false`
2. Use proper migration files
3. Run migrations manually

## Development Commands

```bash
# Start development server
pnpm run start:dev

# Build the project
pnpm run build

# Seed the database with sample data
pnpm run seed

# Run unit tests
pnpm run test

# Run e2e tests
pnpm run test:e2e

# Run test coverage
pnpm run test:cov

# Lint the code
pnpm run lint

# Format the code
pnpm run format
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DB_HOST | Database host | localhost |
| DB_PORT | Database port | 5432 |
| DB_USERNAME | Database username | postgres |
| DB_PASSWORD | Database password | postgres |
| DB_NAME | Database name | crm_db |
| PORT | Application port | 3000 |

## Next Steps

To extend this application, consider:

1. ✅ ~~Creating a Leads module with GraphQL resolvers and services~~ (Completed)
2. ✅ ~~Adding CRUD operations for Leads~~ (Completed)
3. Implementing authentication and authorization (JWT, OAuth)
4. Adding more models (Contacts, Companies, Deals, Opportunities, etc.)
5. Setting up proper database migrations for production
6. Adding validation pipes and DTOs with class-validator
7. Implementing better error handling and custom exceptions
8. Adding logging with Winston or Pino
9. Setting up Docker for easier deployment
10. Adding pagination and filtering for queries
11. Implementing real-time subscriptions with GraphQL
12. Adding unit and integration tests
13. Setting up CI/CD pipeline

## Troubleshooting

### Database Connection Issues

If you encounter database connection errors:

1. Verify PostgreSQL is running: `pg_isready`
2. Check your `.env` file credentials
3. Ensure the database `crm_db` exists
4. Verify PostgreSQL is accepting connections on localhost:5432

### GraphQL Schema Issues

If the GraphQL schema doesn't generate properly:

1. Ensure all models have `@ObjectType()` and `@Field()` decorators
2. Check that models are imported in `app.module.ts`
3. Restart the development server

### Unique Constraint Errors

If you see a `SequelizeUniqueConstraintError` about duplicate email:

1. This is expected behavior - the email field has a unique constraint
2. Each lead must have a unique email address
3. Use a different email address when creating new leads
4. To query existing leads, use the `leads` query to see what's already in the database

## License

This project is MIT licensed.
