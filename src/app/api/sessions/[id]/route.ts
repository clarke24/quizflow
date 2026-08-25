import { NextResponse } from "next/server";
import { getPublicSession, getSession, verifyAdmin } from "@/lib/store";

/** GET session for TV/admin. Admin token unlocks control metadata. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = new URL(request.url).searchParams.get("adminToken");
  const session = getSession(id);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const pub = getPublicSession(session);
  if (verifyAdmin(id, token)) {
    return NextResponse.json({
      ...pub,
      isAdmin: true,
      adminToken: session.adminToken,
    });
  }

  return NextResponse.json({ ...pub, isAdmin: false });
}
