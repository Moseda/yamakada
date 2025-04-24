// File: backend/middleware/fileValidator.ts
import { Request, Response, NextFunction } from "express";
import fs from "fs/promises";
import {
  parseJsonFile,
  parseCsvFile,
  parseExcelFile,
  parseXmlFile,
} from "../utils/fileParser";
import { AppError } from "../utils/appError";

// Define a generic structure type
type Structure = Record<string, unknown>;
type ParsedData = Record<string, unknown>[];

// Extended Request interface to include the properties we add
interface ExtendedRequest extends Request {
  parsedData?: ParsedData;
  structure?: Structure;
}

// File parser return format
interface FileParseResult {
  parsedData: ParsedData;
  structure: Structure;
  isBMEcat?: boolean;
}

export const validateFileType = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      return next(new AppError("No file uploaded", 400));
    }
    const filePath = req.file.path;
    const fileExtension = req.file.originalname.split(".").pop()?.toLowerCase();
    let fileType = req.body.fileType || "";
    let isValid = false;
    let parsedData: ParsedData = [];
    let structure: Structure = {};

    // Perform deep validation based on extension or mime type
    try {
      let result: FileParseResult;
      switch (fileExtension) {
        case "json":
          // Validate JSON format and get parsed data
          result = await parseJsonFile(filePath);
          fileType = "JSON";
          break;

        case "csv":
          // Validate CSV format and get parsed data
          result = await parseCsvFile(filePath);
          fileType = "CSV";
          break;

        case "xlsx":
        case "xls":
          // Validate Excel format and get parsed data
          result = await parseExcelFile(filePath);
          fileType = "EXCEL";
          break;

        case "xml":
          // Validate XML and detect if it's BMEcat
          result = await parseXmlFile(filePath);
          fileType = result.isBMEcat ? "BMECAT" : "XML";
          break;

        default:
          throw new Error(`Unsupported file format: ${fileExtension}`);
      }
      parsedData = result.parsedData;
      structure = result.structure;
      isValid = true;
    } catch (error: unknown) {
      await fs
        .unlink(filePath)
        .catch((unlinkError) =>
          console.error("Error deleting invalid file:", unlinkError)
        );

      return next(
        new AppError(
          `Invalid file format: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          400
        )
      );
    }

    if (isValid) {
      req.body.fileType = fileType;
      req.parsedData = parsedData;
      req.structure = structure;
      next();
    }
  } catch (error: unknown) {
    console.error("File validation error:", error);
    next(
      new AppError(
        `Error validating file: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        500
      )
    );
  }
};
