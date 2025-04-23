import fs from "fs/promises";
import path from "path";
import { parseString } from "xml2js";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import util from "util";

const parseXml: any = util.promisify(parseString);

// Parse a JSON file
export const parseJsonFile = async (filePath: string) => {
  try {
    const content = await fs.readFile(filePath, "utf8");
    const parsedData = JSON.parse(content);

    // Determine structure for schema inference
    const structure = inferJsonStructure(parsedData);

    return { parsedData, structure };
  } catch (error: any) {
    throw new Error(`Invalid JSON file: ${error.message}`);
  }
};

// Parse a CSV file
export const parseCsvFile = async (filePath: string) => {
  try {
    const content = await fs.readFile(filePath, "utf8");

    return new Promise((resolve, reject) => {
      Papa.parse(content, {
        header: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(
              new Error(`CSV parsing error: ${results.errors[0].message}`)
            );
            return;
          }

          // Infer structure from CSV headers
          const structure = results.meta.fields?.reduce((acc: any, field) => {
            acc[field] = { type: "string" };
            return acc;
          }, {});

          resolve({ parsedData: results.data, structure });
        },
        error: (error: any) => {
          reject(new Error(`CSV parsing error: ${error.message}`));
        },
      });
    });
  } catch (error: any) {
    throw new Error(`Invalid CSV file: ${error.message}`);
  }
};

// Parse an Excel file
export const parseExcelFile = async (filePath: string) => {
  try {
    const content = await fs.readFile(filePath);
    const workbook = XLSX.read(content, { type: "buffer" });

    if (workbook.SheetNames.length === 0) {
      throw new Error("Excel file contains no sheets");
    }

    const result: any = {};
    const structure: any = {};

    // Process each sheet
    workbook.SheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: any = XLSX.utils.sheet_to_json(worksheet);

      result[sheetName] = jsonData;

      // Infer structure from the first row
      if (jsonData.length > 0) {
        structure[sheetName] = Object.keys(jsonData[0]).reduce(
          (acc: any, field) => {
            acc[field] = { type: "string" };
            return acc;
          },
          {}
        );
      }
    });

    return { parsedData: result, structure };
  } catch (error: any) {
    throw new Error(`Invalid Excel file: ${error.message}`);
  }
};

// Parse an XML file and detect if it's BMEcat
export const parseXmlFile = async (filePath: string) => {
  try {
    const content = await fs.readFile(filePath, "utf8");
    const result = await parseXml(content, { explicitArray: false });

    // Check if it's a BMEcat file
    const isBMEcat = checkIfBMEcat(result, content);

    // Infer structure from XML
    const structure = inferXmlStructure(result);

    return { parsedData: result, structure, isBMEcat };
  } catch (error: any) {
    throw new Error(`Invalid XML file: ${error.message}`);
  }
};

// Check if XML is a BMEcat file
const checkIfBMEcat = (parsedXml: any, rawContent: string) => {
  // Check for BMEcat identifiers in the parsed XML
  if (
    parsedXml.BMECAT ||
    parsedXml.bmecat ||
    (parsedXml["$"] &&
      (parsedXml["$"].xmlns?.includes("bmecat") ||
        parsedXml["$"].xmlns?.includes("BMECAT")))
  ) {
    return true;
  }

  // Check for BMEcat identifiers in the raw content
  if (
    rawContent.includes("BMECAT") ||
    rawContent.includes("bmecat") ||
    rawContent.includes("BMEcat")
  ) {
    return true;
  }

  return false;
};

// Main parser function that determines file type and calls the appropriate parser
export const parseFile = async (filePath: string, fileType: string) => {
  switch (fileType.toUpperCase()) {
    case "JSON":
      return parseJsonFile(filePath);
    case "CSV":
      return parseCsvFile(filePath);
    case "EXCEL":
      return parseExcelFile(filePath);
    case "XML":
    case "BMECAT":
      return parseXmlFile(filePath);
    default:
      throw new Error("Unsupported file type");
  }
};

// Helper function to infer JSON structure for schema generation
function inferJsonStructure(data: any, depth = 0, maxDepth = 3): any {
  if (depth > maxDepth) return { type: typeof data };

  if (Array.isArray(data)) {
    if (data.length === 0) return { type: "array", items: { type: "any" } };

    // Infer from the first few elements for arrays
    const sampleSize = Math.min(5, data.length);
    const samples = data.slice(0, sampleSize);

    // If all elements are objects with similar structure, use the first as template
    if (
      samples.every(
        (item) =>
          typeof item === "object" && item !== null && !Array.isArray(item)
      )
    ) {
      return {
        type: "array",
        items: inferJsonStructure(samples[0], depth + 1, maxDepth),
      };
    }

    return { type: "array", items: { type: typeof samples[0] } };
  }

  if (typeof data === "object" && data !== null) {
    const structure: any = {};

    for (const [key, value] of Object.entries(data)) {
      structure[key] = inferJsonStructure(value, depth + 1, maxDepth);
    }

    return { type: "object", properties: structure };
  }

  return { type: typeof data };
}

// Helper function to infer XML structure
function inferXmlStructure(data: any, depth = 0, maxDepth = 3): any {
  if (depth > maxDepth) return { type: typeof data };

  if (typeof data === "object" && data !== null) {
    const structure: any = {};

    for (const [key, value] of Object.entries(data)) {
      // Skip XML attributes
      if (key === "$") continue;

      structure[key] = inferXmlStructure(value, depth + 1, maxDepth);
    }

    // Include XML attributes in structure
    if (data["$"]) {
      structure["attributes"] = data["$"];
    }

    return { type: "object", properties: structure };
  }

  return { type: typeof data };
}
