export class ApiError extends Error {
  constructor(message: string, public statusCode = 422) {
    super(message);
  }
}
