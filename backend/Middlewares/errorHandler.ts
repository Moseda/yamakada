// File: backend/middleware/errorHandler.ts
import { Request, Response } from "express";
import { AppError } from "../utils/appError";

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response
) => {
  let statusCode = 500;
  let message = "Internal Server Error";

  // Handle specific error types
  if ("statusCode" in err) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.name === "MulterError") {
    statusCode = 400;
    message = err.message;

    if (err.message.includes("LIMIT_FILE_SIZE")) {
      message = "File size exceeds the limit of 10MB";
    }
  }

  // Log error
  console.error(`[ERROR] ${statusCode}:`, err);

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
  });
};
