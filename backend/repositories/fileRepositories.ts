// File: backend/repositories/fileRepository.ts
import { ResultSetHeader, RowDataPacket } from "mysql2";
import db from "../db";

// File metadata interface
interface FileMetadata {
  filename: string;
  path: string;
  size: number;
  mimetype: string;
  fileType: string;
  uploadDate: Date;
}

// Parsed file data and structure types
type FileData = Record<string, unknown>[];
type Structure = Record<string, unknown>;

interface InsertResult extends ResultSetHeader {
  insertId: number;
}

// Save file metadata to the database
export const saveFileMetadata = async (
  fileData: FileMetadata
): Promise<number> => {
  const [result] = await db.execute<InsertResult>(
    `INSERT INTO files (filename, file_path, size, mimetype, file_type, upload_date) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      fileData.filename,
      fileData.path,
      fileData.size,
      fileData.mimetype,
      fileData.fileType,
      fileData.uploadDate,
    ]
  );

  return result.insertId;
};

// Save JSON data to the database
export const saveJsonData = async (
  fileId: number,
  data: FileData,
  structure: Structure
): Promise<number> => {
  const [result] = await db.execute<InsertResult>(
    `INSERT INTO json_data (file_id, data, structure) VALUES (?, ?, ?)`,
    [fileId, JSON.stringify(data), JSON.stringify(structure)]
  );

  return result.insertId;
};

// Save CSV data to the database
export const saveCsvData = async (
  fileId: number,
  data: FileData,
  structure: Structure
): Promise<number> => {
  const [result] = await db.execute<InsertResult>(
    `INSERT INTO csv_data (file_id, data, structure) VALUES (?, ?, ?)`,
    [fileId, JSON.stringify(data), JSON.stringify(structure)]
  );

  return result.insertId;
};

// Save Excel data to the database
export const saveExcelData = async (
  fileId: number,
  data: FileData,
  structure: Structure
): Promise<number> => {
  const [result] = await db.execute<InsertResult>(
    `INSERT INTO excel_data (file_id, data, structure) VALUES (?, ?, ?)`,
    [fileId, JSON.stringify(data), JSON.stringify(structure)]
  );

  return result.insertId;
};

// Save XML data to the database
export const saveXmlData = async (
  fileId: number,
  data: FileData,
  structure: Structure
): Promise<number> => {
  const [result] = await db.execute<InsertResult>(
    `INSERT INTO xml_data (file_id, data, structure) VALUES (?, ?, ?)`,
    [fileId, JSON.stringify(data), JSON.stringify(structure)]
  );

  return result.insertId;
};

// Save BMEcat data to the database
export const saveBmecatData = async (
  fileId: number,
  data: FileData,
  structure: Structure
): Promise<number> => {
  const [result] = await db.execute<InsertResult>(
    `INSERT INTO bmecat_data (file_id, data, structure) VALUES (?, ?, ?)`,
    [fileId, JSON.stringify(data), JSON.stringify(structure)]
  );

  return result.insertId;
};

// File row from DB
interface FileRow extends RowDataPacket {
  id: number;
  filename: string;
  file_path: string;
  size: number;
  mimetype: string;
  file_type: string;
  upload_date: string;
}

// Get all files
export const getAllFiles = async (): Promise<FileRow[]> => {
  const [rows] = await db.execute<FileRow[]>(
    `SELECT id, filename, file_path, size, mimetype, file_type, upload_date 
     FROM files 
     ORDER BY upload_date DESC`
  );

  return rows;
};

// Get file by ID
export const getFileById = async (fileId: number): Promise<FileRow | null> => {
  const [rows] = await db.execute<FileRow[]>(
    `SELECT id, filename, file_path, size, mimetype, file_type, upload_date 
     FROM files 
     WHERE id = ?`,
    [fileId]
  );

  return rows[0] || null;
};

// File data structure from data tables
interface FileDataRow extends FileRow {
  data: string;
  structure: string;
}

// Get file data based on file type
export const getFileData = async (
  fileId: number,
  fileType: string
): Promise<{ data: FileData; structure: Structure } | null> => {
  let tableName: string;

  switch (fileType.toUpperCase()) {
    case "JSON":
      tableName = "json_data";
      break;
    case "CSV":
      tableName = "csv_data";
      break;
    case "EXCEL":
      tableName = "excel_data";
      break;
    case "XML":
      tableName = "xml_data";
      break;
    case "BMECAT":
      tableName = "bmecat_data";
      break;
    default:
      throw new Error("Unsupported file type");
  }

  const [rows] = await db.execute<FileDataRow[]>(
    `SELECT data, structure FROM ${tableName} WHERE file_id = ?`,
    [fileId]
  );

  if (rows.length === 0) {
    return null;
  }

  // Parse the JSON strings back to objects
  const row = rows[0];
  return {
    data: JSON.parse(row.data),
    structure: JSON.parse(row.structure),
  };
};
