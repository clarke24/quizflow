import { NextResponse } from "next/server";
import { getSessionByCode } from "@/lib/store";

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "Code required" }, { status: 400 });
  }

  const session = getSessionByCode(code);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json({ sessionId: session.id, code: session.code });
}
