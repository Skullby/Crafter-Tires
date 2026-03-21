export default function ImportsPage() {
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Importaciones</h1>
          <p className="admin-page-description">Módulo reservado para el futuro flujo de carga y sincronización.</p>
        </div>
        <span className="admin-kbd-chip">Próximamente</span>
      </div>

      <div className="admin-card">
        <h2 className="admin-card-title">Flujo previsto</h2>
        <p className="admin-card-subtitle">Base preparada para importar catálogo desde archivos y revisar diferencias antes de aplicar cambios.</p>

        <ul className="mt-5 space-y-3 text-sm text-slate-600">
          <li className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="font-medium text-slate-900">Servicio placeholder:</span> <code>apps/admin/lib/imports</code>
          </li>
          <li className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="font-medium text-slate-900">Pipeline recomendado:</span> validación, diff, upsert y reporte.
          </li>
          <li className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="font-medium text-slate-900">Control operativo:</span> conflictos por SKU y trazabilidad por lote.
          </li>
        </ul>
      </div>
    </div>
  );
}
