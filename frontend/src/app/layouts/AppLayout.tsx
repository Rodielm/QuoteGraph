import { Link, Outlet } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/useAuth";

export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b bg-card px-6 py-4">
        <div className="flex items-center gap-6">
          <span className="text-lg font-semibold text-foreground">QuoteGraph</span>
          <nav className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              Quotes
            </Link>
            <Link to="/favorites" className="hover:text-foreground">
              Favorites
            </Link>
            <Link to="/my-reflections" className="hover:text-foreground">
              My Reflections
            </Link>
            <Link to="/collections" className="hover:text-foreground">
              Collections
            </Link>
            <Link to="/topics" className="hover:text-foreground">
              Topics
            </Link>
          </nav>
        </div>
        {user && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{user.email}</span>
            <Button variant="ghost" size="sm" onClick={logout}>
              Log out
            </Button>
          </div>
        )}
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
