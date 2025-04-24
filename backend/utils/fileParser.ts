import fs from "fs/promises";
import { parseString } from "xml2js";
import * as XLSX from "xlsx";
import Papa, { ParseResult } from "papaparse";

// Type definitions
interface TypeDefinition {
  type: string;
  items?: TypeDefinition;
  properties?: Record<string, TypeDefinition>;
}

interface StructureField {
  type: string;
}

type Structure = Record<string, StructureField>;
type ParsedData = Record<string, unknown>[] | Record<string, ParsedData>[];
type XmlDocument = Record<string, unknown>;

interface FileParseResult {
  parsedData: ParsedData;
  structure: Structure | Record<string, Structure>;
  isBMEcat?: boolean;
}

// Type-safe promisified XML parser - using an interface for options
interface XmlParserOptions {
  explicitArray?: boolean;
  [key: string]: unknown;
}

const parseXml = (
  content: string,
  options?: XmlParserOptions
): Promise<XmlDocument> => {
  return new Promise((resolve, reject) => {
    parseString(content, options || {}, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result as XmlDocument);
      }
    });
  });
};

// Function to convert TypeDefinition to Structure
function convertToStructure(typeDef: TypeDefinition): Structure {
  const result: Structure = {};

  if (typeDef.properties) {
    for (const [key, value] of Object.entries(typeDef.properties)) {
      result[key] = { type: value.type };
    }
  }

  return result;
}

// Parse a JSON file
export const parseJsonFile = async (
  filePath: string
): Promise<FileParseResult> => {
  try {
    const content = await fs.readFile(filePath, "utf8");
    const parsedData = JSON.parse(content) as
      | Record<string, unknown>[]
      | Record<string, unknown>;

    // Handle both array and object formats
    const normalizedData: ParsedData = Array.isArray(parsedData)
      ? parsedData
      : [parsedData];

    // Determine structure for schema inference
    const typeDefStructure = inferJsonStructure(normalizedData);

    // Convert to the expected Structure type
    const structure =
      typeDefStructure.type === "object" && typeDefStructure.properties
        ? convertToStructure(typeDefStructure)
        : { root: { type: typeDefStructure.type } };

    return { parsedData: normalizedData, structure };
  } catch (error: unknown) {
    throw new Error(`Invalid JSON file: ${(error as Error).message}`);
  }
};

// Parse a CSV file
export const parseCsvFile = async (
  filePath: string
): Promise<FileParseResult> => {
  try {
    const content = await fs.readFile(filePath, "utf8");

    return new Promise((resolve, reject) => {
      Papa.parse<Record<string, string>>(content, {
        header: true,
        skipEmptyLines: true,
        complete: (results: ParseResult<Record<string, string>>) => {
          if (results.errors.length > 0) {
            reject(
              new Error(`CSV parsing error: ${results.errors[0].message}`)
            );
            return;
          }

          // Infer structure from CSV headers
          const structure: Structure = {};
          if (results.meta.fields) {
            for (const field of results.meta.fields) {
              structure[field] = { type: "string" };
            }
          }

          resolve({ parsedData: results.data as ParsedData, structure });
        },
        error: (error: unknown) => {
          reject(new Error(`CSV parsing error: ${String(error)}`));
        },
      });
    });
  } catch (error: unknown) {
    throw new Error(`Invalid CSV file: ${(error as Error).message}`);
  }
};

// Parse an Excel file
export const parseExcelFile = async (
  filePath: string
): Promise<FileParseResult> => {
  try {
    const content = await fs.readFile(filePath);
    const workbook = XLSX.read(content, { type: "buffer" });

    if (workbook.SheetNames.length === 0) {
      throw new Error("Excel file contains no sheets");
    }

    const sheetsData: Record<string, Record<string, unknown>[]> = {};
    const structure: Record<string, Structure> = {};

    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData =
        XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

      sheetsData[sheetName] = jsonData;

      if (jsonData.length > 0) {
        structure[sheetName] = {};
        for (const field of Object.keys(jsonData[0])) {
          structure[sheetName][field] = { type: "string" };
        }
      }
    }

    // Since ParsedData expects either an array or record of arrays,
    // we need to convert the sheet data into a format that matches
    const sheetArray: Record<string, unknown>[] = Object.entries(
      sheetsData
    ).map(([sheetName, data]) => ({
      sheetName,
      data,
    }));

    return { parsedData: sheetArray, structure };
  } catch (error: unknown) {
    throw new Error(`Invalid Excel file: ${(error as Error).message}`);
  }
};

