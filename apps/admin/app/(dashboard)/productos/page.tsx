import Link from "next/link";
import { prisma } from "@crafter/database";
import { archiveProductAction, createProductAction, updateProductAction } from "../../../lib/actions";

export default async function ProductsPage() {
  const [products, brands, categories] = await Promise.all([
    prisma.product.findMany({ include: { brand: true, category: true, inventory: true }, orderBy: { createdAt: "desc" } }),
    prisma.brand.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ where: { active: true }, orderBy: { name: "asc" } })
  ]);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Productos</h1>
          <p className="admin-page-description">Alta rápida, edición operativa y acceso al editor completo.</p>
        </div>
        <span className="admin-kbd-chip">{products.length} productos</span>
      </div>

      <form action={createProductAction} className="admin-card">
        <div className="admin-page-header">
          <div>
            <h2 className="admin-card-title">Alta rápida de producto</h2>
            <p className="admin-card-subtitle">Completá los datos mínimos para publicar una cubierta y dejar stock listo para operar.</p>
          </div>
          <span className="admin-badge-warning">Batch 1: foco catálogo + stock</span>
        </div>

        <div className="admin-form-grid mt-4">
          <input name="name" required placeholder="Nombre" className="admin-field" />
          <input name="slug" required placeholder="Slug" className="admin-field" />
          <input name="sku" required placeholder="SKU" className="admin-field" />
          <input name="price" required type="number" placeholder="Precio" className="admin-field" />
          <input name="previousPrice" type="number" placeholder="Precio anterior" className="admin-field" />
          <input name="discountPercentage" type="number" placeholder="% descuento" className="admin-field" />
          <input name="width" required type="number" placeholder="Ancho" className="admin-field" />
          <input name="height" required type="number" placeholder="Alto" className="admin-field" />
          <input name="rim" required type="number" placeholder="Rodado" className="admin-field" />
          <input name="stock" required type="number" placeholder="Stock inicial" className="admin-field" />
          <select name="vehicleType" className="admin-field">
            <option value="AUTO">Auto</option>
            <option value="SUV">SUV</option>
            <option value="CAMIONETA">Camioneta</option>
            <option value="UTILITARIO">Utilitario</option>
          </select>
          <select name="brandId" className="admin-field">
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
          <select name="categoryId" className="admin-field">
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <input name="imageUrl" required placeholder="URL de imagen" className="admin-field md:col-span-2 xl:col-span-1" />
          <input name="indiceCarga" placeholder="Índice de carga" className="admin-field" />
          <input name="indiceVelocidad" placeholder="Índice de velocidad" className="admin-field" />
        </div>

        <textarea name="description" required placeholder="Descripción comercial y técnica" className="admin-field mt-3 h-28 w-full" />

        <div className="mt-4 flex flex-wrap gap-3">
          <label className="admin-check-card"><input type="checkbox" name="runFlat" /> RunFlat</label>
          <label className="admin-check-card"><input type="checkbox" name="featured" /> Destacado</label>
          <label className="admin-check-card"><input type="checkbox" name="active" defaultChecked /> Activo</label>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">Tip: si solo cambia precio o stock, usá la edición rápida de abajo para no frenar la operación.</p>
          <button className="admin-btn-primary" type="submit">Crear producto</button>
        </div>
      </form>

      <div className="admin-card">
        <div className="admin-page-header">
          <div>
            <h2 className="admin-card-title">Lista de productos</h2>
            <p className="admin-card-subtitle">Edición rápida de precio/stock y acceso al editor completo.</p>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {products.length === 0 ? (
            <div className="admin-empty-state">
              No hay productos cargados todavía. Empezá con el alta rápida para habilitar catálogo e inventario.
            </div>
          ) : null}

          {products.map((product) => (
            <div key={product.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-950">{product.name}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                    <span className="admin-kbd-chip">SKU {product.sku}</span>
                    <span className="admin-kbd-chip">{product.brand?.name ?? "Sin marca"}</span>
                    <span className="admin-kbd-chip">{product.category?.name ?? "Sin categoría"}</span>
                  </div>
                </div>
                <Link className="admin-btn-secondary" href={`/productos/${product.id}/editar`}>
                  Editar completo
                </Link>
              </div>

              <form action={updateProductAction} className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                <input type="hidden" name="id" value={product.id} />
                <input name="price" defaultValue={product.price.toNumber()} type="number" className="admin-field" placeholder="Precio" />
                <input name="stock" defaultValue={product.inventory?.stock ?? 0} type="number" className="admin-field" placeholder="Stock" />
                <label className="admin-check-card"><input name="featured" type="checkbox" defaultChecked={product.featured} /> Destacado</label>
                <label className="admin-check-card"><input name="active" type="checkbox" defaultChecked={product.active} /> Activo</label>
                <button className="admin-btn-primary" type="submit">Guardar cambios</button>
              </form>

              <form action={archiveProductAction} className="mt-3">
                <input type="hidden" name="id" value={product.id} />
                <button className="text-sm font-medium text-red-700 hover:text-red-800" type="submit">Archivar (solo admin)</button>
              </form>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
