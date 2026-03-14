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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">�rdenes</h1>
      <form className="rounded-xl bg-white p-4" method="get">
        <input name="q" defaultValue={q} placeholder="Buscar por n�mero o email" className="w-full rounded border p-2" />
      </form>
      <div className="rounded-xl bg-white p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500"><th>N�mero</th><th>Cliente</th><th>Total</th><th>Orden</th><th>Pago</th></tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t">
                <td className="py-2">{order.number}</td>
                <td>{order.customer.email}</td>
                <td>{order.total.toNumber()}</td>
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
