import { notFound } from "next/navigation";
import { prisma } from "@crafter/database";
import { updateProductDetailsAction } from "../../../../../lib/actions";

export default async function ProductEditPage({ params }: { params: { id: string } }) {
  const [product, brands, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id: params.id }, include: { images: true, inventory: true } }),
    prisma.brand.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ where: { active: true }, orderBy: { name: "asc" } })
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Editar producto</h1>
      <form action={updateProductDetailsAction} className="rounded-xl bg-white p-4">
        <input type="hidden" name="id" value={product.id} />
        <div className="grid gap-3 md:grid-cols-3">
          <input name="name" defaultValue={product.name} className="rounded border p-2" />
          <input name="slug" defaultValue={product.slug} className="rounded border p-2" />
          <input name="sku" defaultValue={product.sku} className="rounded border p-2" />
          <input name="price" type="number" defaultValue={product.price.toNumber()} className="rounded border p-2" />
          <input name="previousPrice" type="number" defaultValue={product.previousPrice?.toNumber()} className="rounded border p-2" />
          <input name="discountPercentage" type="number" defaultValue={product.discountPercentage ?? 0} className="rounded border p-2" />
          <input name="width" type="number" defaultValue={product.width} className="rounded border p-2" />
          <input name="height" type="number" defaultValue={product.height} className="rounded border p-2" />
          <input name="rim" type="number" defaultValue={product.rim} className="rounded border p-2" />
          <select name="vehicleType" defaultValue={product.vehicleType} className="rounded border p-2">
            <option value="AUTO">Auto</option>
            <option value="SUV">SUV</option>
            <option value="CAMIONETA">Camioneta</option>
            <option value="UTILITARIO">Utilitario</option>
          </select>
          <select name="brandId" defaultValue={product.brandId} className="rounded border p-2">
            {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
          </select>
          <select name="categoryId" defaultValue={product.categoryId} className="rounded border p-2">
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
          <input name="stock" type="number" defaultValue={product.inventory?.stock ?? 0} className="rounded border p-2" />
          <input name="imageUrl" defaultValue={product.images[0]?.url ?? ""} className="rounded border p-2" />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="runFlat" defaultChecked={product.runFlat} /> RunFlat</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" defaultChecked={product.featured} /> Destacado</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={product.active} /> Activo</label>
        </div>
        <textarea name="description" defaultValue={product.description} className="mt-3 h-24 w-full rounded border p-2" />
        <button className="mt-3 rounded-lg bg-accent px-4 py-2 font-semibold text-white" type="submit">Guardar cambios</button>
      </form>
    </div>
  );
}
