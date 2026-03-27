import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { verifyRevalidationSignature } from "@crafter/database";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | { scope?: string; issuedAt?: number; signature?: string }
    | null;

  if (!body?.scope || typeof body.issuedAt !== "number" || !body.signature) {
    return NextResponse.json({ ok: false, error: "invalid-payload" }, { status: 400 });
  }

  const isValid = verifyRevalidationSignature(
    { scope: body.scope, issuedAt: body.issuedAt },
    body.signature
  );

  if (!isValid) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  if (body.scope === "products") {
    revalidateTag("products");
    revalidatePath("/");
    revalidatePath("/catalogo");
    return NextResponse.json({ ok: true, scope: body.scope });
  }

  return NextResponse.json({ ok: false, error: "unsupported-scope" }, { status: 400 });
}
