import { prisma } from "@crafter/database";
import { adjustStockAction } from "../../../lib/actions";

export default async function InventoryPage() {
  const inventory = await prisma.inventory.findMany({ include: { product: true }, orderBy: { updatedAt: "desc" } });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Inventario</h1>
      <div className="rounded-xl bg-white p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500"><th>Producto</th><th>Stock</th><th>Ajuste</th></tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.id} className="border-t align-top">
                <td className="py-2">{item.product.name}</td>
                <td className="py-2">{item.stock}</td>
                <td className="py-2">
                  <form action={adjustStockAction} className="flex flex-wrap items-center gap-2">
                    <input type="hidden" name="productId" value={item.productId} />
                    <input name="change" type="number" className="w-20 rounded border p-1" placeholder="+/-" required />
                    <input name="note" className="rounded border p-1" placeholder="Motivo" />
                    <button className="rounded bg-slate-800 px-3 py-1 text-white" type="submit">Aplicar</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
