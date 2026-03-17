import { prisma } from "@crafter/database";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        take: 5
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Clientes</h1>
          <p className="admin-page-description">Vista rápida de clientes y sus últimas órdenes registradas.</p>
        </div>
        <span className="admin-kbd-chip">{customers.length} clientes</span>
      </div>

      {customers.length === 0 ? (
        <div className="admin-card">
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
            Todavía no hay clientes registrados.
          </div>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {customers.map((customer) => (
            <article key={customer.id} className="admin-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-slate-950">{customer.email}</p>
                  <p className="mt-1 text-sm text-slate-600">{customer.name ?? "Sin nombre"}</p>
                </div>
                <span className="admin-kbd-chip">{customer.orders.length} órdenes</span>
              </div>

              <div className="mt-4">
                <h2 className="text-sm font-medium text-slate-700">Últimas órdenes</h2>
                {customer.orders.length === 0 ? (
                  <p className="mt-2 text-sm text-slate-500">Este cliente todavía no tiene órdenes.</p>
                ) : (
                  <ul className="mt-3 space-y-2 text-sm text-slate-600">
                    {customer.orders.map((order) => (
                      <li key={order.id} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                        <span className="font-medium text-slate-900">{order.number}</span>
                        <span className="mx-2 text-slate-400">•</span>
                        <span>{order.status}</span>
                        <span className="mx-2 text-slate-400">•</span>
                        <span>{order.paymentStatus}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
