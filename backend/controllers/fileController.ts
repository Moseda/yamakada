// imports
import { Request, Response, NextFunction } from "express";
import * as fileRepository from "../repositories/fileRepositories";
import { AppError } from "../utils/appError";

//interfaces
// Define the expected structure of parsed data and structure
interface ParsedStructure {
  [key: string]: unknown;
}
// Extend Request type for TypeScript
interface RequestWithParsedData extends Request {
  parsedData?: Record<string, unknown>[];
  structure?: ParsedStructure;
  file?: Express.Multer.File; // For the uploaded file from multer
}

export const uploadFile = async (
  req: RequestWithParsedData,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      return next(
        new AppError("No file uploaded or file validation failed", 400)
      );
    }

    // Get data prepared by validateFileType middleware
    const fileType = req.body.fileType;
    const parsedData = req.parsedData;
    const structure = req.structure;

    if (!fileType) {
      return next(new AppError("File type could not be determined", 400));
    }

    if (parsedData === undefined || structure === undefined) {
      console.error(
        "Validation middleware did not attach parsed data or structure."
      );
      return next(
        new AppError("Internal server error during file processing", 500)
      );
    }

    // Save file metadata
    const fileId = await fileRepository.saveFileMetadata({
      filename: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      fileType: fileType,
      uploadDate: new Date(),
    });

    // Save the actual data
    let dataId;
    switch (fileType.toUpperCase()) {
      case "JSON":
        dataId = await fileRepository.saveJsonData(
          fileId,
          parsedData,
          structure
        );
        break;
      case "CSV":
        dataId = await fileRepository.saveCsvData(
          fileId,
          parsedData,
          structure
        );
        break;
      case "EXCEL":
        dataId = await fileRepository.saveExcelData(
          fileId,
          parsedData,
          structure
        );
        break;
      case "XML":
        dataId = await fileRepository.saveXmlData(
          fileId,
          parsedData,
          structure
        );
        break;
      case "BMECAT":
        dataId = await fileRepository.saveBmecatData(
          fileId,
          parsedData,
          structure
        );
        break;
      default:
        return next(new AppError(`Invalid file type: ${fileType}`, 400));
    }

    // Return success response with file details
    res.status(201).json({
      success: true,
      message: "File uploaded and processed successfully.",
      data: {
        fileId,
        dataId,
        fileType,
        filename: req.file.originalname,
      },
    });
  } catch (error) {
    console.error("Error during file upload processing:", error);

    if (error instanceof AppError) {
      return next(error);
    }

    if (error instanceof Error) {
      return next(
        new AppError(`Error processing uploaded file: ${error.message}`, 500)
      );
    }

    next(new AppError(`Unexpected error during upload.`, 500));
  }
};

export const getFiles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    function isRecordArray(
      data: unknown
    ): data is Array<Record<string, unknown>> {
      return (
        Array.isArray(data) &&
        data.every((item) => typeof item === "object" && item !== null)
      );
    }

    const result = await fileRepository.getAllFiles();
    const files = isRecordArray(result) ? result : [];
    res.status(200).json({
      success: true,
      results: files.length,
      data: files,
    });
  } catch (error) {
    if (error instanceof Error) {
      next(new AppError(`Error retrieving files: ${error.message}`, 500));
    } else {
      next(new AppError("Unknown error retrieving files", 500));
    }
  }
};
