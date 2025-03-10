import { NextResponse } from "next/server";
import { createTeam, getTeamsByRoles } from "@/services/teams";
import { createTeamSchema } from "@/validations/team";
import { handlePrismaError } from "@/lib/utils";
import { sendEmail } from "@/lib/nodemailer";

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
    const { message } = handlePrismaError(e);
    return NextResponse.json(
      { error: message },
      { status: 400, statusText: message }
    );
  }
}

export async function POST(req: Request) {
  try {
    const teamData = await req.json();
    const validatedData = createTeamSchema.parse(teamData);

    const { team } = await createTeam(validatedData);

    // if teamId is provided, it means the organization is created by a team
    await Promise.all([
      sendEmail(
        {
          to: team.email,
          subject: "You’re In! Welcome to Partner App.",
          template: "welcome",
        },
        {
          name: team.name,
          email: team.email,
        }
      ),
      sendEmail(
        {
          to: team.contactPersons[0].email,
          subject: "You’re In! Welcome to Partner App.",
          template: "welcome",
        },
        {
          name: team.contactPersons[0].name,
          email: validatedData.email,
        }
      ),
    ]);

    return NextResponse.json(team, { status: 201 });
  } catch (e) {
    const { message } = handlePrismaError(e);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
