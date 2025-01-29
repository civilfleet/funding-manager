import { NextResponse } from "next/server";
let organizations = [
  { id: 1, name: "Org 1", description: "First organization" },
  { id: 2, name: "Org 2", description: "Second organization" },
];
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const org = organizations.find((o) => o.id === Number(params.id));
  return org
    ? NextResponse.json(org)
    : NextResponse.json({ error: "Not Found" }, { status: 404 });
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { name, description } = await req.json();
  const orgIndex = organizations.findIndex((o) => o.id === Number(params.id));

  if (orgIndex === -1)
    return NextResponse.json({ error: "Not Found" }, { status: 404 });

  organizations[orgIndex] = { id: Number(params.id), name, description };
  return NextResponse.json(organizations[orgIndex]);
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  organizations = organizations.filter((o) => o.id !== Number(params.id));
  return NextResponse.json({ message: "Deleted successfully" });
}
