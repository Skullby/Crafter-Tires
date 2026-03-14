import Link from "next/link";
import { MeasureFinder } from "../../components/measure-finder";
import { ProductCard } from "../../components/product-card";
import { getCategories, getFeaturedProducts } from "../../lib/catalog";

const benefits = [
  {
    title: "Compra clara",
    description: "Precios finales visibles, cuotas con Mercado Pago y disponibilidad actualizada."
  },
  {
    title: "Asesoramiento directo",
    description: "Te ayudamos a elegir por medida, uso y presupuesto sin salir del flujo de compra."
  },
  {
    title: "Catalogo pensado para decidir rapido",
    description: "Marca, medida, tipo de vehiculo y stock visibles desde la tarjeta de producto."
  }
];

const processSteps = [
  "Busca por medida o entra al catalogo.",
  "Compara precio, stock y especificaciones.",
  "Confirma tu compra online o consulta por WhatsApp."
];

export default async function HomePage() {
  const [categories, featured] = await Promise.all([getCategories(), getFeaturedProducts()]);

  return (
    <div>
      <section className="overflow-hidden bg-[linear-gradient(145deg,#111827_0%,#172033_45%,#273246_100%)] text-white">
        <div className="site-container section-space">
          <div className="hero-grid">
            <div className="flex flex-col justify-between gap-8">
              <div className="space-y-6">
                <div>
                  <p className="eyebrow text-orange-300">Ecommerce de neumaticos</p>
                  <h1 className="mt-3 max-w-3xl font-display text-5xl uppercase leading-[0.92] text-white md:text-7xl">
                    Elegi medida, compara opciones y compra con stock real.
                  </h1>
                </div>

                <p className="max-w-2xl text-lg text-slate-300">
                  Crafter Tires combina una experiencia de compra clara con una lectura tecnica simple:
                  medidas visibles, precio protagonista y una salida rapida a carrito o WhatsApp.
                </p>

                <div className="flex flex-wrap gap-3">
                  <Link href="/catalogo" className="button-primary">
                    Explorar catalogo
                  </Link>
                  <a href="https://wa.me/541155550101" className="button-ghost">
                    Consultar por WhatsApp
                  </a>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {benefits.map((benefit) => (
                  <div key={benefit.title} className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5 backdrop-blur">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-300">
                      {benefit.title}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-200">{benefit.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center">
              <MeasureFinder className="w-full border-white/10 bg-white text-slate-950" />
            </div>
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="site-container">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">Categorias</p>
              <h2 className="mt-2 text-4xl font-semibold text-slate-950">Compra segun tu vehiculo y uso.</h2>
            </div>
            <Link href="/catalogo" className="button-secondary">
              Ver todo el catalogo
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                href={`/categoria/${category.slug}`}
                className="surface-card group overflow-hidden p-0"
              >
                <div className="flex min-h-[250px] flex-col justify-between bg-[linear-gradient(160deg,#ffffff_0%,#f8fafc_55%,#eef2f7_100%)] p-6">
                  <div className="flex items-start justify-between gap-4">
                    <span className="chip-muted">Categoria {String(index + 1).padStart(2, "0")}</span>
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Ver opciones
                    </span>
                  </div>
                  <div>
                    <h3 className="text-3xl font-semibold text-slate-950 transition group-hover:text-[var(--brand-600)]">
                      {category.name}
                    </h3>
                    <p className="mt-3 max-w-xs text-sm leading-6 text-slate-600">
                      Encontrá alternativas con specs visibles, stock y recorrido directo al detalle del producto.
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space pt-0">
        <div className="site-container">
          <div className="rounded-[2rem] bg-[linear-gradient(135deg,#fff7f2_0%,#fff_55%,#fff5ef_100%)] p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)] md:p-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="eyebrow">Recomendados</p>
                <h2 className="mt-2 text-4xl font-semibold text-slate-950">Neumaticos destacados para vender mejor.</h2>
              </div>
              <p className="max-w-xl text-sm leading-6 text-slate-600">
                La grilla replica una logica comercial directa: marca, medida, tipo de vehiculo, precio, cuota y CTA.
              </p>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-space pt-0">
        <div className="site-container grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="surface-card p-6 md:p-8">
            <p className="eyebrow">Confianza</p>
            <h2 className="mt-2 text-4xl font-semibold text-slate-950">Una compra ordenada, sin ruido.</h2>
            <div className="mt-6 space-y-4 text-sm leading-6 text-slate-600">
              {processSteps.map((step, index) => (
                <div key={step} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white">
                    0{index + 1}
                  </span>
                  <p>{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="surface-card p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Pagos</p>
              <h3 className="mt-3 text-2xl font-semibold text-slate-950">Cuotas y checkout seguro</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Integracion preparada para Mercado Pago con estados de pago y validacion de stock.
              </p>
            </div>
            <div className="surface-card p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Logica ecommerce</p>
              <h3 className="mt-3 text-2xl font-semibold text-slate-950">Catalogo enfocado en conversion</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Se prioriza lo que define la compra: medida, precio, stock y compatibilidad.
              </p>
            </div>
            <div className="surface-card p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Soporte</p>
              <h3 className="mt-3 text-2xl font-semibold text-slate-950">Atencion comercial inmediata</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                WhatsApp integrado como salida rapida para dudas de aplicacion o comparacion entre opciones.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
