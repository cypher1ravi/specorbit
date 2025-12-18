import React from 'react';
import ReactDOM from 'react-dom/client';
import { 
  RouterProvider, 
  createRouter, 
  createRoute, 
  createRootRoute,
  redirect
} from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';

// --- Imports ---
import { useAuthStore } from './stores/auth.store';
import App from './App';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import ProjectDetails from './pages/ProjectDetails';
import DriftPage from './pages/DriftPage';

// --- Setup Query Client ---
const queryClient = new QueryClient();

// --- Define Routes ---

// 1. Root Route (The main shell, uses App.tsx)
const rootRoute = createRootRoute({
  component: App,
});

// 2. Public Routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: ({ location }) => {
    // If the user is authenticated, redirect them to the dashboard
    if (useAuthStore.getState().isAuthenticated()) {
      throw redirect({
        to: '/dashboard',
        search: location.search,
        replace: true,
      });
    }
  },
  component: Login, 
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
});

const callbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/callback',
  component: AuthCallback,
});

// 3. Protected Dashboard Routes (Wrapped in DashboardLayout)
const dashboardLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'dashboard-layout',
  beforeLoad: ({ location }) => {
    // If the user is not authenticated, redirect them to the login page
    if (!useAuthStore.getState().isAuthenticated()) {
      throw redirect({
        to: '/login',
        search: {
          // Keep track of the page they were trying to visit
          redirect: location.href,
        },
        replace: true,
      });
    }
  },
  component: DashboardLayout,
});

const dashboardIndexRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute, // Child of the layout
  path: '/dashboard',
  component: Dashboard,
});

const projectDetailsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: '/projects/$projectId', // $ tells Router this is a variable
  component: ProjectDetails,
});

const driftRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: '/projects/$projectId/drift',
  component: DriftPage,
});

const docsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: '/docs',
  component: () => import('./pages/Docs').then(m => m.default),
});

// Add to children below

// --- Build Router Tree ---
const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  callbackRoute,
  dashboardLayoutRoute.addChildren([
    dashboardIndexRoute,
    projectDetailsRoute,
    driftRoute,
    docsRoute
  ]),
]);

// --- Create Router Instance ---
const router = createRouter({ routeTree });

// --- Type Safety for Router ---
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// --- Render Application ---
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
);