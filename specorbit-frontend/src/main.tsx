import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { 
  createRootRoute, 
  createRoute, 
  createRouter, 
  RouterProvider,
  Outlet 
} from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// --- Page Imports ---
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import ProjectDetails from './pages/ProjectDetails';
import Docs from './pages/Docs';
import DriftPage from './pages/DriftPage';
import Login from './pages/Login';
import TeamSettings from './pages/TeamSettings'; // New
import ProfileSettings from './pages/ProfileSettings'; // New

const queryClient = new QueryClient();

// 1. Root Route
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// 2. Public Routes
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
});

// 3. Authenticated Layout (Standardizes Sidebar/Layout)
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authenticated',
  component: DashboardLayout,
});

// 4. Dashboard Index
const dashboardRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/dashboard',
  component: Dashboard,
});

// 5. Project Specific Routes (Capture $projectId)
const projectDetailsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/projects/$projectId',
  component: ProjectDetails,
});

const docsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/docs/$projectId',
  component: Docs,
});

const driftRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/projects/$projectId/drift',
  component: DriftPage,
});

// 6. Settings & Team Routes (NEW)
const teamSettingsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/settings/team',
  component: TeamSettings,
});

const profileSettingsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/settings/profile',
  component: ProfileSettings,
});

// 7. Assemble Route Tree
const routeTree = rootRoute.addChildren([
  loginRoute,
  layoutRoute.addChildren([
    dashboardRoute,
    projectDetailsRoute,
    docsRoute,
    driftRoute,
    teamSettingsRoute,
    profileSettingsRoute,
  ]),
]);

const router = createRouter({ routeTree });

// Register for Type Safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);