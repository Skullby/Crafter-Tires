import Link from "next/link";

type SiteHeaderProps = {
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
};

export function SiteHeader({ categories }: SiteHeaderProps) {
  const featuredCategories = categories.slice(0, 4);

  return (
    <header className="border-b border-white/10 bg-[var(--surface-strong)] text-white">
      <div className="border-b border-white/10 bg-black/15">
        <div className="site-container flex flex-col gap-2 py-2 text-xs text-slate-300 md:flex-row md:items-center md:justify-between">
          <p>Stock real, cuotas con Mercado Pago y asesoramiento comercial.</p>
          <div className="flex flex-wrap items-center gap-4">
            <span>WhatsApp: +54 11 5555 0101</span>
            <span>Lun a Sab: 9:00 a 19:00</span>
          </div>
        </div>
      </div>

      <div className="site-container flex flex-col gap-4 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex flex-col">
              <span className="text-xs uppercase tracking-[0.32em] text-slate-400">Crafter Tires</span>
              <span className="font-display text-3xl uppercase tracking-[0.08em] text-white">
                Neumaticos online
              </span>
            </Link>
            <Link href="/carrito" className="button-primary lg:hidden">
              Carrito
            </Link>
          </div>

          <div className="flex flex-1 flex-col gap-4 lg:items-end">
            <nav className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
              <Link href="/catalogo" className="rounded-full border border-white/10 px-4 py-2 transition hover:border-white/30 hover:text-white">
                Catalogo
              </Link>
              <Link href="/contacto" className="rounded-full border border-white/10 px-4 py-2 transition hover:border-white/30 hover:text-white">
                Contacto
              </Link>
              <a
                href="https://wa.me/541155550101"
                className="rounded-full border border-white/10 px-4 py-2 transition hover:border-white/30 hover:text-white"
              >
                WhatsApp
              </a>
              <Link href="/carrito" className="button-primary hidden lg:inline-flex">
                Ver carrito
              </Link>
            </nav>

            <div className="flex flex-wrap gap-2">
              {featuredCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categoria/${category.slug}`}
                  className="rounded-full bg-white/8 px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-200 transition hover:bg-white/14"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
