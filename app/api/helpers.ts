function getErrorMessage(error: unknown) {
  console.log("error", error);

  if (typeof error === "object" && error !== null && "issues" in error) {
    if (Array.isArray((error as any).issues)) {
      return (error as any).issues[0]?.message;
    }
  }
  if (error instanceof Error) return error.message;
  return String(error);
}
export { getErrorMessage };
