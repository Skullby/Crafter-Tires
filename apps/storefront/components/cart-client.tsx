"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatCurrency } from "../lib/format";

type CartItem = {
  id: string;
  quantity: number;
  unitPrice: number;
  product: {
    id: string;
    name: string;
    slug: string;
    stock: number;
    measure: string;
    image?: {
      url: string;
      alt: string;
    };
  };
};

export function CartClient({ items }: { items: CartItem[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function update(itemId: string, quantity: number) {
    setLoadingId(itemId);
    await fetch("/api/cart/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, quantity })
    });
    router.refresh();
    setLoadingId(null);
  }

  async function remove(itemId: string) {
    setLoadingId(itemId);
    await fetch("/api/cart/remove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId })
    });
    router.refresh();
    setLoadingId(null);
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <article key={item.id} className="surface-card p-4 md:p-5">
          <div className="grid gap-4 md:grid-cols-[140px_1fr_auto] md:items-center">
            <Link href={`/producto/${item.product.slug}`} className="relative block aspect-square overflow-hidden rounded-[1.5rem] bg-slate-100">
              {item.product.image ? (
                <Image
                  src={item.product.image.url}
                  alt={item.product.image.alt}
                  fill
                  sizes="140px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="h-20 w-20 rounded-full border-[12px] border-slate-900/85" />
                </div>
              )}
            </Link>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Producto</p>
                <Link href={`/producto/${item.product.slug}`} className="mt-1 block text-2xl font-semibold text-slate-950">
                  {item.product.name}
                </Link>
                <p className="mt-1 text-sm text-slate-600">{item.product.measure}</p>
                <p className="mt-1 text-sm text-slate-600">Stock disponible: {item.product.stock}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-lg"
                  disabled={loadingId === item.id}
                  onClick={() => update(item.id, item.quantity - 1)}
                  type="button"
                >
                  -
                </button>
                <span className="min-w-10 text-center text-base font-semibold">{item.quantity}</span>
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-lg"
                  disabled={loadingId === item.id}
                  onClick={() => update(item.id, item.quantity + 1)}
                  type="button"
                >
                  +
                </button>
                <button
                  className="rounded-full border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700"
                  disabled={loadingId === item.id}
                  onClick={() => remove(item.id)}
                  type="button"
                >
                  Eliminar
                </button>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-right">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Subtotal</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {formatCurrency(item.unitPrice * item.quantity)}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {formatCurrency(item.unitPrice)} por unidad
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
