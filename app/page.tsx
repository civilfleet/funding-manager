import { GalleryVerticalEnd } from "lucide-react";
import { LoginForm } from "@/components/login-form";
import { auth } from "@/auth";
import { Roles } from "@/types";
import { redirect } from "next/navigation";
import { getUserCurrent } from "@/services/users";

export default async function LoginPage() {
  const session = await auth();
  
  if (session?.user?.userId) {
    if (session.user.roles?.includes(Roles.Admin)) {
      return redirect("/admin");
    } else if (session.user.roles?.includes(Roles.Organization)) {
      const userData = await getUserCurrent(session.user.userId);
      if (userData?.organizations && userData.organizations.length > 0) {
        return redirect(`/organizations/${userData.organizations[0].id}`);
      }
      return redirect("/organizations");
    } else if (session.user.roles?.includes(Roles.Team)) {
      const userData = await getUserCurrent(session.user.userId);
      if (userData?.teams && userData.teams.length > 0) {
        return redirect(`/teams/${userData.teams[0].id}`);
      }
      return redirect("/teams");
    }
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Funding Management System
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      {/* <div className="relative hidden bg-muted lg:block">
        <img
          src="/placeholder.svg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div> */}
    </div>
  );
}
