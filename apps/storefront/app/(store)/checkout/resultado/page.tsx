import Link from "next/link";

const states = {
  success: {
    title: "Pago aprobado",
    description: "Tu pago fue confirmado. Puedes revisar el detalle de la orden y su seguimiento."
  },
  pending: {
    title: "Pago pendiente",
    description: "Mercado Pago todavia esta procesando la operacion. El estado final se actualizara automaticamente."
  },
  failed: {
    title: "Pago rechazado",
    description: "La operacion no pudo completarse. Puedes volver al carrito e intentar nuevamente."
  }
} as const;

export default function CheckoutResultPage({
  searchParams
}: {
  searchParams: { estado?: "success" | "pending" | "failed"; orden?: string };
}) {
  const state = searchParams.estado ?? "pending";
  const content = states[state] ?? states.pending;

  return (
    <div className="section-space">
      <div className="site-container max-w-3xl">
        <div className="surface-card p-8 text-center md:p-10">
          <p className="eyebrow">Resultado del pago</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-950">{content.title}</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-600">{content.description}</p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            {searchParams.orden ? (
              <Link href={`/orden/${searchParams.orden}`} className="button-primary">
                Ver orden
              </Link>
            ) : null}
            <Link href="/catalogo" className="button-secondary justify-center">
              Volver al catalogo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
