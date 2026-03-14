import Link from "next/link";

type SiteFooterProps = {
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
};

export function SiteFooter({ categories }: SiteFooterProps) {
  return (
    <footer className="mt-20 border-t border-white/10 bg-[var(--surface-strong)] text-slate-200">
      <div className="site-container grid gap-10 py-14 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-slate-400">Crafter Tires</p>
            <h2 className="mt-2 font-display text-4xl uppercase leading-none text-white">
              Compra clara.
              <br />
              Eleccion tecnica.
            </h2>
          </div>
          <p className="max-w-md text-sm text-slate-400">
            Tienda online de neumaticos para auto, SUV, camioneta y utilitario con precios claros,
            stock actualizado y atencion comercial directa.
          </p>
          <a href="https://wa.me/541155550101" className="button-primary">
            Hablar por WhatsApp
          </a>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Navegacion</h3>
          <div className="mt-4 grid gap-3 text-sm">
            <Link href="/">Inicio</Link>
            <Link href="/catalogo">Catalogo</Link>
            <Link href="/contacto">Contacto</Link>
            <Link href="/carrito">Carrito</Link>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Categorias</h3>
          <div className="mt-4 grid gap-3 text-sm">
            {categories.slice(0, 5).map((category) => (
              <Link key={category.id} href={`/categoria/${category.slug}`}>
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
