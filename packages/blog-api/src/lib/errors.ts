export class ApiError extends Error {
  constructor(message: string, public statusCode = 422) {
    super(message);
  }
}

export class UnauthorizedError extends ApiError {
  constructor() {
    super('Unauthorized', 401);
  }
}
