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

interface OrdersSearchParams {
  q?: string;
  estado?: string;
}

export default async function OrdersPage({ searchParams }: { searchParams: OrdersSearchParams }) {
  const q = searchParams.q?.trim();
  const estado = searchParams.estado?.trim();

  const where: any = {};

  if (q) {
    where.OR = [
      { number: { contains: q, mode: "insensitive" } },
      { customer: { email: { contains: q, mode: "insensitive" } } }
    ];
  }

  if (estado && estado !== "ALL") {
    where.status = estado;
  }

  const orders = await prisma.order.findMany({
    where: Object.keys(where).length ? where : undefined,
    include: { customer: true, items: true },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Órdenes</h1>
          <p className="admin-page-description">Búsqueda rápida por número, email del cliente y estado.</p>
        </div>
        <span className="admin-kbd-chip">{orders.length} resultados</span>
      </div>

      <form className="admin-card" method="get">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex-1">
            <label htmlFor="q" className="mb-2 block text-sm font-medium text-slate-700">
              Buscar órdenes
            </label>
            <input
              id="q"
              name="q"
              defaultValue={q}
              placeholder="Buscar por número o email"
              className="admin-field w-full"
            />
          </div>

          <div className="w-full md:w-64">
            <label htmlFor="estado" className="mb-2 block text-sm font-medium text-slate-700">
              Estado
            </label>
            <select
              id="estado"
              name="estado"
              defaultValue={estado || "ALL"}
              className="admin-field w-full"
            >
              <option value="ALL">Todos</option>
              <option value="PENDING">Pendiente / Procesando</option>
              <option value="PAID">Pagada / Completada</option>
              <option value="SHIPPED">Enviada</option>
              <option value="CANCELED">Cancelada</option>
            </select>
          </div>

          <div className="flex gap-2 md:self-stretch md:pt-6">
            <button className="admin-btn-primary flex-1 md:flex-none md:min-w-[140px]" type="submit">
              Aplicar filtros
            </button>
          </div>
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
