import { prisma } from "@crafter/database";

function getOrderStatusBadge(status: string) {
  switch (status) {
    case "PENDING":
    case "PROCESSING":
      return { label: "Pendiente", className: "admin-badge-warning" };
    case "PAID":
    case "DELIVERED":
      return { label: "Completada", className: "admin-badge-success" };
    case "SHIPPED":
      return { label: "Enviada", className: "admin-badge-success" };
    case "CANCELED":
      return { label: "Cancelada", className: "admin-badge-danger" };
    default:
      return { label: status, className: "admin-badge-warning" };
  }
}

function getPaymentStatusBadge(status: string) {
  switch (status) {
    case "PENDING":
      return { label: "Pendiente", className: "admin-badge-warning" };
    case "APPROVED":
      return { label: "Aprobado", className: "admin-badge-success" };
    case "REJECTED":
    case "FAILED":
      return { label: "Rechazado", className: "admin-badge-danger" };
    default:
      return { label: status, className: "admin-badge-warning" };
  }
}

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
          <input id="q" name="q" defaultValue={q} placeholder="Buscar por número o email" className="admin-field w-full" />
          <button className="admin-btn-primary sm:min-w-[140px]" type="submit">Buscar</button>
        </div>
      </form>

      <div className="admin-card mt-4">
        {orders.length === 0 ? (
          <div className="admin-empty-state">
            No se encontraron órdenes para los filtros actuales.
          </div>
        ) : (
          <div className="admin-table-wrap border-0 shadow-none">
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
                {orders.map((order) => {
                  const orderBadge = getOrderStatusBadge(order.status);
                  const paymentBadge = getPaymentStatusBadge(order.paymentStatus);

                  return (
                    <tr key={order.id}>
                      <td className="font-medium text-slate-950">{order.number}</td>
                      <td>{order.customer.email}</td>
                      <td>${order.total.toNumber()}</td>
                      <td>
                        <span className={orderBadge.className}>{orderBadge.label}</span>
                      </td>
                      <td>
                        <span className={paymentBadge.className}>{paymentBadge.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
