import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signIn } from "@/auth";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      action={async () => {
        "use server";
        await signIn("keycloak", { redirectTo: "/" });
      }}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>

        <Button variant="outline" className="w-full">
          Login as Organization
        </Button>
        <Button variant="outline" className="w-full">
          Login as Agent
        </Button>
      </div>
      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <a
          href="mailto:support@lnob.net"
          className="underline underline-offset-4"
        >
          Please contact us to create one
        </a>
      </div>
    </form>
  );
}
