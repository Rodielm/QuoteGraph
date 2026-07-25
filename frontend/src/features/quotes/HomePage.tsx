import { useAuth } from "@/features/auth/useAuth";

export function HomePage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900">Welcome{user ? `, ${user.email}` : ""}</h1>
      <p className="mt-2 text-neutral-600">Explore ideas, not just quotes.</p>
    </div>
  );
}
