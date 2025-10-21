# CRM Frontend Implementation Plan

## Overview
Create a React + TypeScript application with Vite, configure Tailwind CSS, shadcn/ui, Apollo Client, and React Router. The design shows a clean, modern CRM interface with a blue/purple theme.

## Design Analysis from Images

### Color Scheme:
- **Primary Blue**: `#4F7CFF` (buttons, active states, links)
- **Background**: Light gray `#F5F6FA`
- **White Cards**: `#FFFFFF` with subtle shadows
- **Status Colors**:
  - New: Blue (`#E8EFFF` bg, `#4F7CFF` text)
  - Contacted: Cyan (`#E0F5F5` bg, `#00B5AD` text)
  - Qualified: Purple (`#EDE9FF` bg, `#5B4FFF` text)
  - Proposal: Yellow (`#FFF9E6` bg, `#F2A600` text)
  - Negotiation: Orange (`#FFE8D6` bg, `#E86A33` text)
  - Won: Green (`#E8F5E9` bg, `#4CAF50` text)
  - Lost: Red (`#FFE8E8` bg, `#E53935` text)

### Typography:
- **Headings**: Bold, dark gray/black
- **Body**: Regular, gray
- **Font Family**: Modern sans-serif (Inter or similar)

## Step-by-Step Implementation

### STEP 1: Project Initialization ✅
**Commands:**
```bash
npm create vite@latest crm-frontend -- --template react-ts
cd crm-frontend
npm install
```

### STEP 2: Tailwind CSS Setup
**Commands:**
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### STEP 3: Path Aliases Configuration
**Commands:**
```bash
npm install -D @types/node
```

### STEP 4: shadcn/ui Setup
**Commands:**
```bash
npx shadcn@latest init
npx shadcn@latest add button card input label select textarea dialog table badge form toast
```

### STEP 5: Apollo Client Setup
**Commands:**
```bash
npm install @apollo/client graphql
```

### STEP 6: React Router Setup
**Commands:**
```bash
npm install react-router-dom
```

### STEP 7: Additional Dependencies
**Commands:**
```bash
npm install date-fns lucide-react
```

### STEP 8: Create Basic Layout Component
### STEP 9: Create Placeholder Pages
### STEP 10: Final Wiring
### STEP 11: Backend Connection Verification
