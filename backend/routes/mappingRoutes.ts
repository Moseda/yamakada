import express, { Response } from "express";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import stringSimilarity from "string-similarity";
import { AuthenticatedRequest, verifyToken } from "../Middlewares/auth";

const mappingRouter = express.Router();
import db from "../db";

type JsonValue = string | number | boolean | JsonObject | JsonArray | null;
type JsonArray = Array<JsonValue>;

interface JsonObject {
  [key: string]: JsonArray;
}

// Define types for XML structures
interface XmlNode {
  name: string;
  children?: XmlNode[];
}

// Define interfaces for your data structures
interface FileRow extends RowDataPacket {
  id: number;
  file_type: string;
  // Add other fields as needed
}

interface DataRow extends RowDataPacket {
  structure: string;
}

interface CanonicalField extends RowDataPacket {
  id: number;
  name: string;
  category: string;
  // Add other fields as needed
}

interface MappingTemplate extends RowDataPacket {
  id: number;
  name: string;
  file_type: string;
  mappings: string;
  confidence_scores: string;
  created_at: Date;
  usage_count: number;
  user_id: number;
}

interface TemplateMatch {
  templateId: number;
  mappings: Record<string, string>;
  confidenceScores: Record<string, number>;
}

// Get source fields from an uploaded file
mappingRouter.get(
  "/sourceFields/:fileId",
  verifyToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { fileId } = req.params;
      // Get file information
      const [fileRows] = await db.query<FileRow[]>(
        "SELECT * FROM files WHERE id = ?",
        [fileId]
      );

      if (fileRows.length === 0) {
        res.status(404).json({ error: "File not found" });
        return;
      }

      const file = fileRows[0];
      const fileType = file.file_type.toLowerCase();

      // Based on file type, get data structure
      let tableName: string;

      switch (fileType) {
        case "json":
          tableName = "json_data";
          break;
        case "csv":
          tableName = "csv_data";
          break;
        case "xlsx":
        case "xls":
          tableName = "excel_data";
          break;
        case "xml":
          tableName = "xml_data";
          break;
        case "bmecat":
          tableName = "bmecat_data";
          break;
        default:
          res.status(400).json({ error: "Unsupported file type" });
          return;
      }

      // Get structure from the appropriate table
      const [dataRows] = await db.query<DataRow[]>(
        `SELECT structure FROM ${tableName} WHERE file_id = ?`,
        [fileId]
      );

      if (dataRows.length === 0) {
        res.status(404).json({
          error: "File data not found. The file may still be processing.",
        });
        return;
      }

      // Parse structure to get fields
      const structure = JSON.parse(dataRows[0].structure);

      // Extract fields from the structure
      let fields: string[] = [];

      if (fileType === "json") {
        // For JSON, fields can be nested, so flatten them
        fields = flattenJsonStructure(structure);
      } else if (
        fileType === "csv" ||
        fileType === "xlsx" ||
        fileType === "xls"
      ) {
        // For CSV and Excel, fields are the column headers
        fields = structure.columns || [];
      } else if (fileType === "xml" || fileType === "bmecat") {
        // For XML and BMEcat, extract element names
        fields = extractXmlElements(structure);
      }

      res.json({ fields });
    } catch (error) {
      console.error("Error fetching source fields:", error);
      res.status(500).json({ error: "Failed to retrieve source fields" });
    }
  }
);

// Get canonical fields
mappingRouter.get(
  "/canonicalFields",
  verifyToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Query the canonical_fields table
      const [rows] = await db.query<CanonicalField[]>(
        "SELECT * FROM canonical_fields ORDER BY category, name"
      );

      res.json({ fields: rows });
    } catch (error) {
      console.error("Error fetching canonical fields:", error);
      res.status(500).json({ error: "Failed to retrieve canonical fields" });
    }
  }
);

