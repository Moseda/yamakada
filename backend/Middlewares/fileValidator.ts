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

// Extended Request interface to include the properties we add
interface ExtendedRequest extends Request {
  parsedData?: any;
  structure?: any;
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
    let parsedData: any;
    let structure: any;

    // Perform deep validation based on extension or mime type
    try {
      switch (fileExtension) {
        case "json":
          // Validate JSON format and get parsed data
          const jsonResult = await parseJsonFile(filePath);
          parsedData = jsonResult.parsedData;
          structure = jsonResult.structure;
          fileType = "JSON";
          isValid = true;
          break;

        case "csv":
          // Validate CSV format and get parsed data
          const csvResult: any = await parseCsvFile(filePath);
          parsedData = csvResult.parsedData;
          structure = csvResult.structure;
          fileType = "CSV";
          isValid = true;
          break;

        case "xlsx":
        case "xls":
          // Validate Excel format and get parsed data
          const excelResult = await parseExcelFile(filePath);
          parsedData = excelResult.parsedData;
          structure = excelResult.structure;
          fileType = "EXCEL";
          isValid = true;
          break;

        case "xml":
          // Validate XML and detect if it's BMEcat
          const xmlResult = await parseXmlFile(filePath);
          parsedData = xmlResult.parsedData;
          structure = xmlResult.structure;

          if (xmlResult.isBMEcat) {
            fileType = "BMECAT";
          } else {
            fileType = "XML";
          }
          isValid = true;
          break;

        default:
          throw new Error(`Unsupported file format: ${fileExtension}`);
      }
    } catch (error: any) {
      // If validation fails, delete the uploaded file
      try {
        await fs.unlink(filePath);
      } catch (unlinkError) {
        console.error("Error deleting invalid file:", unlinkError);
      }

      return next(new AppError(`Invalid file format: ${error.message}`, 400));
    }

    // If we reach here, file is valid
    req.body.fileType = fileType;

    // Add parsed data and structure to the request object for the controller
    req.parsedData = parsedData;
    req.structure = structure;

    next();
  } catch (error: any) {
    console.error("File validation error:", error);
    next(new AppError(`Error validating file: ${error.message}`, 500));
  }
};
