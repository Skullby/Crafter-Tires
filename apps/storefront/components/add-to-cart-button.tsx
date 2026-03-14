"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type AddToCartButtonProps = {
  productId: string;
  label?: string;
  className?: string;
};

export function AddToCartButton({
  productId,
  label = "Agregar",
  className = ""
}: AddToCartButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      disabled={loading}
      onClick={async () => {
        try {
          setLoading(true);
          await fetch("/api/cart/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId, quantity: 1 })
          });
          router.refresh();
        } finally {
          setLoading(false);
        }
      }}
      className={`button-primary justify-center disabled:cursor-not-allowed disabled:opacity-70 ${className}`.trim()}
    >
      {loading ? "Agregando..." : label}
    </button>
  );
}
