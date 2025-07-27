import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { getEmailTemplates } from "@/services/email-templates";
import { EmailTemplate } from "@/types";

import CreateEmailTemplate from "@/components/forms/create-email-template";
import StrategicPrioritiesForm from "@/components/forms/strategic-priorities";
import FormConfigurationManager from "@/components/forms/form-configuration-manager";

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
        <p className="text-muted-foreground mt-2">{`Manage your team's settings, email templates, and funding request forms`}</p>
      </div>
      
      <Tabs defaultValue="general" className="space-y-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="email-templates">Email Templates</TabsTrigger>
          <TabsTrigger value="form-configuration">Funding Request Form</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-8">
          <StrategicPrioritiesForm teamId={teamId} />
        </TabsContent>
        
        <TabsContent value="email-templates" className="space-y-8">
          <Card>
            <div className="space-y-4">
              <CreateEmailTemplate teamId={teamId} templates={templates.filter(template => template.teamId !== null) as EmailTemplate[]} />
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="form-configuration" className="space-y-8">
          <FormConfigurationManager teamId={teamId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
