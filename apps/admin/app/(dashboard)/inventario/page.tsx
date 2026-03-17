import Link from "next/link";
import { prisma } from "@crafter/database";
import { adjustStockAction } from "../../../lib/actions";

interface InventorySearchParams {
  stock?: string;
}

export default async function InventoryPage({ searchParams }: { searchParams: InventorySearchParams }) {
  const stockFilter = searchParams?.stock;

  const where = stockFilter === "low"
    ? { stock: { gt: 0, lte: 5 } }
    : stockFilter === "out"
      ? { stock: 0 }
      : undefined;

  const inventory = await prisma.inventory.findMany({
    where,
    include: { product: true },
    orderBy: { updatedAt: "desc" }
  });

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Inventario</h1>
          <p className="admin-page-description">Ajustes rápidos de stock con motivo para trazabilidad operativa.</p>
        </div>
        <span className="admin-kbd-chip">{inventory.length} registros</span>
      </div>

      <div className="admin-card mb-4">
        <form className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between" method="get">
          <p className="text-sm text-slate-600">Filtros rápidos por nivel de stock.</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              name="stock"
              value="low"
              className={`admin-btn-secondary text-xs md:text-sm ${stockFilter === "low" ? "admin-btn-secondary-active" : ""}`}
            >
              Solo stock bajo (1-5)
            </button>
            <button
              type="submit"
              name="stock"
              value="out"
              className={`admin-btn-secondary text-xs md:text-sm ${stockFilter === "out" ? "admin-btn-secondary-active" : ""}`}
            >
              Solo sin stock (0)
            </button>
            {stockFilter && (
              <button type="submit" className="admin-btn-ghost text-xs md:text-sm">
                Limpiar filtros
              </button>
            )}
          </div>
        </form>
      </div>

      {inventory.length === 0 ? (
        <div className="admin-card">
          <div className="admin-empty-state space-y-3">
            <p>Todavía no hay inventario cargado. Cuando se creen productos con stock inicial, aparecerán acá.</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/productos" className="admin-btn-primary">
                Ir a productos
              </Link>
              <Link href="/importaciones" className="admin-btn-secondary">
                Ver importaciones
              </Link>
            </div>
          </div>
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
