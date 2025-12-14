import { Outlet } from '@tanstack/react-router';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* This renders the child route (Login, Dashboard, etc.) */}
      <Outlet />
    </div>
  );
}