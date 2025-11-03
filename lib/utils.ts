// lib/error-handlers.ts
import { Prisma } from "@prisma/client";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function handlePrismaError(error: unknown): Error {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    console.error(`Prisma Error (${error.code}):`, error.message);

    switch (error.code) {
      case "P2002":
        return new Error("Entity already exists with this email.");
      case "P2025":
        return new Error("Record not found.");
      // Add more Prisma error codes as needed
      default:
        return new Error(`Database error: ${error.code}`);
    }
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    console.error("Validation Error:", error.message);
    return new Error("Invalid input data format.");
  } else if (error instanceof Error) {
    // Handle regular Error objects
    console.error("Error:", error.message);
    return error;
  } else if (typeof error === "string") {
    // Handle string errors
    console.error("Error:", error);
    return new Error(error);
  }

  console.error("Unexpected Error:", error);
  return new Error("Operation failed! Please try again later.");
}

export function cleanFileName(fileName: string): string {
  return fileName
    .trim() // Remove leading/trailing spaces
    .replace(/[^a-zA-Z0-9._ ]/g, "") // Remove special characters except dot, underscore, and space
    .replace(/\s+/g, "-") // Replace spaces with dashes
    .toLowerCase(); // Convert to lowercase (optional)
}

export function calculateMonthsDuration(
  endDate: Date,
  startDate: Date,
): number {
  return Math.ceil(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) /
      (1000 * 60 * 60 * 24 * 30),
  );
}

export function getAppUrl(): string {
  const rawUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "";

  if (!rawUrl) {
    return "";
  }

  try {
    const parsed = new URL(rawUrl);
    const origin = parsed.origin;
    const pathname = parsed.pathname.replace(/\/$/, "");

    if (!pathname || pathname === "/" || pathname === "/api/auth") {
      return origin;
    }

    return `${origin}${pathname}`;
  } catch {
    return rawUrl.replace(/\/api\/auth\/?$/, "").replace(/\/$/, "");
  }
}

export function getLoginUrl(path = "/"): string {
  const baseUrl = getAppUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (!baseUrl) {
    return normalizedPath;
  }

  return `${baseUrl}${normalizedPath}`;
}
