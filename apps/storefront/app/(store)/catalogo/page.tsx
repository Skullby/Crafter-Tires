import Link from "next/link";

type VehicleType = "AUTO" | "SUV" | "CAMIONETA" | "UTILITARIO";
import { MeasureFinder } from "../../../components/measure-finder";
import { ProductCard } from "../../../components/product-card";
import { getBrands, getCatalogProducts, getCategories } from "../../../lib/catalog";
import type { CatalogFilters } from "../../../lib/catalog";

const VALID_VEHICLE_TYPES: ReadonlySet<string> = new Set<string>(["AUTO", "SUV", "CAMIONETA", "UTILITARIO"]);
const VALID_SORT_VALUES: ReadonlySet<string> = new Set<string>(["price_asc", "price_desc", "bestsellers", "recommended"]);

function parseVehicleType(value?: string): VehicleType | undefined {
  return value && VALID_VEHICLE_TYPES.has(value) ? (value as VehicleType) : undefined;
}

function parseSort(value?: string): CatalogFilters["sort"] {
  return value && VALID_SORT_VALUES.has(value) ? (value as CatalogFilters["sort"]) : "recommended";
}

export const revalidate = 120;

function parseNumber(value?: string) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function parseVehicleType(value?: string): VehicleType | undefined {
  if (!value) return undefined;
  return ["AUTO", "SUV", "CAMIONETA", "UTILITARIO"].includes(value) ? (value as VehicleType) : undefined;
}

export default async function CatalogPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const filters = {
    query: typeof searchParams.q === "string" ? searchParams.q : undefined,
    brand: typeof searchParams.marca === "string" ? searchParams.marca : undefined,
    width: parseNumber(typeof searchParams.ancho === "string" ? searchParams.ancho : undefined),
    height: parseNumber(typeof searchParams.alto === "string" ? searchParams.alto : undefined),
    rim: parseNumber(typeof searchParams.rodado === "string" ? searchParams.rodado : undefined),
    vehicleType: parseVehicleType(typeof searchParams.tipo === "string" ? searchParams.tipo : undefined),
    minPrice: parseNumber(typeof searchParams.minPrecio === "string" ? searchParams.minPrecio : undefined),
    maxPrice: parseNumber(typeof searchParams.maxPrecio === "string" ? searchParams.maxPrecio : undefined),
    inStock: searchParams.stock === "1",
    sort: parseSort(typeof searchParams.sort === "string" ? searchParams.sort : undefined)
  };

  const [products, brands, categories] = await Promise.all([
    getCatalogProducts(filters),
    getBrands(),
    getCategories()
  ]);

  return (
    <div className="section-space">
      <div className="site-container space-y-8">
        <section className="surface-card overflow-hidden p-0">
          <div className="grid gap-8 bg-[linear-gradient(135deg,#111827_0%,#1f2937_48%,#374151_100%)] p-6 text-white lg:grid-cols-[1fr_0.9fr] lg:p-8">
            <div className="space-y-4">
              <p className="eyebrow text-orange-300">Catalogo</p>
              <h1 className="font-display text-5xl uppercase leading-[0.95] text-white md:text-6xl">
                Neumaticos listos para comparar y comprar.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-300">
                Filtra por marca, medida, tipo de vehiculo y precio. La estructura prioriza lectura rapida y continuidad de compra.
              </p>
              <div className="flex flex-wrap gap-2">
                {categories.slice(0, 5).map((category) => (
                  <Link
                    key={category.id}
                    href={`/categoria/${category.slug}`}
                    className="rounded-full border border-white/10 px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-200 hover:border-white/30"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>

            <MeasureFinder compact className="w-full border-white/10 bg-white text-slate-950" />
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <aside className="surface-card h-fit p-5 lg:sticky lg:top-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold text-slate-950">Filtros</h2>
              <Link href="/catalogo" className="text-sm font-medium text-[var(--brand-600)]">
                Limpiar
              </Link>
            </div>

            <form className="mt-5 space-y-4" method="get">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                <span>Buscar producto</span>
                <input
                  name="q"
                  placeholder="Marca o modelo"
                  className="field-input"
                  defaultValue={filters.query}
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-slate-700">
                <span>Marca</span>
                <select name="marca" className="field-input" defaultValue={filters.brand}>
                  <option value="">Todas las marcas</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.slug}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-3 gap-2">
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  <span>Ancho</span>
                  <input name="ancho" placeholder="245" className="field-input px-3" defaultValue={filters.width} />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  <span>Alto</span>
                  <input name="alto" placeholder="45" className="field-input px-3" defaultValue={filters.height} />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  <span>Rodado</span>
                  <input name="rodado" placeholder="18" className="field-input px-3" defaultValue={filters.rim} />
                </label>
              </div>

              <label className="grid gap-2 text-sm font-medium text-slate-700">
                <span>Tipo de vehiculo</span>
                <select name="tipo" className="field-input" defaultValue={filters.vehicleType}>
                  <option value="">Todos</option>
                  <option value="AUTO">Auto</option>
                  <option value="SUV">SUV</option>
                  <option value="CAMIONETA">Camioneta</option>
                  <option value="UTILITARIO">Utilitario</option>
                </select>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  <span>Precio minimo</span>
                  <input
                    name="minPrecio"
                    placeholder="$"
                    className="field-input px-3"
                    defaultValue={typeof searchParams.minPrecio === "string" ? searchParams.minPrecio : ""}
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  <span>Precio maximo</span>
                  <input
                    name="maxPrecio"
                    placeholder="$"
                    className="field-input px-3"
                    defaultValue={typeof searchParams.maxPrecio === "string" ? searchParams.maxPrecio : ""}
                  />
                </label>
              </div>

              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  name="stock"
                  value="1"
                  defaultChecked={filters.inStock}
                  className="h-4 w-4 accent-[var(--brand-500)]"
                />
                Solo productos con stock
              </label>

              <label className="grid gap-2 text-sm font-medium text-slate-700">
                <span>Ordenar</span>
                <select name="sort" className="field-input" defaultValue={filters.sort}>
                  <option value="price_asc">Menor precio</option>
                  <option value="price_desc">Mayor precio</option>
                  <option value="bestsellers">Mas vendidos</option>
                  <option value="recommended">Recomendados</option>
                </select>
              </label>

              <button className="button-primary w-full justify-center" type="submit">
                Aplicar filtros
              </button>
            </form>
          </aside>

          <section className="space-y-5">
            <div className="surface-card flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="eyebrow">Resultados</p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-950">{products.length} productos encontrados</h2>
              </div>
              <p className="max-w-xl text-sm leading-6 text-slate-600">
                Todas las cards muestran precio, medida, tipo de vehiculo y disponibilidad para acelerar comparacion.
              </p>
            </div>

            {products.length === 0 ? (
              <div className="surface-card p-10 text-center">
                <h3 className="text-2xl font-semibold text-slate-950">No hay productos para esos filtros.</h3>
                <p className="mt-3 text-sm text-slate-600">
                  Prueba otra medida, elimina filtros o vuelve al catalogo general.
                </p>
                <Link href="/catalogo" className="button-primary mt-6">
                  Ver todo el catalogo
                </Link>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
