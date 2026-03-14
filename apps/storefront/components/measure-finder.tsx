type MeasureFinderProps = {
  compact?: boolean;
  className?: string;
};

export function MeasureFinder({ compact = false, className = "" }: MeasureFinderProps) {
  return (
    <form
      action="/catalogo"
      className={`surface-card ${compact ? "p-4" : "p-6 md:p-7"} ${className}`.trim()}
    >
      <div className={compact ? "flex flex-col gap-4" : "flex flex-col gap-5"}>
        <div>
          <p className="eyebrow">Tire Finder</p>
          <h2 className={compact ? "mt-2 text-2xl font-semibold text-slate-950" : "mt-2 text-3xl font-semibold text-slate-950"}>
            Busca por medida
          </h2>
          <p className="mt-2 max-w-lg text-sm text-slate-600">
            Ingresa la medida exacta y filtra por tipo de vehiculo para ver opciones con stock y precio actualizados.
          </p>
        </div>

        <div className={compact ? "grid gap-3 md:grid-cols-[repeat(3,minmax(0,1fr))_180px]" : "grid gap-3 md:grid-cols-2"}>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            <span>Ancho</span>
            <input
              className="field-input"
              inputMode="numeric"
              name="ancho"
              placeholder="Ej. 245"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            <span>Alto</span>
            <input
              className="field-input"
              inputMode="numeric"
              name="alto"
              placeholder="Ej. 45"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            <span>Rodado</span>
            <input
              className="field-input"
              inputMode="numeric"
              name="rodado"
              placeholder="Ej. 18"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            <span>Tipo de vehiculo</span>
            <select className="field-input" name="tipo" defaultValue="">
              <option value="">Todos</option>
              <option value="AUTO">Auto</option>
              <option value="SUV">SUV</option>
              <option value="CAMIONETA">Camioneta</option>
              <option value="UTILITARIO">Utilitario</option>
            </select>
          </label>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2 text-xs text-slate-500">
            <span className="rounded-full bg-slate-100 px-3 py-1">Stock en tiempo real</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">Cuotas con Mercado Pago</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">Asesoramiento por WhatsApp</span>
          </div>
          <button className="button-primary min-w-[180px]" type="submit">
            Ver resultados
          </button>
        </div>
      </div>
    </form>
  );
}
