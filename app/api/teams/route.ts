import { NextResponse } from "next/server";
import { getErrorMessage } from "../helpers";
import { createTeam, getTeamsByRoles } from "@/services/teams";
import { createTeamSchema } from "@/validations/team";
import { handlePrismaError } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const roles: string[] | null =
      searchParams.get("roles")?.split(",") || null;
    const teams = [];

    const response = await getTeamsByRoles(roles);

    if (response) {
      teams.push(...response);
    }
    return NextResponse.json(
      {
        teams,
      },
      { status: 201 }
    );
  } catch (e) {
    return NextResponse.json(
      { error: getErrorMessage(e) },
      { status: 400, statusText: getErrorMessage(e) }
    );
  }
}

export async function POST(req: Request) {
  try {
    const teamData = await req.json();
    const validatedData = createTeamSchema.parse(teamData);

    const response = await createTeam(validatedData);
    return NextResponse.json(response, { status: 201 });
  } catch (e) {
    const handledError = handlePrismaError(e);
    return NextResponse.json({ error: handledError.message }, { status: 400 });
  }
}
