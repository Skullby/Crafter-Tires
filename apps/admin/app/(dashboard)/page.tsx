import { prisma } from "@crafter/database";

export default async function DashboardPage() {
  try {
    const [products, lowStock, outOfStock, recentOrders] = await Promise.all([
      prisma.product.count(),
      prisma.inventory.count({ where: { stock: { lte: 5, gt: 0 } } }),
      prisma.inventory.count({ where: { stock: 0 } }),
      prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { customer: true } })
    ]);

    const BADGE_MAP = {
      order: {
        PENDING: { label: "Pendiente", className: "admin-badge-warning" },
        PROCESSING: { label: "En proceso", className: "admin-badge-warning" },
        PAID: { label: "Pagada", className: "admin-badge-success" },
        SHIPPED: { label: "Enviada", className: "admin-badge-success" },
        DELIVERED: { label: "Entregada", className: "admin-badge-success" },
        CANCELED: { label: "Cancelada", className: "admin-badge-danger" }
      } as const,
      payment: {
        PENDING: { label: "Pendiente", className: "admin-badge-warning" },
        APPROVED: { label: "Aprobado", className: "admin-badge-success" },
        REJECTED: { label: "Rechazado", className: "admin-badge-danger" },
        FAILED: { label: "Fallido", className: "admin-badge-danger" }
      } as const
    };

    return (
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1 className="admin-page-title">Dashboard</h1>
            <p className="admin-page-description">Resumen operativo del catálogo, stock y actividad reciente.</p>
          </div>
          <span className="admin-kbd-chip">Actualizado en tiempo real</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="admin-stat-card">
            <p className="text-sm text-slate-500">Total productos</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{products}</p>
          </div>
          <div className="admin-stat-card">
            <p className="text-sm text-slate-500">Stock bajo</p>
            <p className="mt-2 text-3xl font-bold text-amber-600">{lowStock}</p>
          </div>
          <div className="admin-stat-card">
            <p className="text-sm text-slate-500">Sin stock</p>
            <p className="mt-2 text-3xl font-bold text-red-600">{outOfStock}</p>
          </div>
          <div className="admin-stat-card">
            <p className="text-sm text-slate-500">Ventas</p>
            <p className="mt-2 text-lg font-semibold text-slate-700">Próximamente</p>
          </div>
        </div>

        <div className="admin-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="admin-card-title">Órdenes recientes</h2>
              <p className="admin-card-subtitle">Últimas 5 órdenes registradas en el sistema.</p>
            </div>
          </div>
          <div className="admin-table-wrap mt-4 border-0 shadow-none">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Cliente</th>
                  <th>Estado</th>
                  <th>Pago</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => {
                  const orderBadge = BADGE_MAP.order[order.status as keyof typeof BADGE_MAP.order] ?? {
                    label: order.status,
                    className: "admin-badge-warning"
                  };
                  const paymentBadge = BADGE_MAP.payment[order.paymentStatus as keyof typeof BADGE_MAP.payment] ?? {
                    label: order.paymentStatus,
                    className: "admin-badge-warning"
                  };

                  return (
                    <tr key={order.id}>
                      <td className="font-medium text-slate-900">{order.number}</td>
                      <td>{order.customer.email}</td>
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
        </div>
      </div>
    );
  } catch (error) {
    console.error("Failed to load dashboard stats", error);

    return (
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1 className="admin-page-title">Dashboard</h1>
            <p className="admin-page-description">Resumen operativo del catálogo, stock y actividad reciente.</p>
          </div>
        </div>
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900">
          <p className="font-semibold">Panel en mantenimiento</p>
          <p className="mt-1">
            No se pudo conectar a la base de datos de staging (por ejemplo, falta <code>DATABASE_URL</code> en Vercel).
            Los datos del dashboard no están disponibles, pero el resto de la app sigue funcionando.
          </p>
        </div>
      </div>
    );
  }
}
