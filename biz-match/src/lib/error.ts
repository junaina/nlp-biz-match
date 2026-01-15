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
