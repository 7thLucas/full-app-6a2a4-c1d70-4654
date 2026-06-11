import { useState, type ReactNode } from "react";
import { NavLink, useLocation } from "react-router";
import { KanbanSquare, Users, Menu, X } from "lucide-react";
import { useConfigurables } from "~/modules/configurables";
import { cn } from "~/lib/utils";

const NAV = [
  { to: "/pipeline", label: "Pipeline", icon: KanbanSquare },
  { to: "/contacts", label: "Contacts", icon: Users },
];

function BrandMark({ logoUrl, name }: { logoUrl?: string; name: string }) {
  const valid = logoUrl && !logoUrl.startsWith("FILL_");
  if (valid) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className="h-9 w-9 rounded-lg object-cover ring-1 ring-white/20"
      />
    );
  }
  return (
    <span
      className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white"
      style={{ background: "linear-gradient(135deg, #1E3A8A, #14B8A6)" }}
    >
      {name?.[0]?.toUpperCase() ?? "M"}
    </span>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const { config } = useConfigurables();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const appName = config?.appName && !config.appName.startsWith("FILL_") ? config.appName : "MyCRM";
  const tagline = config?.tagline ?? "";

  const navItems = (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive || location.pathname.startsWith(to)
                ? "bg-white/10 text-white"
                : "text-blue-100/70 hover:bg-white/5 hover:text-white",
            )
          }
        >
          <Icon className="h-[18px] w-[18px]" />
          {label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-background text-slate-900">
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex w-64 flex-col gap-6 p-5 text-white"
        style={{ background: "linear-gradient(180deg, #1E3A8A 0%, #16306e 100%)" }}
      >
        <div className="flex items-center gap-3">
          <BrandMark logoUrl={config?.logoUrl} name={appName} />
          <div className="min-w-0">
            <p className="truncate text-base font-semibold leading-tight">{appName}</p>
            {tagline && (
              <p className="truncate text-[11px] text-blue-200/70">{tagline}</p>
            )}
          </div>
        </div>
        {navItems}
        <div className="mt-auto rounded-xl bg-white/5 p-3 text-[11px] leading-relaxed text-blue-100/70">
          A calm home for every relationship. Move deals, log touches, never lose a follow-up.
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex flex-1 flex-col min-w-0">
        <header
          className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 text-white"
          style={{ background: "linear-gradient(135deg, #1E3A8A, #16306e)" }}
        >
          <div className="flex items-center gap-2.5">
            <BrandMark logoUrl={config?.logoUrl} name={appName} />
            <span className="text-base font-semibold">{appName}</span>
          </div>
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="rounded-lg p-2 hover:bg-white/10"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        {mobileOpen && (
          <div
            className="md:hidden border-b border-blue-900/20 px-4 py-3 text-white"
            style={{ background: "#16306e" }}
          >
            {navItems}
          </div>
        )}

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
