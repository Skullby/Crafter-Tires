import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "../../../../components/add-to-cart-button";
import { ProductCard } from "../../../../components/product-card";
import { getProductBySlug, getRelatedProducts } from "../../../../lib/catalog";
import { formatCurrency, formatMeasure, formatVehicleType } from "../../../../lib/format";

export const revalidate = 120;

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);

  if (!product || !product.active) {
    notFound();
  }

  const related = await getRelatedProducts(product.id, product.categoryId, product.brandId);
  const mainImage = product.images[0];
  const stock = product.inventory?.stock ?? 0;

  return (
    <div className="section-space">
      <div className="site-container space-y-8">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link href="/">Inicio</Link>
          <span>/</span>
          <Link href="/catalogo">Catalogo</Link>
          <span>/</span>
          <Link href={`/categoria/${product.category.slug}`}>{product.category.name}</Link>
          <span>/</span>
          <span className="text-slate-700">{product.name}</span>
        </nav>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="surface-card overflow-hidden p-0">
            <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_100%)] p-5">
              <div className="flex flex-wrap gap-2">
                <span className="chip-dark">{formatMeasure(product.width, product.height, product.rim)}</span>
                <span className="chip-muted">{formatVehicleType(product.vehicleType)}</span>
                {product.runFlat ? <span className="chip-muted">Run Flat</span> : null}
              </div>
            </div>
            <div className="relative aspect-square bg-[radial-gradient(circle_at_center,_rgba(255,255,255,1),_rgba(241,245,249,1))]">
              {mainImage ? (
                <Image
                  src={mainImage.url}
                  alt={mainImage.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="h-64 w-64 rounded-full border-[26px] border-slate-900/90 shadow-[inset_0_0_0_16px_rgba(255,255,255,0.2)]" />
                </div>
              )}
            </div>
          </section>

          <div className="space-y-6">
            <section className="surface-card p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="chip-muted">{product.brand.name}</span>
                <span className="chip-muted">{product.category.name}</span>
              </div>
              <h1 className="mt-4 text-4xl font-semibold leading-tight text-slate-950 md:text-5xl">
                {product.name}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">{product.description}</p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Medida</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {formatMeasure(product.width, product.height, product.rim)}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Aplicacion</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">{formatVehicleType(product.vehicleType)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Stock</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {stock > 0 ? `${stock} unidades` : "Sin stock"}
                  </p>
                </div>
              </div>
            </section>

            <section className="surface-card p-6 md:p-8">
              <p className="eyebrow">Caja de compra</p>
              <div className="mt-4">
                {product.previousPrice ? (
                  <p className="text-base text-slate-400 line-through">
                    {formatCurrency(product.previousPrice.toNumber())}
                  </p>
                ) : null}
                <div className="mt-2 flex flex-wrap items-end gap-3">
                  <p className="text-5xl font-semibold leading-none text-slate-950">
                    {formatCurrency(product.price.toNumber())}
                  </p>
                  {product.discountPercentage ? (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                      {product.discountPercentage}% OFF
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  Hasta 6 cuotas con Mercado Pago. Confirmacion de stock antes de finalizar la compra.
                </p>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <AddToCartButton productId={product.id} label="Agregar al carrito" className="w-full" />
                <Link href="/carrito" className="button-secondary justify-center">
                  Ir al carrito
                </Link>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-950">Pago seguro</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Checkout integrado y estados de pago actualizados.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-950">Asesoramiento</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Consulta compatibilidad o alternativas por WhatsApp.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-950">Compra informada</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Medidas, specs y disponibilidad visibles antes del checkout.</p>
                </div>
              </div>
            </section>
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="surface-card p-6 md:p-8">
            <p className="eyebrow">Detalles tecnicos</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">Informacion clave del neumatico</h2>
            <ul className="mt-6 space-y-3">
              {product.specifications.map((spec) => (
                <li
                  key={spec.id}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <span className="text-sm font-medium text-slate-500">{spec.key}</span>
                  <span className="text-right text-sm font-semibold text-slate-950">{spec.value}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="surface-card p-6 md:p-8">
            <p className="eyebrow">Productos relacionados</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">Opciones para seguir comparando</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