// Generate automated mappings
mappingRouter.post(
  "/automatedMapping",
  verifyToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { sourceFields, fileType } = req.body;

      if (!sourceFields || !Array.isArray(sourceFields)) {
        res.status(400).json({ error: "Source fields must be an array" });
        return;
      }

      // Get canonical fields
      const [canonicalRows] = await db.query<CanonicalField[]>(
        "SELECT * FROM canonical_fields"
      );
      const canonicalFields = canonicalRows;

      // Check for previous similar mappings
      const [mappingTemplates] = await db.query<MappingTemplate[]>(
        "SELECT * FROM mapping_templates WHERE file_type = ? ORDER BY usage_count DESC LIMIT 5",
        [fileType]
      );

      let mappings: Record<string, string> = {};
      let confidenceScores: Record<string, number> = {};

      // First try to use template matching if available
      if (mappingTemplates.length > 0) {
        const templateMappings = await findBestTemplateMatch(
          sourceFields,
          mappingTemplates
        );

        if (templateMappings) {
          mappings = templateMappings.mappings;
          confidenceScores = templateMappings.confidenceScores;

          // Increase usage count for this template
          await db.query(
            "UPDATE mapping_templates SET usage_count = usage_count + 1 WHERE id = ?",
            [templateMappings.templateId]
          );
        }
      }

      // If no good template match, use rule-based and similarity matching
      if (Object.keys(mappings).length === 0) {
        const results = generateRuleBasedMappings(
          sourceFields,
          canonicalFields
        );
        mappings = results.mappings;
        confidenceScores = results.confidenceScores;
      }

      res.json({ mappings, confidenceScores });
    } catch (error) {
      console.error("Error generating automated mappings:", error);
      res.status(500).json({ error: "Failed to generate mappings" });
    }
  }
);

// Get saved mapping templates
mappingRouter.get(
  "/templates",
  verifyToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Get all templates
      const [rows] = await db.query<MappingTemplate[]>(
        "SELECT id, name, file_type, created_at FROM mapping_templates ORDER BY usage_count DESC"
      );

      res.json({ templates: rows });
    } catch (error) {
      console.error("Error fetching mapping templates:", error);
      res.status(500).json({ error: "Failed to retrieve templates" });
    }
  }
);

// Get specific template
mappingRouter.get(
  "/templates/:templateId",
  verifyToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { templateId } = req.params;

      // Get the template
      const [rows] = await db.query<MappingTemplate[]>(
        "SELECT * FROM mapping_templates WHERE id = ?",
        [templateId]
      );

      if (rows.length === 0) {
        res.status(404).json({ error: "Template not found" });
        return;
      }

      const template = rows[0];

      // Parse mappings and confidence scores
      const mappings = JSON.parse(template.mappings);
      const confidenceScores = JSON.parse(template.confidence_scores);

      res.json({
        id: template.id,
        name: template.name,
        fileType: template.file_type,
        mappings,
        confidenceScores,
        createdAt: template.created_at,
      });
    } catch (error) {
      console.error("Error fetching template:", error);
      res.status(500).json({ error: "Failed to retrieve template" });
    }
  }
);

// Save mapping template
mappingRouter.post(
  "/templates",
  verifyToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { name, fileType, mappings, confidenceScores } = req.body;

      if (!name || !fileType || !mappings) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }

      // Insert new template
      const [result] = await db.query<ResultSetHeader>(
        `INSERT INTO mapping_templates 
       (name, file_type, mappings, confidence_scores, user_id, usage_count) 
       VALUES (?, ?, ?, ?, ?, 1)`,
        [
          name,
          fileType,
          JSON.stringify(mappings),
          JSON.stringify(confidenceScores || {}),
          req.user?.id,
        ]
      );

      // Get the inserted template
      const insertId = "insertId" in result ? result.insertId : 0;
      const [templateRows] = await db.query<MappingTemplate[]>(
        "SELECT id, name, file_type, created_at FROM mapping_templates WHERE id = ?",
        [insertId]
      );

      res.status(201).json({ template: templateRows[0] });
    } catch (error) {
      console.error("Error saving template:", error);
      res.status(500).json({ error: "Failed to save template" });
    }
  }
);

