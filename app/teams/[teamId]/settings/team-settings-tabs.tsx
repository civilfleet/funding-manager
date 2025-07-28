"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { EmailTemplate } from "@/types";

import CreateEmailTemplate from "@/components/forms/create-email-template";
import StrategicPrioritiesForm from "@/components/forms/strategic-priorities";
import FormConfigurationManager from "@/components/forms/form-configuration-manager";

interface TeamSettingsTabsProps {
  teamId: string;
  templates: EmailTemplate[];
}

const VALID_TABS = ["general", "email-templates", "form-configuration"] as const;
type TabValue = typeof VALID_TABS[number];

export default function TeamSettingsTabs({ teamId, templates }: TeamSettingsTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get tab from URL or default to "general"
  const tabFromUrl = searchParams.get("tab");
  const isValidTab = (tab: string | null): tab is TabValue => 
    tab !== null && VALID_TABS.includes(tab as TabValue);
  
  const [activeTab, setActiveTab] = useState<TabValue>(
    isValidTab(tabFromUrl) ? tabFromUrl : "general"
  );

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    if (isValidTab(value)) {
      setActiveTab(value);
      
      // Update URL without triggering navigation
      const url = new URL(window.location.href);
      url.searchParams.set("tab", value);
      router.replace(url.pathname + url.search, { scroll: false });
    }
  };

  // Listen for URL changes (e.g., browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      const currentParams = new URLSearchParams(window.location.search);
      const newTab = currentParams.get("tab");
      if (isValidTab(newTab)) {
        setActiveTab(newTab);
      } else {
        setActiveTab("general");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
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
            <CreateEmailTemplate teamId={teamId} templates={templates} />
          </div>
        </Card>
      </TabsContent>
      
      <TabsContent value="form-configuration" className="space-y-8">
        <FormConfigurationManager teamId={teamId} />
      </TabsContent>
    </Tabs>
  );
}