export default function ContactPage() {
  return (
    <div className="section-space">
      <div className="site-container max-w-5xl space-y-8">
        <section className="surface-card overflow-hidden p-0">
          <div className="grid gap-6 bg-[linear-gradient(135deg,#111827_0%,#1f2937_48%,#374151_100%)] p-6 text-white md:p-8 lg:grid-cols-[1fr_0.8fr]">
            <div>
              <p className="eyebrow text-orange-300">Contacto</p>
              <h1 className="mt-2 font-display text-5xl uppercase leading-[0.95] text-white md:text-6xl">
                Asesoramiento comercial y tecnico.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
                Si necesitas validar una medida, comparar alternativas o confirmar aplicacion, el canal principal es WhatsApp.
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6 backdrop-blur">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">Horario</p>
              <p className="mt-3 text-3xl font-semibold text-white">Lun a Sab</p>
              <p className="mt-1 text-sm text-slate-300">9:00 a 19:00</p>
            </div>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          <a href="https://wa.me/541155550101" className="surface-card p-6">
            <p className="eyebrow">WhatsApp</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">+54 11 5555 0101</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Canal principal para consultas de producto, compatibilidad y seguimiento comercial.
            </p>
          </a>

          <div className="surface-card p-6">
            <p className="eyebrow">Email</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">ventas@craftertires.com</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Para pedidos corporativos, consultas administrativas o coordinacion comercial.
            </p>
          </div>

          <div className="surface-card p-6">
            <p className="eyebrow">Respuesta</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">Atencion directa</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              El objetivo es resolver dudas rapido para no cortar el flujo de compra del usuario.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
