// File: backend/utils/appError.ts
/**
 * Custom application error class that extends Error
 * This provides a consistent error structure across the application
 */
export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    // Capture stack trace for debugging
    Error.captureStackTrace(this, this.constructor);
  }
}