// Save mappings for a file
mappingRouter.post(
  "/saveMappings",
  verifyToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    console.log("→ saveMappings req.body =", req.body, "user=", req.user);
    try {
      const { fileId, mappings } = req.body;

      if (!fileId || !mappings) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }

      // Check if file exists
      const [fileRows] = await db.query<FileRow[]>(
        "SELECT * FROM files WHERE id = ?",
        [fileId]
      );

      if (fileRows.length === 0) {
        res.status(404).json({ error: "File not found" });
        return;
      }

      // Check if mapping already exists for this file
      const [existingRows] = await db.query<RowDataPacket[]>(
        "SELECT * FROM field_mappings WHERE file_id = ?",
        [fileId]
      );
      const userId = req.body!.id;

      // Insert or update mappings
      if (existingRows.length > 0) {
        await db.query(
          "UPDATE field_mappings SET mappings = ?, user_id = ? updated_at = NOW() WHERE file_id = ?",
          [JSON.stringify(mappings), userId, fileId]
        );
      } else {
        await db.query(
          "INSERT INTO field_mappings (file_id, mappings, user_id, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())",
          [fileId, JSON.stringify(mappings), userId]
        );
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error saving mappings:", error);
      res.status(500).json({ error: "Failed to save mappings" });
    }
  }
);

// Helper functions
function flattenJsonStructure(structure: JsonObject | JsonArray): string[] {
  const fields: string[] = [];

  function traverse(obj: JsonValue, path: string = ""): void {
    if (typeof obj === "object" && obj !== null) {
      if (Array.isArray(obj)) {
        obj.forEach((item, index) => traverse(item, `${path}[${index}]`));
      } else {
        Object.keys(obj).forEach((key) => {
          const newPath = path ? `${path}.${key}` : key;
          traverse((obj as JsonObject)[key], newPath);
        });
      }
    } else {
      if (path) {
        fields.push(path);
      }
    }
  }

  traverse(structure);
  return fields;
}

function extractXmlElements(structure: XmlNode | XmlNode[]): string[] {
  const fields: string[] = [];

  function traverse(node: XmlNode, path: string = ""): void {
    const newPath = path ? `${path}.${node.name}` : node.name;
    fields.push(newPath);

    if (node.children && Array.isArray(node.children)) {
      node.children.forEach((child) => traverse(child, newPath));
    }
  }

  if (Array.isArray(structure)) {
    structure.forEach((node) => traverse(node));
  } else {
    traverse(structure);
  }

  return fields;
}

async function findBestTemplateMatch(
  sourceFields: string[],
  templates: MappingTemplate[]
): Promise<TemplateMatch | null> {
  // Implementation would find the best matching template based on source fields
  // Placeholder implementation
  let bestMatch: TemplateMatch | null = null;
  let highestScore = 0;

  for (const template of templates) {
    const mappings = JSON.parse(template.mappings);
    const templateSourceFields = Object.keys(mappings);

    // Calculate similarity between source fields and template source fields
    const matches = stringSimilarity.findBestMatch(
      sourceFields.join("|"),
      templateSourceFields
    );

    if (
      matches.bestMatch.rating > highestScore &&
      matches.bestMatch.rating > 0.7
    ) {
      highestScore = matches.bestMatch.rating;
      bestMatch = {
        templateId: template.id,
        mappings: mappings,
        confidenceScores: JSON.parse(template.confidence_scores),
      };
    }
  }

  return bestMatch;
}

function generateRuleBasedMappings(
  sourceFields: string[],
  canonicalFields: CanonicalField[]
): {
  mappings: Record<string, string>;
  confidenceScores: Record<string, number>;
} {
  // Implementation would generate mappings based on field name similarity
  // Placeholder implementation
  const mappings: Record<string, string> = {};
  const confidenceScores: Record<string, number> = {};

  sourceFields.forEach((sourceField) => {
    let bestMatch = "";
    let highestScore = 0;

    canonicalFields.forEach((canonicalField) => {
      const similarity = stringSimilarity.compareTwoStrings(
        sourceField.toLowerCase(),
        canonicalField.name.toLowerCase()
      );

      if (similarity > highestScore && similarity > 0.4) {
        highestScore = similarity;
        bestMatch = canonicalField.name;
      }
    });

    if (bestMatch) {
      mappings[sourceField] = bestMatch;
      confidenceScores[sourceField] = highestScore;
    }
  });

  return { mappings, confidenceScores };
}

export default mappingRouter;
