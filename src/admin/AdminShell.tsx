import { Link, NavLink, Outlet } from "react-router-dom";
import { useAdminAuth } from "./AdminAuth.tsx";

export function AdminShell() {
  const { user, logout } = useAdminAuth();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-ink/10 bg-[#f6efe4]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 md:px-6">
          <div className="min-w-0">
            <p className="font-display text-2xl font-semibold leading-none text-maroon">
              RKN
            </p>
            <p className="truncate text-xs text-[#6e5b4c]">
              {user?.email}
              {user?.role ? ` · ${user.role.replaceAll("_", " ")}` : ""}
            </p>
          </div>
          <nav className="flex flex-wrap gap-1">
            <NavLink
              to="/admin/orders"
              className={({ isActive }) =>
                `rounded-full px-3 py-2 text-sm font-semibold ${isActive ? "bg-maroon text-[#fffaf3]" : "text-ink/80 hover:bg-white"}`
              }
            >
              Orders
            </NavLink>
            <NavLink
              to="/admin/menu"
              className={({ isActive }) =>
                `rounded-full px-3 py-2 text-sm font-semibold ${isActive ? "bg-maroon text-[#fffaf3]" : "text-ink/80 hover:bg-white"}`
              }
            >
              Menu
            </NavLink>
            <NavLink
              to="/admin/settings"
              className={({ isActive }) =>
                `rounded-full px-3 py-2 text-sm font-semibold ${isActive ? "bg-maroon text-[#fffaf3]" : "text-ink/80 hover:bg-white"}`
              }
            >
              Settings
            </NavLink>
            {user?.role === "super_admin" && (
              <NavLink
                to="/admin/admins"
                className={({ isActive }) =>
                  `rounded-full px-3 py-2 text-sm font-semibold ${isActive ? "bg-maroon text-[#fffaf3]" : "text-ink/80 hover:bg-white"}`
                }
              >
                Admins
              </NavLink>
            )}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/"
              className="rounded-full px-3 py-2 text-sm font-semibold text-ink/80 hover:bg-white"
            >
              View site
            </Link>
            <button
              type="button"
              className="rounded-full bg-ink px-3 py-2 text-sm font-semibold text-[#fffaf3]"
              onClick={() => void logout()}
            >
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        <Outlet />
      </main>
    </div>
  );
}
