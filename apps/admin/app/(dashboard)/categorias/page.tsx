import { prisma } from "@crafter/database";
import { saveCategoryAction } from "../../../lib/actions";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Categorías</h1>
          <p className="admin-page-description">Alta y mantenimiento de categorías activas para el catálogo.</p>
        </div>
        <span className="admin-kbd-chip">{categories.length} categorías</span>
      </div>

      <form action={saveCategoryAction} className="admin-card">
        <h2 className="admin-card-title">Nueva categoría</h2>
        <p className="admin-card-subtitle">Creá una categoría con nombre y slug para usar en productos.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input name="name" required placeholder="Nombre" className="admin-field" />
          <input name="slug" required placeholder="Slug" className="admin-field" />
          <button className="admin-btn-primary" type="submit">Crear</button>
        </div>
      </form>

      <div className="admin-card">
        <h2 className="admin-card-title">Categorías existentes</h2>
        <p className="admin-card-subtitle">Editá nombre, slug y estado sin salir de la lista.</p>

        {categories.length === 0 ? (
          <div className="mt-4 admin-empty-state">
            No hay categorías cargadas todavía.
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {categories.map((category) => (
              <li key={category.id} className="rounded-2xl border border-slate-200 p-4">
                <form action={saveCategoryAction} className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto] md:items-center">
                  <input type="hidden" name="id" value={category.id} />
                  <input name="name" defaultValue={category.name} className="admin-field" />
                  <input name="slug" defaultValue={category.slug} className="admin-field" />
                  <label className="admin-check-card">
                    <input type="checkbox" name="active" defaultChecked={category.active} /> Activa
                  </label>
                  <button className="admin-btn-primary" type="submit">Guardar</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
