import { NextResponse } from "next/server";
import { z } from "zod";
import { updateCartItem } from "../../../../lib/cart";
import { attachSessionCookie } from "../../../../lib/session";

const schema = z.object({
  itemId: z.string().cuid(),
  quantity: z.number().int().min(0).max(99)
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.parse(body);
    await updateCartItem(parsed.itemId, parsed.quantity);
    return attachSessionCookie(NextResponse.json({ ok: true }));
  } catch {
    return NextResponse.json({ ok: false, error: "No se pudo actualizar el carrito" }, { status: 400 });
  }
}
