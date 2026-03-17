import { prisma } from "@crafter/database";

export default async function OrdersPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q?.trim();
  const orders = await prisma.order.findMany({
    where: q
      ? {
          OR: [
            { number: { contains: q, mode: "insensitive" } },
            { customer: { email: { contains: q, mode: "insensitive" } } }
          ]
        }
      : undefined,
    include: { customer: true, items: true },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Órdenes</h1>
          <p className="admin-page-description">Búsqueda rápida por número o email del cliente.</p>
        </div>
        <span className="admin-kbd-chip">{orders.length} resultados</span>
      </div>

      <form className="admin-card" method="get">
        <label htmlFor="q" className="mb-2 block text-sm font-medium text-slate-700">
          Buscar órdenes
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input id="q" name="q" defaultValue={q} placeholder="Buscar por número o email" className="w-full rounded-xl border p-3" />
          <button className="admin-btn-primary sm:min-w-[140px]" type="submit">Buscar</button>
        </div>
      </form>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Orden</th>
              <th>Pago</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="font-medium text-slate-950">{order.number}</td>
                <td>{order.customer.email}</td>
                <td>${order.total.toNumber()}</td>
                <td>{order.status}</td>
                <td>{order.paymentStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
