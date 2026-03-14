import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "../../lib/auth";
import { logoutAction } from "../../lib/actions";

const nav = [
  { href: "/", label: "Dashboard" },
  { href: "/productos", label: "Productos" },
  { href: "/inventario", label: "Inventario" },
  { href: "/categorias", label: "Categor�as" },
  { href: "/marcas", label: "Marcas" },
  { href: "/ordenes", label: "�rdenes" },
  { href: "/clientes", label: "Clientes" },
  { href: "/importaciones", label: "Importaciones" }
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="border-r bg-slate-900 p-5 text-slate-100">
        <p className="text-xl font-bold">Crafter Admin</p>
        <p className="mt-1 text-xs text-slate-300">{session.user.email}</p>
        <p className="text-xs uppercase text-orange-300">Rol: {(session.user as any).role}</p>
        <nav className="mt-6 space-y-1 text-sm">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="block rounded-lg px-3 py-2 hover:bg-slate-800">
              {item.label}
            </Link>
          ))}
        </nav>
        <form action={logoutAction} className="mt-6">
          <button className="w-full rounded-lg bg-slate-700 px-3 py-2 text-sm">Cerrar sesi�n</button>
        </form>
      </aside>
      <section className="p-5">{children}</section>
    </div>
  );
}
