"use server";

import { createRevalidationSignature } from "@crafter/database";

const STOREFRONT_REVALIDATE_URL = `${process.env.NEXT_PUBLIC_STOREFRONT_URL ?? "http://localhost:3000"}/api/revalidate`;

export async function revalidateStorefrontProducts() {
  const issuedAt = Date.now();
  const scope = "products";
  const signature = createRevalidationSignature({ scope, issuedAt });

  const response = await fetch(STOREFRONT_REVALIDATE_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({ scope, issuedAt, signature }),
    cache: "no-store"
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(`Storefront revalidation failed (${response.status}): ${details}`);
  }
}
