import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { scope?: string } | null;

  if (!body?.scope) {
    return NextResponse.json({ ok: false, error: "invalid-payload" }, { status: 400 });
  }

  if (body.scope === "products") {
    revalidateTag("products");
    revalidatePath("/");
    revalidatePath("/catalogo");
    return NextResponse.json({ ok: true, scope: body.scope });
  }

  return NextResponse.json({ ok: false, error: "unsupported-scope" }, { status: 400 });
}
