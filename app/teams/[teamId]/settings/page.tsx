import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import {  getEmailTemplates } from "@/services/email-templates";
import { EmailTemplate } from "@/types";

import CreateEmailTemplate from "@/components/forms/create-email-template";
import StrategicPrioritiesForm from "@/components/forms/strategic-priorities";

interface PageProps {
  params: Promise<{
    teamId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { teamId } = await params;

  
  const templates = await getEmailTemplates(teamId);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Team Settings</h1>
        <p className="text-muted-foreground mt-2">{`Manage your team's settings and email templates`}</p>
      </div>
      <div className="space-y-8">
        <StrategicPrioritiesForm teamId={teamId} />
        <Card>
          <div className="space-y-4">
            <CreateEmailTemplate teamId={teamId} templates={templates.filter(template => template.teamId !== null) as EmailTemplate[]} />
          </div>
        </Card>
      </div>
    </div>
  );
}
