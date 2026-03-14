export default function ImportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Importaciones (Pr�ximamente)</h1>
      <div className="rounded-xl bg-white p-5">
        <p className="text-slate-700">Este m�dulo est� preparado para el futuro flujo de sincronizaci�n desde Excel.</p>
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>Servicio placeholder: `apps/admin/lib/imports`</li>
          <li>Pipeline recomendado: validaci�n, staging, diff, upsert, reporte</li>
          <li>Control de conflictos por SKU y trazabilidad por lote</li>
        </ul>
      </div>
    </div>
  );
}
