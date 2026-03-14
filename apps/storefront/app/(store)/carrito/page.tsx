import Link from "next/link";
import { CartClient } from "../../../components/cart-client";
import { computeCartTotals, getCart } from "../../../lib/cart";
import { formatCurrency, formatMeasure } from "../../../lib/format";

export default async function CartPage() {
  const cart = await getCart();
  const totals = computeCartTotals(cart.items);

  const mappedItems = cart.items.map((item) => ({
    id: item.id,
    quantity: item.quantity,
    unitPrice: item.unitPrice.toNumber(),
    product: {
      id: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      stock: item.product.inventory?.stock ?? 0,
      measure: formatMeasure(item.product.width, item.product.height, item.product.rim),
      image: item.product.images[0]
        ? {
            url: item.product.images[0].url,
            alt: item.product.images[0].alt
          }
        : undefined
    }
  }));

  return (
    <div className="section-space">
      <div className="site-container space-y-8">
        <section className="surface-card overflow-hidden p-0">
          <div className="grid gap-6 bg-[linear-gradient(135deg,#111827_0%,#1f2937_52%,#334155_100%)] p-6 text-white md:p-8 lg:grid-cols-[1fr_0.8fr]">
            <div>
              <p className="eyebrow text-orange-300">Carrito</p>
              <h1 className="mt-2 font-display text-5xl uppercase leading-[0.95] text-white md:text-6xl">
                Revisa tu compra antes del checkout.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
                Mantuvimos esta pantalla simple: control de cantidad, subtotal y continuidad directa a pago.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Items</p>
                <p className="mt-3 text-4xl font-semibold text-white">{mappedItems.length}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Subtotal</p>
                <p className="mt-3 text-4xl font-semibold text-white">{formatCurrency(totals.subtotal)}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section>
            {mappedItems.length === 0 ? (
              <div className="surface-card p-10">
                <h2 className="text-3xl font-semibold text-slate-950">Tu carrito esta vacio.</h2>
                <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600">
                  Vuelve al catalogo para explorar por marca, medida o tipo de vehiculo.
                </p>
                <Link className="button-primary mt-6" href="/catalogo">
                  Ir al catalogo
                </Link>
              </div>
            ) : (
              <CartClient items={mappedItems} />
            )}
          </section>

          <aside className="surface-card h-fit p-6 lg:sticky lg:top-6">
            <p className="eyebrow">Resumen</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">Totales de compra</h2>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-950">{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Envio</span>
                <span className="font-semibold text-slate-950">{formatCurrency(totals.shipping)}</span>
              </div>
              <div className="h-px bg-slate-200" />
              <div className="flex items-center justify-between text-base">
                <span className="font-medium text-slate-700">Total</span>
                <span className="text-2xl font-semibold text-slate-950">{formatCurrency(totals.total)}</span>
              </div>
            </div>

            <Link href="/checkout" className="button-primary mt-6 w-full justify-center">
              Continuar al checkout
            </Link>

            <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              El checkout valida stock antes de crear la preferencia de pago y redirige a Mercado Pago.
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
