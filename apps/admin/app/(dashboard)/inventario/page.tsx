import { prisma } from "@crafter/database";
import { adjustStockAction } from "../../../lib/actions";

export default async function InventoryPage() {
  const inventory = await prisma.inventory.findMany({ include: { product: true }, orderBy: { updatedAt: "desc" } });

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Inventario</h1>
          <p className="admin-page-description">Ajustes rápidos de stock con motivo para trazabilidad operativa.</p>
        </div>
        <span className="admin-kbd-chip">{inventory.length} registros</span>
      </div>

      {inventory.length === 0 ? (
        <div className="admin-card">
          <div className="admin-empty-state">Todavía no hay inventario cargado. Cuando se creen productos con stock inicial, aparecerán acá.</div>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Stock</th>
                <th>Ajuste</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.id}>
                  <td className="font-medium text-slate-950">{item.product.name}</td>
                  <td>
                    <span className={item.stock === 0 ? "admin-badge-danger" : item.stock <= 5 ? "admin-badge-warning" : "admin-badge-success"}>
                      {item.stock} u.
                    </span>
                  </td>
                  <td>
                    <form action={adjustStockAction} className="grid gap-2 md:grid-cols-[110px_minmax(180px,1fr)_auto]">
                      <input type="hidden" name="productId" value={item.productId} />
                      <input name="change" type="number" className="admin-field px-3 py-2.5" placeholder="+/-" required />
                      <input name="note" className="admin-field px-3 py-2.5" placeholder="Motivo del ajuste" />
                      <button className="admin-btn-primary" type="submit">Aplicar</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
