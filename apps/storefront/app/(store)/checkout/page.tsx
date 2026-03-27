import { redirect } from "next/navigation";
import { CheckoutForm } from "../../../components/checkout-form";
import { findCart } from "../../../lib/cart";

export default async function CheckoutPage() {
  const cart = await findCart();

  if (!cart || cart.items.length === 0) {
    redirect("/carrito");
  }

  return (
    <div className="section-space">
      <div className="site-container max-w-4xl">
        <section className="surface-card overflow-hidden p-0">
          <div className="grid gap-6 bg-[linear-gradient(135deg,#111827_0%,#1f2937_52%,#334155_100%)] p-6 text-white md:p-8 lg:grid-cols-[1fr_0.8fr]">
            <div>
              <p className="eyebrow text-orange-300">Checkout</p>
              <h1 className="mt-2 font-display text-5xl uppercase leading-[0.95] text-white md:text-6xl">
                Completa tus datos y pasa a pago.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
                El formulario esta organizado para reducir friccion: datos de contacto, direccion y salida directa a Mercado Pago.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Items en carrito</p>
                <p className="mt-3 text-4xl font-semibold text-white">{cart.items.length}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Metodo de pago</p>
                <p className="mt-3 text-xl font-semibold text-white">Mercado Pago</p>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <CheckoutForm />
          </div>
        </section>
      </div>
    </div>
  );
}
