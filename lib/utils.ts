// lib/error-handlers.ts
import { Prisma } from "@prisma/client";
import { clsx, type ClassValue } from "clsx";
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
