import { prisma } from "@crafter/database";
import { saveCategoryAction } from "../../../lib/actions";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Categor�as</h1>
      <form action={saveCategoryAction} className="rounded-xl bg-white p-4">
        <h2 className="font-semibold">Nueva categor�a</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          <input name="name" required placeholder="Nombre" className="rounded border p-2" />
          <input name="slug" required placeholder="Slug" className="rounded border p-2" />
          <button className="rounded bg-accent px-3 py-2 font-semibold text-white" type="submit">Crear</button>
        </div>
      </form>
      <div className="rounded-xl bg-white p-4">
        <ul className="space-y-2">
          {categories.map((category) => (
            <li key={category.id} className="rounded border p-3">
              <form action={saveCategoryAction} className="grid gap-2 md:grid-cols-4">
                <input type="hidden" name="id" value={category.id} />
                <input name="name" defaultValue={category.name} className="rounded border p-2" />
                <input name="slug" defaultValue={category.slug} className="rounded border p-2" />
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={category.active} /> Activa</label>
                <button className="rounded bg-slate-800 px-3 py-2 text-white" type="submit">Guardar</button>
              </form>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
