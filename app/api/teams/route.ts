import { NextResponse } from "next/server";
import { getErrorMessage } from "../helpers";
import { getTeamsByRoles } from "@/services/teams";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const roles: string[] | null =
      searchParams.get("roles")?.split(",") || null;
    const teams: any[] = [];

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
