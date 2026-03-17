import { redirect } from "next/navigation";
import { auth } from "../../lib/auth";
import { logoutAction } from "../../lib/actions";
import { NavLink } from "./nav-link";

export const dynamic = "force-dynamic";

const nav = [
  {
    label: "General",
    items: [{ href: "/", label: "Dashboard" }]
  },
  {
    label: "Catálogo",
    items: [
      { href: "/productos", label: "Productos" },
      { href: "/inventario", label: "Inventario" },
      { href: "/categorias", label: "Categorías" },
      { href: "/marcas", label: "Marcas" }
    ]
  },
  {
    label: "Ventas",
    items: [
      { href: "/ordenes", label: "Órdenes" },
      { href: "/clientes", label: "Clientes" }
    ]
  },
  {
    label: "Sistema",
    items: [{ href: "/importaciones", label: "Importaciones" }]
  }
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-100 lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="border-b border-slate-800 bg-slate-950 px-4 py-5 text-slate-100 lg:min-h-screen lg:border-b-0 lg:border-r lg:px-5">
        <div className="flex items-start justify-between gap-3 lg:block">
          <div>
            <p className="text-xl font-bold tracking-tight">Crafter Admin</p>
            <p className="mt-1 text-sm text-slate-300">{session.user.email}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-orange-300">Rol: {(session.user as any).role}</p>
          </div>
          <form action={logoutAction} className="lg:hidden">
            <button className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-800">
              Cerrar sesión
            </button>
          </form>
        </div>

        <nav className="mt-6 space-y-4" aria-label="Navegación principal">
          {nav.map((group) => (
            <div key={group.label} className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{group.label}</p>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink key={item.href} href={item.href} label={item.label} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-6 hidden lg:block">
          <form action={logoutAction}>
            <button className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm font-medium text-slate-100 transition hover:bg-slate-800">
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      <section className="min-w-0 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </section>
    </div>
  );
}
