"use server";

import { signIn } from "@/auth";
import { resolveExpectedProviderByEmail } from "@/lib/auth-routing";

export async function sendLoginLink(formData: FormData) {
  const email = formData.get("email")?.toString() ?? "";

  try {
    const provider = await resolveExpectedProviderByEmail(email);

    if (provider !== "nodemailer") {
      await signIn(provider, {
        redirectTo: "/organizations",
        login_hint: email,
      });
      return;
    }

    await signIn("nodemailer", {
      redirect: false,
      redirectTo: "/organizations",
      email,
    });
  } catch {
    throw new Error("Unable to sign in with this email.");
  }
}
