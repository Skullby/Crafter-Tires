import { NextResponse } from "next/server";
import { z } from "zod";
import { addToCart } from "../../../../lib/cart";
import { attachSessionCookie } from "../../../../lib/session";

const schema = z.object({
  productId: z.string().cuid(),
  quantity: z.number().int().min(1).max(10)
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.parse(body);
    await addToCart(parsed.productId, parsed.quantity);
    return attachSessionCookie(NextResponse.json({ ok: true }));
  } catch (error) {
    return NextResponse.json({ ok: false, error: "No se pudo agregar el producto" }, { status: 400 });
  }
}
