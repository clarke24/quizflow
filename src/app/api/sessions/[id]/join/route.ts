import { NextResponse } from "next/server";
import { createTeam, getSession, joinSession } from "@/lib/store";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { action, playerName, teamName, teamId } = body;

  const session = getSession(id);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (action === "create-team") {
    if (!teamName?.trim()) {
      return NextResponse.json({ error: "Team name required" }, { status: 400 });
    }
    const team = createTeam(id, teamName);
    if (!team) {
      return NextResponse.json({ error: "Could not create team" }, { status: 400 });
    }
    return NextResponse.json({ team: { id: team.id, name: team.name, color: team.color } });
  }

  if (action === "join") {
    if (!playerName?.trim() || !teamId) {
      return NextResponse.json(
        { error: "Name and team are required" },
        { status: 400 }
      );
    }
    const player = joinSession(id, playerName, teamId);
    if (!player) {
      return NextResponse.json({ error: "Could not join session" }, { status: 400 });
    }
    return NextResponse.json({
      player: { id: player.id, name: player.name, teamId: player.teamId },
    });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
