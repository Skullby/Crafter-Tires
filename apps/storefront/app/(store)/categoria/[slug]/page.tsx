import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "../../../../components/product-card";
import { getCatalogProducts } from "../../../../lib/catalog";

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const products = await getCatalogProducts({ categorySlug: params.slug, sort: "recommended" });

  if (products.length === 0) {
    notFound();
  }

  const category = products[0].category;

  return (
    <div className="section-space">
      <div className="site-container space-y-8">
        <section className="surface-card overflow-hidden p-0">
          <div className="grid gap-6 bg-[linear-gradient(135deg,#111827_0%,#1f2937_50%,#374151_100%)] p-6 text-white md:p-8 lg:grid-cols-[1fr_0.7fr]">
            <div>
              <p className="eyebrow text-orange-300">Categoria</p>
              <h1 className="mt-2 font-display text-5xl uppercase leading-[0.95] text-white md:text-6xl">
                {category.name}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
                Seleccion enfocada en comparacion rapida, con lectura clara de medida, precio y disponibilidad.
              </p>
            </div>
            <div className="flex flex-col items-start justify-end gap-3 lg:items-end">
              <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-slate-100">
                {products.length} productos disponibles
              </span>
              <Link href="/catalogo" className="button-ghost">
                Ver todo el catalogo
              </Link>
            </div>
          </div>
        </section>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