// Parse an XML file and detect if it's BMEcat
export const parseXmlFile = async (
  filePath: string
): Promise<FileParseResult> => {
  try {
    const content = await fs.readFile(filePath, "utf8");

    // Use options with our type-safe parseXml function
    const result = await parseXml(content, { explicitArray: false });

    // Convert to array format expected by ParsedData
    const parsedData: ParsedData = [result];

    const isBMEcat = checkIfBMEcat(result, content);

    // Generate structure and ensure it matches the expected type
    const typeDefStructure = inferXmlStructure(result);
    const structure =
      typeDefStructure.type === "object" && typeDefStructure.properties
        ? convertToStructure(typeDefStructure)
        : { root: { type: typeDefStructure.type } };

    return { parsedData, structure, isBMEcat };
  } catch (error: unknown) {
    throw new Error(`Invalid XML file: ${(error as Error).message}`);
  }
};

// Check if XML is a BMEcat file
const checkIfBMEcat = (parsedXml: XmlDocument, rawContent: string): boolean => {
  // Check for BMEcat identifiers in the parsed XML
  if (
    "BMECAT" in parsedXml ||
    "bmecat" in parsedXml ||
    (parsedXml["$"] &&
      typeof parsedXml["$"] === "object" &&
      "$" in parsedXml &&
      parsedXml["$"] !== null)
  ) {
    const xmlAttrs = parsedXml["$"] as Record<string, unknown>;
    if (
      "xmlns" in xmlAttrs &&
      typeof xmlAttrs.xmlns === "string" &&
      (xmlAttrs.xmlns.includes("bmecat") || xmlAttrs.xmlns.includes("BMECAT"))
    ) {
      return true;
    }
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
export const parseFile = async (
  filePath: string,
  fileType: string
): Promise<FileParseResult> => {
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

// Helper function to infer JSON structure for schema generation with better typing
function inferJsonStructure(
  data: unknown,
  depth = 0,
  maxDepth = 3
): TypeDefinition {
  if (depth > maxDepth) {
    return { type: Array.isArray(data) ? "array" : "object" };
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return { type: "array", items: { type: "unknown" } };
    }

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

    const firstItem = samples[0];
    return {
      type: "array",
      items: {
        type: firstItem === null ? "null" : typeof firstItem,
      },
    };
  }

  if (typeof data === "object" && data !== null) {
    const properties: Record<string, TypeDefinition> = {};

    for (const [key, value] of Object.entries(
      data as Record<string, unknown>
    )) {
      properties[key] = inferJsonStructure(value, depth + 1, maxDepth);
    }

    return { type: "object", properties };
  }

  return { type: typeof data };
}

// Helper function to infer XML structure with better typing
function inferXmlStructure(
  data: unknown,
  depth = 0,
  maxDepth = 3
): TypeDefinition {
  if (depth > maxDepth) {
    return { type: typeof data };
  }

  if (typeof data === "object" && data !== null) {
    const properties: Record<string, TypeDefinition> = {};

    for (const [key, value] of Object.entries(
      data as Record<string, unknown>
    )) {
      // Skip XML attributes
      if (key === "$") continue;

      properties[key] = inferXmlStructure(value, depth + 1, maxDepth);
    }

    // Include XML attributes in structure
    if (
      "$" in (data as Record<string, unknown>) &&
      (data as Record<string, unknown>)["$"] !== null &&
      typeof (data as Record<string, unknown>)["$"] === "object"
    ) {
      const xmlAttrs = (data as Record<string, unknown>)["$"] as Record<
        string,
        unknown
      >;
      const attrProps: Record<string, TypeDefinition> = {};

      for (const [k, v] of Object.entries(xmlAttrs)) {
        attrProps[k] = { type: typeof v };
      }

      properties["attributes"] = {
        type: "object",
        properties: attrProps,
      };
    }

    return { type: "object", properties };
  }

  return { type: typeof data };
}
