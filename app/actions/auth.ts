"use server";

import { signIn } from "@/auth";

export async function sendLoginLink(formData: FormData) {
  const email = formData.get("email");
  await signIn("nodemailer", {
    redirect: false,
    redirectTo: "/organizations",
    email,
  });
}
