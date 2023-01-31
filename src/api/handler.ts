import { NextApiHandler } from "next";
import { ApiError, InternalServerError } from "./errors";

/**
 * JSON object returned by API endpoints when an error occurs.
 */
type ApiErrorResponse = {
  /** Unique identifier of the error */
  error: string;
  /** Longer, human-readable description of the error */
  message?: string;
};

/**
 * Wrapper function for API handlers. Catches {@link ApiError | API errors} thrown by them
 * and responds with the appropriate HTTP status code and JSON payload.
 */
export function createHandler<T>(
  handler: NextApiHandler<T>
): NextApiHandler<T | ApiErrorResponse> {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (e) {
      if (e instanceof ApiError) {
        const { errorCode: error, message } = e;

        if (
          process.env.NODE_ENV !== "development" &&
          e instanceof InternalServerError
        ) {
          console.error("Internal server error occured: %s", message);

          // Do not leak internal server error details in production
          res.status(500).json({ error: "internal-server-error" });
        } else {
          res.status(e.statusCode).json({ error, message });
        }
      } else {
        console.error("Unexpected error occured: %o", e);

        res.status(500).json({ error: "internal-server-error" });
      }
    }

    res.end();
  };
}
