import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@crafter/database";
import { updateProductDetailsAction } from "../../../../../lib/actions";

export default async function ProductEditPage({ params }: { params: { id: string } }) {
  const [product, brands, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id: params.id }, include: { images: true, inventory: true, brand: true, category: true } }),
    prisma.brand.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ where: { active: true }, orderBy: { name: "asc" } })
  ]);

  if (!product) notFound();

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="admin-page-title">Editar producto</h1>
            <span className="admin-kbd-chip">SKU {product.sku}</span>
            <span className="admin-kbd-chip">{product.brand.name}</span>
            <span className="admin-kbd-chip">{product.category.name}</span>
          </div>
          <p className="admin-page-description">Editor completo para catálogo e inventario, pensado para mantenimiento operativo sin perder contexto.</p>
        </div>
        <Link className="admin-btn-secondary" href="/productos">
          Volver a productos
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <form action={updateProductDetailsAction} className="admin-card">
          <div className="admin-page-header">
            <div>
              <h2 className="admin-card-title">Datos principales</h2>
              <p className="admin-card-subtitle">Actualizá la información visible del producto y el stock operativo desde un solo lugar.</p>
            </div>
            <span className={product.active ? "admin-badge-success" : "admin-badge-danger"}>{product.active ? "Activo" : "Inactivo"}</span>
          </div>

          <input type="hidden" name="id" value={product.id} />

          <div className="admin-form-grid mt-4">
            <input name="name" defaultValue={product.name} className="admin-field" placeholder="Nombre" />
            <input name="slug" defaultValue={product.slug} className="admin-field" placeholder="Slug" />
            <input name="sku" defaultValue={product.sku} className="admin-field" placeholder="SKU" />
            <input name="price" type="number" defaultValue={product.price.toNumber()} className="admin-field" placeholder="Precio" />
            <input name="previousPrice" type="number" defaultValue={product.previousPrice?.toNumber()} className="admin-field" placeholder="Precio anterior" />
            <input name="discountPercentage" type="number" defaultValue={product.discountPercentage ?? 0} className="admin-field" placeholder="% descuento" />
            <input name="width" type="number" defaultValue={product.width} className="admin-field" placeholder="Ancho" />
            <input name="height" type="number" defaultValue={product.height} className="admin-field" placeholder="Alto" />
            <input name="rim" type="number" defaultValue={product.rim} className="admin-field" placeholder="Rodado" />
            <input name="stock" type="number" defaultValue={product.inventory?.stock ?? 0} className="admin-field" placeholder="Stock" />
            <select name="vehicleType" defaultValue={product.vehicleType} className="admin-field">
              <option value="AUTO">Auto</option>
              <option value="SUV">SUV</option>
              <option value="CAMIONETA">Camioneta</option>
              <option value="UTILITARIO">Utilitario</option>
            </select>
            <input name="imageUrl" defaultValue={product.images[0]?.url ?? ""} className="admin-field" placeholder="URL de imagen" />
            <select name="brandId" defaultValue={product.brandId} className="admin-field">
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
            <select name="categoryId" defaultValue={product.categoryId} className="admin-field">
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <textarea name="description" defaultValue={product.description} className="admin-field mt-3 h-32 w-full" placeholder="Descripción" />

          <div className="mt-4 flex flex-wrap gap-3">
            <label className="admin-check-card"><input type="checkbox" name="runFlat" defaultChecked={product.runFlat} /> RunFlat</label>
            <label className="admin-check-card"><input type="checkbox" name="featured" defaultChecked={product.featured} /> Destacado</label>
            <label className="admin-check-card"><input type="checkbox" name="active" defaultChecked={product.active} /> Activo</label>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500">Los cambios de stock generan movimiento automático para mantener trazabilidad.</p>
            <button className="admin-btn-primary" type="submit">Guardar cambios</button>
          </div>
        </form>

        <aside className="space-y-4">
          <div className="admin-card">
            <h2 className="admin-card-title">Resumen operativo</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between gap-3">
                <span>Marca</span>
                <span className="font-medium text-slate-950">{product.brand.name}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Categoría</span>
                <span className="font-medium text-slate-950">{product.category.name}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Stock actual</span>
                <span className={
                  (product.inventory?.stock ?? 0) === 0
                    ? "admin-badge-danger"
                    : (product.inventory?.stock ?? 0) <= 5
                      ? "admin-badge-warning"
                      : "admin-badge-success"
                }>
                  {product.inventory?.stock ?? 0} u.
                </span>
              </div>
            </div>
          </div>

          <div className="admin-card">
            <h2 className="admin-card-title">Criterio UX aplicado</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">Jerarquía clara: primero contenido crítico, después metadatos.</li>
              <li className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">Campos agrupados por tarea para reducir errores de edición.</li>
              <li className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">Feedback visual de stock para detectar urgencias rápido.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
