import { Outlet } from "react-router-dom";

import { useAuth } from "@/features/auth/useAuth";

export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
        <span className="text-lg font-semibold text-neutral-900">QuoteGraph</span>
        {user && (
          <div className="flex items-center gap-4 text-sm text-neutral-600">
            <span>{user.email}</span>
            <button onClick={logout} className="font-medium text-neutral-900 underline">
              Log out
            </button>
          </div>
        )}
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
