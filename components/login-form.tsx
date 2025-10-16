"use client";

import { useState } from "react";
import { sendLoginLink } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLinkSent, setIsLinkSent] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (email: string) => {
    // Simple email regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <h1 className="text-2xl font-bold">Login to your account</h1>

      <form
        className={cn("flex flex-col gap-3 w-full text-center", className)}
        action={async (formData) => {
          setIsLoading(true);
          const email = formData.get("email") as string;
          if (!validateEmail(email)) {
            setError("Please enter a valid email address.");
            setIsLoading(false);
            return;
          }
          setError("");
          try {
            await sendLoginLink(formData);
            setIsLinkSent(true);
          } catch (error) {
            console.log("Login error:", error);
            setError("Account not found.");
          } finally {
            setIsLoading(false);
          }
        }}
        {...props}
      >
        {!isLinkSent ? (
          <>
            <input
              type="email"
              name="email"
              placeholder="Email"
              disabled={isLoading}
              aria-label="Email address"
              aria-invalid={!!error}
              aria-describedby={error ? "email-error" : undefined}
              className={cn(
                "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                className,
              )}
            />
            {error && (
              <div
                id="email-error"
                className="text-red-600 text-sm mt-1 text-left"
                role="alert"
              >
                {error}
              </div>
            )}
            <Button
              variant="outline"
              className="w-44 mx-auto"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Login"}
            </Button>
          </>
        ) : (
          <div className="text-green-600 font-medium">
            Login link has been sent to your email!
          </div>
        )}
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
