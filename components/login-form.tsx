import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signIn } from "@/auth";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <h1 className="text-2xl font-bold">Login to your account</h1>

      <form
        className={cn("flex flex-col gap-6", className)}
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/organization" });
        }}
        {...props}
      >
        <Button variant="outline" className="w-44">
          Login as Organization
        </Button>
      </form>
      <form
        className={cn(
          "flex flex-col gap-6  items-center gap-2 text-center ",
          className
        )}
        action={async () => {
          "use server";
          await signIn("keycloak", { redirectTo: "/team" });
        }}
        {...props}
      >
        <Button variant="outline" className="w-44">
          Login as Agent
        </Button>
      </form>

      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <a
          href="mailto:support@lnob.net"
          className="underline underline-offset-4"
        >
          Please contact us to create one
        </a>
      </div>
    </div>
  );
}
