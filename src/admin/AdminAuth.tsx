import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Navigate, Outlet } from "react-router-dom";
import { fetchMe, logout as apiLogout } from "../lib/api.ts";

type User = { email: string; role: string };

type AdminAuthValue = {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetchMe()
      .then((result) => {
        if (alive)
          setUser({ email: result.email, role: result.role || "super_admin" });
      })
      .catch(() => {
        if (alive) setUser(null);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const value = useMemo<AdminAuthValue>(
    () => ({
      user,
      loading,
      setUser,
      async logout() {
        await apiLogout();
        setUser(null);
      },
    }),
    [user, loading],
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

// oxlint-disable-next-line react/only-export-components
export function useAdminAuth(): AdminAuthValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx)
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}

export function RequireOwner() {
  const { user, loading } = useAdminAuth();
  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center px-4 text-sm font-semibold text-[#4e4036]">
        Checking session…
      </div>
    );
  }
  if (!user) return <Navigate to="/admin/login" replace />;
  return <Outlet />;
}
