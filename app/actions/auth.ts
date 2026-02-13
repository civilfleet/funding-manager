"use server";

import { signIn } from "@/auth";
import { resolveExpectedProviderByEmail } from "@/lib/auth-routing";

export type LoginStrategyResult =
  | {
      strategy: "OIDC";
      provider: `oidc-${string}`;
    }
  | {
      strategy: "EMAIL_MAGIC_LINK";
    };

export async function resolveLoginStrategy(
  formData: FormData,
): Promise<LoginStrategyResult> {
  const email = formData.get("email")?.toString().trim() ?? "";

  try {
    const provider = await resolveExpectedProviderByEmail(email);

    if (provider !== "nodemailer") {
      return {
        strategy: "OIDC",
        provider,
      };
    }

    return {
      strategy: "EMAIL_MAGIC_LINK",
    };
  } catch {
    throw new Error("Unable to sign in with this email.");
  }
}

export async function sendMagicLoginLink(formData: FormData) {
  const email = formData.get("email")?.toString().trim() ?? "";

  try {
    await signIn("nodemailer", {
      redirect: false,
      redirectTo: "/organizations",
      email,
    });
  } catch {
    throw new Error("Unable to sign in with this email.");
  }
}
