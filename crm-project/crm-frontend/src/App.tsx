import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Toaster } from '@/components/ui/sonner';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import { Skeleton } from '@/components/ui/skeleton';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load page components for better performance
const LeadList = lazy(() => import('./pages/LeadList'));
const LeadDetail = lazy(() => import('./pages/LeadDetail'));
const CreateLead = lazy(() => import('./pages/CreateLead'));
const EditLead = lazy(() => import('./pages/EditLead'));
const AddInteraction = lazy(() => import('./pages/AddInteraction'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

// Loading fallback component
const PageLoader = () => (
  <div className="space-y-6 p-6">
    <div className="space-y-2">
      <Skeleton className="h-9 w-[250px]" />
      <Skeleton className="h-5 w-[350px]" />
    </div>
    <Skeleton className="h-[400px] w-full" />
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<LeadList />} />
            <Route path="leads/:id" element={<LeadDetail />} />
            <Route path="leads/:id/edit" element={<EditLead />} />
            <Route path="leads/:id/add-interaction" element={<AddInteraction />} />
            <Route path="leads/new" element={<CreateLead />} />
            {/* Placeholder routes for other sections */}
            <Route path="dashboard" element={<div className="text-2xl font-bold">Dashboard - Coming Soon</div>} />
            <Route path="contacts" element={<div className="text-2xl font-bold">Contacts - Coming Soon</div>} />
            <Route path="opportunities" element={<div className="text-2xl font-bold">Opportunities - Coming Soon</div>} />
            <Route path="reports" element={<div className="text-2xl font-bold">Reports - Coming Soon</div>} />
          </Route>
        </Routes>
      </Suspense>
      <Toaster />
    </ErrorBoundary>
  );
}

export default App;
