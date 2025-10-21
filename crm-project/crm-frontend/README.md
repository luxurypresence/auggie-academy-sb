# CRM Frontend

A modern CRM frontend application built with React, TypeScript, Tailwind CSS, and shadcn/ui.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- pnpm (recommended) or npm
- Backend server running at http://localhost:3000
- PostgreSQL database configured for backend

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

The application will be available at **http://localhost:5173/**

### Other Commands

```bash
# Build for production
pnpm run build

# Preview production build
pnpm run preview

# Run linter
pnpm run lint
```

## 🏗️ Technology Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Apollo Client** - GraphQL client
- **React Router v7** - Routing
- **Framer Motion** - Animations
- **Sonner** - Toast notifications
- **date-fns** - Date formatting
- **Lucide React** - Icons

## 📡 Backend Connection

The frontend connects to the GraphQL backend at:
```
http://localhost:3000/graphql
```

Make sure the backend is running before starting the frontend. See the backend README for setup instructions.

## 🧩 Available Routes

- `/` - Lead list page with search, filtering, and pagination
- `/leads/:id` - Lead detail page with interactions timeline
- `/leads/:id/edit` - Edit lead information
- `/leads/:id/add-interaction` - Add new interaction (call/email/meeting)
- `/leads/new` - Create new lead
- `/dashboard` - Dashboard (placeholder)
- `/contacts` - Contacts (placeholder)
- `/opportunities` - Opportunities (placeholder)
- `/reports` - Reports (placeholder)

## ✨ Features

### Lead Management
- **List View**: Paginated table with search and filtering
- **Detail View**: Complete lead information with interaction history
- **Create/Edit**: Full CRUD operations with form validation
- **Interactions**: Track calls, emails, and meetings
- **Status Management**: Visual status badges (New, Contacted, Qualified, Lost, Converted)

### UI/UX Features
- **Loading States**: Skeleton loaders for better perceived performance
- **Toast Notifications**: User feedback for all actions (success/error)
- **Page Transitions**: Smooth animations between routes
- **Error Boundaries**: Graceful error handling with user-friendly messages
- **Responsive Design**: Mobile-first design that works on all devices
- **Dark Mode Ready**: Theme system with next-themes integration

### Performance
- **Code Splitting**: Lazy-loaded routes for optimal bundle size
- **Optimized Builds**: Production builds with tree-shaking and minification
- **Hot Module Replacement**: Instant updates during development

## 📚 Documentation

- [Implementation Plan](./IMPLEMENTATION_PLAN.md) - Detailed setup plan
- [Progress Log](./PROGRESS.md) - Implementation progress tracker
- [Design Files](./designs/) - UI design references

## 🚧 Current Status

### ✅ Phase 1-5 Complete - Production Ready!

**Phase 1: Foundation**
- Project setup with Vite + React + TypeScript
- Tailwind CSS with custom design colors
- shadcn/ui components installed
- Apollo Client configured
- React Router with routes
- Layout with header and navigation

**Phase 2: Lead List**
- Lead list page with GraphQL integration
- Search and filtering functionality
- Pagination
- Status badges
- Loading and error states

**Phase 3: Lead Detail**
- Lead detail page with full information
- Interactions timeline
- Edit and delete functionality
- Navigation between leads

**Phase 4: Forms**
- Create lead form with validation
- Edit lead form
- Add interaction form
- Toast notifications for user feedback

**Phase 5: Polish & Performance**
- Loading skeletons on all pages
- Toast notifications replacing alerts
- Page transitions with framer-motion
- Performance optimization with lazy loading
- Error boundaries for error handling
- Mobile-responsive design
- Production build verified

### 🔮 Future Enhancements
- Dashboard with analytics
- Contacts management
- Opportunities pipeline
- Reports and exports
- Advanced filtering and sorting
- Bulk operations
- Real-time updates with subscriptions
- File attachments

## 📝 Path Aliases

Use `@/` as an alias for `src/`:

```typescript
import { Button } from "@/components/ui/button"
import { apolloClient } from "@/lib/apollo-client"
```

## 🎨 Design System

The application uses a custom color scheme based on the provided designs:

```css
--primary: #3B82F6 (Blue)
--secondary: #8B5CF6 (Purple)
--success: #10B981 (Green)
--warning: #F59E0B (Orange)
--error: #EF4444 (Red)
```

## 🛠️ Development

### Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── Layout.tsx      # Main layout wrapper
│   ├── StatusBadge.tsx # Status indicator component
│   ├── PageTransition.tsx # Animation wrapper
│   └── ErrorBoundary.tsx  # Error catching component
├── pages/              # Route pages
│   ├── LeadList.tsx    # Lead list page
│   ├── LeadDetail.tsx  # Lead detail page
│   ├── CreateLead.tsx  # Create lead form
│   ├── EditLead.tsx    # Edit lead form
│   └── AddInteraction.tsx # Add interaction form
├── graphql/            # GraphQL queries and mutations
│   ├── leads.ts        # Lead operations
│   └── interactions.ts # Interaction operations
├── types/              # TypeScript types
│   └── lead.ts         # Lead and interaction types
├── lib/                # Utilities
│   ├── apollo-client.ts # Apollo Client setup
│   └── utils.ts        # Helper functions
└── App.tsx             # Root component with routing
```

### Adding New Components

Use shadcn/ui CLI to add components:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3000/graphql
```

## 🐛 Troubleshooting

### Port Already in Use
If port 5173 is already in use, Vite will automatically try the next available port (5174, 5175, etc.). Check the terminal output for the actual port.

### Backend Connection Error
Make sure the backend is running at http://localhost:3000 and PostgreSQL is properly configured.

### Missing Dependencies
If you encounter import errors, try:
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## 📄 License

This project is part of the Auggie Academy CRM training program.
