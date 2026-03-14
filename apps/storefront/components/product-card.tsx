import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "./add-to-cart-button";
import { formatCurrency, formatMeasure, formatVehicleType } from "../lib/format";

type ProductCardProps = {
  product: {
    id: string;
    slug: string;
    name: string;
    price: { toNumber(): number };
    previousPrice: { toNumber(): number } | null;
    discountPercentage: number | null;
    width: number;
    height: number;
    rim: number;
    vehicleType: string;
    runFlat: boolean;
    brand: {
      name: string;
    };
    inventory: {
      stock: number;
    } | null;
    images: Array<{
      url: string;
      alt: string;
    }>;
  };
};

function getStockLabel(stock: number) {
  if (stock <= 0) {
    return {
      text: "Sin stock",
      className: "bg-rose-100 text-rose-700"
    };
  }

  if (stock <= 5) {
    return {
      text: `Ultimas ${stock} unidades`,
      className: "bg-amber-100 text-amber-700"
    };
  }

  return {
    text: "Disponible",
    className: "bg-emerald-100 text-emerald-700"
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const stock = product.inventory?.stock ?? 0;
  const stockBadge = getStockLabel(stock);
  const image = product.images[0];

  return (
    <article className="product-card group">
      <Link href={`/producto/${product.slug}`} className="block">
        <div className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50">
          <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
            <span className="chip-muted">{product.brand.name}</span>
            <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${stockBadge.className}`}>
              {stockBadge.text}
            </span>
          </div>
          <div className="relative aspect-[4/3]">
            {image ? (
              <Image
                src={image.url}
                alt={image.alt}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.95),_rgba(226,232,240,0.9))]">
                <div className="h-36 w-36 rounded-full border-[18px] border-slate-900/85 shadow-[inset_0_0_0_10px_rgba(255,255,255,0.25)]" />
              </div>
            )}
          </div>
        </div>
      </Link>

      <div className="mt-4 flex flex-col gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="chip-dark">{formatMeasure(product.width, product.height, product.rim)}</span>
            <span className="chip-muted">{formatVehicleType(product.vehicleType)}</span>
            {product.runFlat ? <span className="chip-muted">Run Flat</span> : null}
          </div>
          <Link href={`/producto/${product.slug}`} className="block">
            <h3 className="text-xl font-semibold leading-tight text-slate-950 transition group-hover:text-[var(--brand-600)]">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          {product.previousPrice ? (
            <p className="text-sm text-slate-400 line-through">
              {formatCurrency(product.previousPrice.toNumber())}
            </p>
          ) : null}
          <div className="flex items-end justify-between gap-3">
            <p className="text-3xl font-semibold leading-none text-slate-950">
              {formatCurrency(product.price.toNumber())}
            </p>
            {product.discountPercentage ? (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                {product.discountPercentage}% OFF
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-slate-600">Hasta 6 cuotas con Mercado Pago.</p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Link href={`/producto/${product.slug}`} className="button-secondary justify-center">
            Ver detalle
          </Link>
          <AddToCartButton productId={product.id} label="Agregar" className="w-full" />
        </div>
      </div>
    </article>
  );
}
