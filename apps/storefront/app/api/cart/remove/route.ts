import { NextResponse } from "next/server";
import { z } from "zod";
import { removeCartItem } from "../../../../lib/cart";
import { attachSessionCookie } from "../../../../lib/session";

const schema = z.object({
  itemId: z.string().cuid()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.parse(body);
    await removeCartItem(parsed.itemId);
    return attachSessionCookie(NextResponse.json({ ok: true }));
  } catch {
    return NextResponse.json({ ok: false, error: "No se pudo quitar el producto" }, { status: 400 });
  }
}
