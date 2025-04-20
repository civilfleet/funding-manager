import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

import CreateEmailTemplate from "@/components/forms/create-email-template";

interface PageProps {
  params: Promise<{
    teamId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { teamId } = await params;

  const templates = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/teams/${teamId}/email-templates`);
  const templatesData = await templates.json();
  console.log(templatesData);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Team Settings</h1>
        <p className="text-muted-foreground mt-2">{`Manage your team's settings and email templates`}</p>
      </div>
      <Card>
        <div className="space-y-4">
          <CreateEmailTemplate teamId={teamId} templates={templatesData} />
        </div>
      </Card>
    </div>
  );
}
