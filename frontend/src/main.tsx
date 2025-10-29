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

// Placeholder components (will be fully implemented)
const Companies = () => <div>Companies (Coming soon)</div>;
const Positions = () => <div>Positions (Coming soon)</div>;
const RiskAssessment = () => <div>Risk Assessment (Coming soon)</div>;
const Documents = () => <div>Documents (Coming soon)</div>;

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

            {/* Protected App routes */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen">
                    {isAuthenticated && (
                      <header className="border-b">
                        <div className="container mx-auto px-4 py-4">
                          <h1 className="text-2xl font-bold">БЗР Портал</h1>
                        </div>
                      </header>
                    )}
                    <main className="container mx-auto px-4 py-8">
                      <Routes>
                        <Route index element={<Dashboard />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="companies" element={<Companies />} />
                        <Route path="positions" element={<Positions />} />
                        <Route path="risks" element={<RiskAssessment />} />
                        <Route path="documents" element={<Documents />} />
                      </Routes>
                    </main>
                  </div>
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
