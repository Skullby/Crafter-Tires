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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Clientes</h1>
      <div className="space-y-3">
        {customers.map((customer) => (
          <article key={customer.id} className="rounded-xl bg-white p-4">
            <p className="font-semibold">{customer.email}</p>
            <p className="text-sm text-slate-600">{customer.name ?? "Sin nombre"}</p>
            <p className="mt-2 text-sm">�ltimas �rdenes: {customer.orders.length}</p>
            <ul className="mt-2 text-xs text-slate-600">
              {customer.orders.map((order) => (
                <li key={order.id}>{order.number} � {order.status} � {order.paymentStatus}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
