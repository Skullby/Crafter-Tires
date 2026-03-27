"use server";

const STOREFRONT_BASE_URL =
  process.env.NEXT_PUBLIC_STOREFRONT_URL ?? "https://storefront-seven-tan.vercel.app";
const STOREFRONT_REVALIDATE_URL = `${STOREFRONT_BASE_URL}/api/revalidate`;

export async function revalidateStorefrontProducts() {
  const response = await fetch(STOREFRONT_REVALIDATE_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({ scope: "products" }),
    cache: "no-store"
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(`Storefront revalidation failed (${response.status}): ${details}`);
  }
}
