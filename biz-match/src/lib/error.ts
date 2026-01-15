export class HttpError extends Error {
  public readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
    this.name = "HttpError";
  }
}

// Auth-specific alias (optional)
export class AuthError extends HttpError {
  constructor(message: string, status = 400) {
    super(message, status);
    this.name = "AuthError";
  }
}
export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;

  if (typeof err === "object" && err !== null && "message" in err) {
    const maybeMessage = (err as { message?: unknown }).message;
    if (typeof maybeMessage === "string") return maybeMessage;
  }

  return "Something went wrong";
}
