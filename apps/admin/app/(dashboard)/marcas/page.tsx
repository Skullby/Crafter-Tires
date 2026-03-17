import { prisma } from "@crafter/database";
import { saveBrandAction } from "../../../lib/actions";

export default async function BrandsPage() {
  const brands = await prisma.brand.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Marcas</h1>
          <p className="admin-page-description">Gestión simple de marcas activas y su visibilidad en catálogo.</p>
        </div>
        <span className="admin-kbd-chip">{brands.length} marcas</span>
      </div>

      <form action={saveBrandAction} className="admin-card">
        <h2 className="admin-card-title">Nueva marca</h2>
        <p className="admin-card-subtitle">Creá una marca con nombre y slug para asignarla a productos.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input name="name" required placeholder="Nombre" className="admin-field" />
          <input name="slug" required placeholder="Slug" className="admin-field" />
          <button className="admin-btn-primary" type="submit">Crear</button>
        </div>
      </form>

      <div className="admin-card">
        <h2 className="admin-card-title">Marcas existentes</h2>
        <p className="admin-card-subtitle">Editá rápidamente nombre, slug y estado.</p>

        {brands.length === 0 ? (
          <div className="mt-4 admin-empty-state">
            No hay marcas cargadas todavía.
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {brands.map((brand) => (
              <li key={brand.id} className="rounded-2xl border border-slate-200 p-4">
                <form action={saveBrandAction} className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto] md:items-center">
                  <input type="hidden" name="id" value={brand.id} />
                  <input name="name" defaultValue={brand.name} className="admin-field" />
                  <input name="slug" defaultValue={brand.slug} className="admin-field" />
                  <label className="admin-check-card">
                    <input type="checkbox" name="active" defaultChecked={brand.active} /> Activa
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
