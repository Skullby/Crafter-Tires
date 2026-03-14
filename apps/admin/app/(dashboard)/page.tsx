import { prisma } from "@crafter/database";

export default async function DashboardPage() {
  const [products, lowStock, outOfStock, recentOrders] = await Promise.all([
    prisma.product.count(),
    prisma.inventory.count({ where: { stock: { lte: 5, gt: 0 } } }),
    prisma.inventory.count({ where: { stock: 0 } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { customer: true } })
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl bg-white p-4"><p className="text-sm text-slate-500">Total productos</p><p className="text-2xl font-bold">{products}</p></div>
        <div className="rounded-xl bg-white p-4"><p className="text-sm text-slate-500">Stock bajo</p><p className="text-2xl font-bold">{lowStock}</p></div>
        <div className="rounded-xl bg-white p-4"><p className="text-sm text-slate-500">Sin stock</p><p className="text-2xl font-bold">{outOfStock}</p></div>
        <div className="rounded-xl bg-white p-4"><p className="text-sm text-slate-500">Ventas</p><p className="text-2xl font-bold">Pr�ximamente</p></div>
      </div>

      <div className="rounded-xl bg-white p-4">
        <h2 className="text-lg font-semibold">�rdenes recientes</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500"><th>N�mero</th><th>Cliente</th><th>Estado</th><th>Pago</th></tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-t"><td className="py-2">{order.number}</td><td>{order.customer.email}</td><td>{order.status}</td><td>{order.paymentStatus}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
