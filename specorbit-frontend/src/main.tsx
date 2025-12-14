import React from 'react';
import ReactDOM from 'react-dom/client';
import { 
  RouterProvider, 
  createRouter, 
  createRoute, 
  createRootRoute 
} from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';

// --- Imports ---
import App from './App';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import ProjectDetails from './pages/ProjectDetails';

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
  component: Login, // Default to Login for now
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
  id: 'dashboard-layout', // Unique ID for the wrapper
  component: DashboardLayout, // Renders the Sidebar
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

// --- Build Router Tree ---
const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  callbackRoute,
  dashboardLayoutRoute.addChildren([
    dashboardIndexRoute,
    projectDetailsRoute
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