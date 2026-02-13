"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type LoginMethod = "EMAIL_MAGIC_LINK" | "OIDC";

type TeamAuthSettings = {
  loginDomain?: string | null;
  loginMethod?: LoginMethod | null;
  oidcIssuer?: string | null;
  oidcClientId?: string | null;
  hasOidcClientSecret?: boolean;
};

const fetcher = async (url: string) => {
  const response = await fetch(url);
  const json = (await response.json()) as TeamAuthSettings & { error?: string };
  if (!response.ok) {
    throw new Error(json.error || response.statusText);
  }
  return json;
};

export default function TeamSsoSettings({ teamId }: { teamId: string }) {
  const { toast } = useToast();
  const { data, error, isLoading, mutate } = useSWR<TeamAuthSettings>(
    `/api/teams/${teamId}`,
    fetcher,
  );

  const [isSaving, setIsSaving] = useState(false);
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("EMAIL_MAGIC_LINK");
  const [loginDomain, setLoginDomain] = useState("");
  const [oidcIssuer, setOidcIssuer] = useState("");
  const [oidcClientId, setOidcClientId] = useState("");
  const [oidcClientSecret, setOidcClientSecret] = useState("");
  const [hasOidcClientSecret, setHasOidcClientSecret] = useState(false);
  const [initialSnapshot, setInitialSnapshot] = useState("");
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (!data) {
      return;
    }

    const nextLoginMethod = (data.loginMethod || "EMAIL_MAGIC_LINK") as LoginMethod;
    const nextLoginDomain = data.loginDomain || "";
    const nextOidcIssuer = data.oidcIssuer || "";
    const nextOidcClientId = data.oidcClientId || "";
    const nextHasOidcClientSecret = Boolean(data.hasOidcClientSecret);

    setLoginMethod(nextLoginMethod);
    setLoginDomain(nextLoginDomain);
    setOidcIssuer(nextOidcIssuer);
    setOidcClientId(nextOidcClientId);
    setOidcClientSecret("");
    setHasOidcClientSecret(nextHasOidcClientSecret);

    setInitialSnapshot(
      JSON.stringify({
        loginMethod: nextLoginMethod,
        loginDomain: nextLoginDomain,
        oidcIssuer: nextOidcIssuer,
        oidcClientId: nextOidcClientId,
      }),
    );
  }, [data]);

  useEffect(() => {
    if (!error) {
      return;
    }

    toast({
      title: "Unable to load SSO settings",
      description: error.message,
      variant: "destructive",
    });
  }, [error, toast]);

  const isOidc = loginMethod === "OIDC";

  const isDirty = useMemo(() => {
    const currentSnapshot = JSON.stringify({
      loginMethod,
      loginDomain: loginDomain.trim(),
      oidcIssuer: oidcIssuer.trim(),
      oidcClientId: oidcClientId.trim(),
    });
    return currentSnapshot !== initialSnapshot || oidcClientSecret.trim().length > 0;
  }, [initialSnapshot, loginMethod, loginDomain, oidcIssuer, oidcClientId, oidcClientSecret]);

  const providerId = `oidc-${teamId}`;
  const redirectUri = origin
    ? `${origin}/api/auth/callback/${providerId}`
    : "";
  const signInUri = origin ? `${origin}/api/auth/signin/${providerId}` : "";

  const copyValue = async (label: string, value: string) => {
    if (!value) {
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      toast({
        title: `${label} copied`,
        description: value,
      });
    } catch {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard. Please copy manually.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          loginMethod,
          loginDomain: loginDomain.trim(),
          oidcIssuer: isOidc ? oidcIssuer.trim() : "",
          oidcClientId: isOidc ? oidcClientId.trim() : "",
          oidcClientSecret: isOidc ? oidcClientSecret.trim() : "",
        }),
      });

      const json = (await response.json()) as TeamAuthSettings & { error?: string };
      if (!response.ok) {
        throw new Error(json.error || response.statusText);
      }

      await mutate(json, { revalidate: false });
      toast({
        title: "SSO settings saved",
        description: "Team authentication settings were updated.",
      });
    } catch (saveError) {
      toast({
        title: "Unable to save SSO settings",
        description:
          saveError instanceof Error ? saveError.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Authentication</CardTitle>
        <CardDescription>
          Configure how team members sign in for your team domain.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="team-login-method">Login method</Label>
          <Select value={loginMethod} onValueChange={(value) => setLoginMethod(value as LoginMethod)}>
            <SelectTrigger id="team-login-method">
              <SelectValue placeholder="Select login method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EMAIL_MAGIC_LINK">Email magic link</SelectItem>
              <SelectItem value="OIDC">OIDC</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="team-login-domain">Login domain</Label>
          <Input
            id="team-login-domain"
            placeholder="@example.org"
            value={loginDomain}
            onChange={(event) => setLoginDomain(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Users with this email domain will use the selected login method.
          </p>
        </div>

        {isOidc && (
          <>
            <div className="space-y-3 rounded-md border p-3">
              <p className="text-sm font-medium">OIDC setup endpoints</p>
              <div className="space-y-2">
                <Label htmlFor="team-oidc-provider-id">Provider ID</Label>
                <div className="flex gap-2">
                  <Input id="team-oidc-provider-id" value={providerId} readOnly />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => copyValue("Provider ID", providerId)}
                  >
                    Copy
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="team-oidc-redirect-uri">Redirect URI</Label>
                <div className="flex gap-2">
                  <Input
                    id="team-oidc-redirect-uri"
                    value={redirectUri}
                    readOnly
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => copyValue("Redirect URI", redirectUri)}
                    disabled={!redirectUri}
                  >
                    Copy
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="team-oidc-signin-uri">Sign-in endpoint</Label>
                <div className="flex gap-2">
                  <Input id="team-oidc-signin-uri" value={signInUri} readOnly />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => copyValue("Sign-in endpoint", signInUri)}
                    disabled={!signInUri}
                  >
                    Copy
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Use the redirect URI in your identity provider app settings.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="team-oidc-issuer">OIDC issuer</Label>
              <Input
                id="team-oidc-issuer"
                placeholder="https://idp.example.com"
                value={oidcIssuer}
                onChange={(event) => setOidcIssuer(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team-oidc-client-id">OIDC client ID</Label>
              <Input
                id="team-oidc-client-id"
                placeholder="OIDC client ID"
                value={oidcClientId}
                onChange={(event) => setOidcClientId(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team-oidc-client-secret">OIDC client secret</Label>
              <Input
                id="team-oidc-client-secret"
                type="password"
                placeholder="OIDC client secret"
                value={oidcClientSecret}
                onChange={(event) => setOidcClientSecret(event.target.value)}
              />
              {hasOidcClientSecret && (
                <p className="text-xs text-muted-foreground">
                  Leave client secret empty to keep the existing secret.
                </p>
              )}
            </div>
          </>
        )}

        <div className="flex justify-end">
          <Button type="button" onClick={handleSave} disabled={isLoading || isSaving || !isDirty}>
            {isSaving ? "Saving..." : "Save Authentication Settings"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
