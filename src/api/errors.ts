import httpStatusCodes from "http-status-codes";

/**
 * Base class for errors thrown by API request handlers.
 *
 * Based on https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#custom_error_types
 */
export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly errorCode: string,
    message?: string
  ) {
    super(message);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }

    this.name = this.constructor.name;
  }
}

export class BadRequestError extends ApiError {
  constructor(
    errorCode: string = "bad-request",
    message: string = "Bad Request"
  ) {
    super(httpStatusCodes.BAD_REQUEST, errorCode, message);

    this.name = this.constructor.name;
  }
}

export class MethodNotAllowedError extends ApiError {
  constructor(
    errorCode: string = "method-not-allowed",
    message: string = "Method Not Allowed"
  ) {
    super(httpStatusCodes.METHOD_NOT_ALLOWED, errorCode, message);

    this.name = this.constructor.name;
  }
}

export class NotFoundError extends ApiError {
  constructor(errorCode: string = "not-found", message: string = "Not Found") {
    super(httpStatusCodes.NOT_FOUND, errorCode, message);

    this.name = this.constructor.name;
  }
}

export class NotAuthenticatedError extends ApiError {
  constructor(
    errorCode: string = "not-authenticated",
    message: string = "Not Authenticated"
  ) {
    super(httpStatusCodes.UNAUTHORIZED, errorCode, message);

    this.name = this.constructor.name;
  }
}

export class NotAuthorizedError extends ApiError {
  constructor(
    errorCode: string = "not-authorized",
    message: string = "Not Authorized"
  ) {
    super(httpStatusCodes.FORBIDDEN, errorCode, message);

    this.name = this.constructor.name;
  }
}

export class InternalServerError extends ApiError {
  constructor(
    errorCode: string = "internal-server-error",
    message: string = "Internal ServerError"
  ) {
    super(httpStatusCodes.INTERNAL_SERVER_ERROR, errorCode, message);

    this.name = this.constructor.name;
  }
}
