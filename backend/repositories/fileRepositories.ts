// File: backend/repositories/fileRepository.ts
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

// Save file metadata to the database
export const saveFileMetadata = async (
  fileData: FileMetadata
): Promise<number> => {
  const [result]: any = await db.execute(
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
  data: any,
  structure: any
): Promise<number> => {
  const [result]: any = await db.execute(
    `INSERT INTO json_data (file_id, data, structure) VALUES (?, ?, ?)`,
    [fileId, JSON.stringify(data), JSON.stringify(structure)]
  );

  return result.insertId;
};

// Save CSV data to the database
export const saveCsvData = async (
  fileId: number,
  data: any[],
  structure: any
): Promise<number> => {
  const [result]: any = await db.execute(
    `INSERT INTO csv_data (file_id, data, structure) VALUES (?, ?, ?)`,
    [fileId, JSON.stringify(data), JSON.stringify(structure)]
  );

  return result.insertId;
};

// Save Excel data to the database
export const saveExcelData = async (
  fileId: number,
  data: any,
  structure: any
): Promise<number> => {
  const [result]: any = await db.execute(
    `INSERT INTO excel_data (file_id, data, structure) VALUES (?, ?, ?)`,
    [fileId, JSON.stringify(data), JSON.stringify(structure)]
  );

  return result.insertId;
};

// Save XML data to the database
export const saveXmlData = async (
  fileId: number,
  data: any,
  structure: any
): Promise<number> => {
  const [result]: any = await db.execute(
    `INSERT INTO xml_data (file_id, data, structure) VALUES (?, ?, ?)`,
    [fileId, JSON.stringify(data), JSON.stringify(structure)]
  );

  return result.insertId;
};

// Save BMEcat data to the database
export const saveBmecatData = async (
  fileId: number,
  data: any,
  structure: any
): Promise<number> => {
  const [result]: any = await db.execute(
    `INSERT INTO bmecat_data (file_id, data, structure) VALUES (?, ?, ?)`,
    [fileId, JSON.stringify(data), JSON.stringify(structure)]
  );

  return result.insertId;
};

// Get all files
export const getAllFiles = async () => {
  const [rows] = await db.execute(
    `SELECT id, filename, file_path, size, mimetype, file_type, upload_date 
     FROM files 
     ORDER BY upload_date DESC`
  );

  return rows;
};

// Get file by ID
export const getFileById = async (fileId: number) => {
  const [rows]: any = await db.execute(
    `SELECT id, filename, file_path, size, mimetype, file_type, upload_date 
     FROM files 
     WHERE id = ?`,
    [fileId]
  );

  return rows[0] || null;
};

// Get file data based on file type
export const getFileData = async (fileId: number, fileType: string) => {
  let tableName;

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

  const [rows]: any = await db.execute(
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
