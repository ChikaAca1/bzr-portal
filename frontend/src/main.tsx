import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { trpc, getTRPCClient } from './services/api';
import './lib/i18n'; // Initialize i18n (T037)
import './index.css';

/**
 * BZR Portal Frontend Entry Point
 *
 * Sets up tRPC client, TanStack Query, React Router, and i18n.
 */

// Create TanStack Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000, // 30 seconds
    },
  },
});

// Create tRPC client
const trpcClient = getTRPCClient();

import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { useAuthStore } from './stores/authStore'; // T038
import { Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Lazy-loaded Landing Page routes (code splitting for performance)
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const FeaturesPage = lazy(() => import('./pages/FeaturesPage').then(m => ({ default: m.FeaturesPage })));
const PricingPage = lazy(() => import('./pages/PricingPage').then(m => ({ default: m.PricingPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// Lazy-loaded Auth pages (T108-T110)
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage').then(m => ({ default: m.VerifyEmailPage })));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));

// Lazy-loaded Dashboard pages (T112-T114)
const CompanyProfilePage = lazy(() => import('./pages/CompanyProfilePage').then(m => ({ default: m.CompanyProfilePage })));
// TODO: Temporarily disabled until wizard components are created
// const PositionWizardPage = lazy(() => import('./pages/PositionWizardPage').then(m => ({ default: m.PositionWizardPage })));
// const DocumentsPage = lazy(() => import('./pages/DocumentsPage').then(m => ({ default: m.DocumentsPage })));

// Loading fallback for lazy routes
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Учитавање...</p>
      </div>
    </div>
  );
}

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

// Placeholder components (legacy - most now have dedicated pages)
const Companies = () => <div>Companies (Coming soon)</div>;
const Positions = () => <div>Positions List (Coming soon)</div>;
const RiskAssessment = () => <div>Risk Assessment (Coming soon)</div>;

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Landing Page routes (no auth required) */}
            <Route path="/" element={<HomePage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Protected App routes - Using nested routes properly */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/company"
              element={
                <ProtectedRoute>
                  <CompanyProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/companies"
              element={
                <ProtectedRoute>
                  <Companies />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/positions"
              element={
                <ProtectedRoute>
                  <Positions />
                </ProtectedRoute>
              }
            />
            {/* TODO: Re-enable when wizard components are created */}
            {/* <Route
              path="/app/positions/new"
              element={
                <ProtectedRoute>
                  <PositionWizardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/documents"
              element={
                <ProtectedRoute>
                  <DocumentsPage />
                </ProtectedRoute>
              }
            /> */}
            <Route
              path="/app/risks"
              element={
                <ProtectedRoute>
                  <RiskAssessment />
                </ProtectedRoute>
              }
            />

            {/* 404 Not Found */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </div>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </trpc.Provider>
  </React.StrictMode>
);
