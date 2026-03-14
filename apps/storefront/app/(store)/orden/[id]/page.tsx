import { prisma } from "@crafter/database";
import { notFound } from "next/navigation";
import { formatCurrency } from "../../../../lib/format";

export default async function OrderPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true, payments: true }
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="section-space">
      <div className="site-container max-w-5xl space-y-6">
        <section className="surface-card p-6 md:p-8">
          <p className="eyebrow">Orden confirmada</p>
          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-semibold text-slate-950">Orden {order.number}</h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Estado de orden: <span className="font-semibold text-slate-950">{order.status}</span>
                {"  "}
                Estado de pago: <span className="font-semibold text-slate-950">{order.paymentStatus}</span>
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Total</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">
                {formatCurrency(order.total.toNumber())}
              </p>
            </div>
          </div>
        </section>

        <section className="surface-card p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-slate-950">Productos</h2>
          <ul className="mt-6 space-y-3">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-3 rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-lg font-semibold text-slate-950">{item.name}</p>
                  <p className="text-sm text-slate-600">Cantidad: {item.quantity}</p>
                </div>
                <p className="text-lg font-semibold text-slate-950">
                  {formatCurrency(item.total.toNumber())}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
