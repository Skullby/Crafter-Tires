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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Productos</h1>
      <form action={createProductAction} className="rounded-xl bg-white p-4">
        <h2 className="font-semibold">Crear producto</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <input name="name" required placeholder="Nombre" className="rounded border p-2" />
          <input name="slug" required placeholder="Slug" className="rounded border p-2" />
          <input name="sku" required placeholder="SKU" className="rounded border p-2" />
          <input name="price" required type="number" placeholder="Precio" className="rounded border p-2" />
          <input name="previousPrice" type="number" placeholder="Precio anterior" className="rounded border p-2" />
          <input name="discountPercentage" type="number" placeholder="% Descuento" className="rounded border p-2" />
          <input name="width" required type="number" placeholder="Ancho" className="rounded border p-2" />
          <input name="height" required type="number" placeholder="Alto" className="rounded border p-2" />
          <input name="rim" required type="number" placeholder="Rodado" className="rounded border p-2" />
          <input name="stock" required type="number" placeholder="Stock" className="rounded border p-2" />
          <select name="vehicleType" className="rounded border p-2">
            <option value="AUTO">Auto</option>
            <option value="SUV">SUV</option>
            <option value="CAMIONETA">Camioneta</option>
            <option value="UTILITARIO">Utilitario</option>
          </select>
          <select name="brandId" className="rounded border p-2">
            {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
          </select>
          <select name="categoryId" className="rounded border p-2">
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
          <input name="imageUrl" required placeholder="URL imagen" className="rounded border p-2" />
          <input name="indiceCarga" placeholder="�ndice carga" className="rounded border p-2" />
          <input name="indiceVelocidad" placeholder="�ndice velocidad" className="rounded border p-2" />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="runFlat" /> RunFlat</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" /> Destacado</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked /> Activo</label>
        </div>
        <textarea name="description" required placeholder="Descripci�n" className="mt-3 h-24 w-full rounded border p-2" />
        <button className="mt-3 rounded-lg bg-accent px-4 py-2 font-semibold text-white" type="submit">Crear producto</button>
      </form>

      <div className="rounded-xl bg-white p-4">
        <h2 className="font-semibold">Lista de productos</h2>
        <div className="mt-3 space-y-3">
          {products.map((product) => (
            <div key={product.id} className="rounded-lg border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-xs text-slate-500">SKU {product.sku} � {product.brand.name} � {product.category.name}</p>
                </div>
                <Link className="rounded border px-3 py-1 text-sm" href={`/productos/${product.id}/editar`}>Editar completo</Link>
              </div>
              <form action={updateProductAction} className="mt-3 grid gap-2 md:grid-cols-6">
                <input type="hidden" name="id" value={product.id} />
                <input name="price" defaultValue={product.price.toNumber()} type="number" className="rounded border p-2" />
                <input name="stock" defaultValue={product.inventory?.stock ?? 0} type="number" className="rounded border p-2" />
                <label className="flex items-center gap-2 text-sm"><input name="featured" type="checkbox" defaultChecked={product.featured} /> Destacado</label>
                <label className="flex items-center gap-2 text-sm"><input name="active" type="checkbox" defaultChecked={product.active} /> Activo</label>
                <button className="rounded bg-slate-800 px-3 py-2 text-sm text-white" type="submit">Guardar</button>
              </form>
              <form action={archiveProductAction} className="mt-2">
                <input type="hidden" name="id" value={product.id} />
                <button className="text-sm text-red-700" type="submit">Archivar (solo admin)</button>
              </form>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
