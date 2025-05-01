// File: frontend\src\Components\Uploader\MapperComponent.tsx
import React, { useState, useEffect } from "react";
import { extractErrorMessage } from "../errors/errorUtils";

// Get API URL from environment variables
const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3002";

//Get Token for authentification
const token = localStorage.getItem("accessToken") || "";
const authHeader = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
};

// Interfaces for component props and data structures
interface MapperComponentProps {
  fileId: string;
  fileType: string;
  onMappingComplete: (success?: boolean) => void;
}

interface CanonicalField {
  id: string;
  name: string;
  description?: string;
  category: string;
  required: boolean;
}

interface Category {
  id: string;
  name: string;
}

interface Template {
  id: string;
  name: string;
  fileType: string;
  mappings: Record<string, string>;
  confidenceScores: Record<string, number>;
}

interface MappingResponse {
  mappings: Record<string, string>;
  confidenceScores: Record<string, number>;
}

interface SourceFieldsResponse {
  fields: string[];
}

interface CanonicalFieldsResponse {
  fields: CanonicalField[];
}

interface TemplatesResponse {
  templates: Template[];
}

interface TemplateResponse {
  template: Template;
}

// Component for mapping file fields to canonical schema
const MapperComponent: React.FC<MapperComponentProps> = ({
  fileId,
  fileType,
  onMappingComplete,
}) => {
  const [sourceFields, setSourceFields] = useState<string[]>([]);
  const [canonicalFields, setCanonicalFields] = useState<CanonicalField[]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [confidenceScores, setConfidenceScores] = useState<
    Record<string, number>
  >({});
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedTemplates, setSavedTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  // Categories for organizing canonical fields
  const categories: Category[] = [
    { id: "all", name: "All Fields" },
    { id: "product", name: "Product Information" },
    { id: "pricing", name: "Pricing" },
    { id: "inventory", name: "Inventory" },
    { id: "dimensions", name: "Dimensions" },
    { id: "metadata", name: "Metadata" },
  ];

  // Load data when component mounts
  useEffect(() => {
    const loadData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError("");
        // Fetch source fields from the uploaded file
        const sourceResponse = await fetch(
          `${apiUrl}/api/mappingRoutes/sourceFields/${fileId}`,
          { headers: authHeader }
        );

        if (!sourceResponse.ok) {
          throw new Error(
            `Failed to fetch source fields: ${sourceResponse.status}`
          );
        }

        const sourceData: SourceFieldsResponse = await sourceResponse.json();
        setSourceFields(sourceData.fields || []);

        // Fetch canonical fields
        const canonicalResponse = await fetch(
          `${apiUrl}/api/mappingRoutes/canonicalFields`,
          { headers: authHeader }
        );

        if (!canonicalResponse.ok) {
          throw new Error(
            `Failed to fetch canonical fields: ${canonicalResponse.status}`
          );
        }

        const canonicalData: CanonicalFieldsResponse =
          await canonicalResponse.json();
        setCanonicalFields(canonicalData.fields || []);

        // Fetch saved mapping templates
        const templatesResponse = await fetch(
          `${apiUrl}/api/mappingRoutes/templates`,
          { headers: authHeader }
        );

        if (templatesResponse.ok) {
          const templatesData: TemplatesResponse =
            await templatesResponse.json();
          setSavedTemplates(templatesData.templates || []);
        }

        // Generate initial automated mappings
        await generateAutomatedMappings(
          sourceData.fields,
          canonicalData.fields
        );
      } catch (error) {
        setError(extractErrorMessage(error));
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (fileId) {
      loadData();
    }
  }, [fileId]);

  // Generate automated mappings based on field similarity
  const generateAutomatedMappings = async (
    sourceFields: string[],
    canonicalFields: CanonicalField[]
  ): Promise<void> => {
    try {
      // Call API to get automated mappings with confidence scores
      const response = await fetch(
        `${apiUrl}/api/mappingRoutes/automatedMapping`,
        {
          method: "POST",
          headers: authHeader,
          body: JSON.stringify({
            sourceFields,
            fileType,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to generate mappings: ${response.status}`);
      }

      const data: MappingResponse = await response.json();
      setMappings(data.mappings || {});
      setConfidenceScores(data.confidenceScores || {});
    } catch (error) {
      console.error("Error generating automated mappings:", error);

      // Fallback: Use basic name matching if API fails
      const newMappings: Record<string, string> = {};
      const newConfidenceScores: Record<string, number> = {};

      sourceFields.forEach((sourceField) => {
        // Simple name matching
        const sourceFieldLower = sourceField.toLowerCase();

        // Find exact matches first
        const exactMatch = canonicalFields.find(
          (cf) => cf.name.toLowerCase() === sourceFieldLower
        );

        if (exactMatch) {
          newMappings[sourceField] = exactMatch.id;
          newConfidenceScores[sourceField] = 1.0; // 100% confidence for exact match
          return;
        }

        // Find similar matches
        let bestMatch: string | null = null;
        let highestScore = 0;

        canonicalFields.forEach((cf) => {
          const canonicalFieldLower = cf.name.toLowerCase();
          let score = 0;

          // Simple similarity checks
          if (
            sourceFieldLower.includes(canonicalFieldLower) ||
            canonicalFieldLower.includes(sourceFieldLower)
          ) {
            score = 0.7;
          } else if (
            sourceFieldLower.replace(/[_\s]/g, "") ===
            canonicalFieldLower.replace(/[_\s]/g, "")
          ) {
            score = 0.9;
          } else {
            // Calculate Levenshtein distance or another similarity measure
            // For simplicity, just checking if they start with the same 3 chars
            if (
              sourceFieldLower.substring(0, 3) ===
              canonicalFieldLower.substring(0, 3)
            ) {
              score = 0.5;
            }
          }

          if (score > highestScore) {
            highestScore = score;
            bestMatch = cf.id;
          }
        });

        if (bestMatch && highestScore > 0.4) {
          newMappings[sourceField] = bestMatch;
          newConfidenceScores[sourceField] = highestScore;
        }
      });

      setMappings(newMappings);
      setConfidenceScores(newConfidenceScores);
    }
  };

  // Apply mapping template
  const applyTemplate = async (templateId: string): Promise<void> => {
    if (!templateId) return;

    try {
      const response = await fetch(
        `${apiUrl}/api/mappingRoutes/templates/${templateId}`,
        { headers: authHeader }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch template: ${response.status}`);
      }

      const data: {
        mappings: Record<string, string>;
        confidenceScores: Record<string, number>;
      } = await response.json();

      // Apply template mappings
      setMappings(data.mappings || {});
      setConfidenceScores(data.confidenceScores || {});
    } catch (error) {
      setError(extractErrorMessage(error));
    }
  };

  // Save current mapping as a template
  const saveAsTemplate = async (): Promise<void> => {
    try {
      const templateName = prompt("Enter a name for this mapping template:");
      if (!templateName) return;

      setIsSaving(true);

      const response = await fetch(`${apiUrl}/api/mappingRoutes/templates`, {
        method: "POST",
        headers: authHeader,
        body: JSON.stringify({
          name: templateName,
          fileType,
          mappings,
          confidenceScores,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save template: ${response.status}`);
      }

      const data: TemplateResponse = await response.json();

      // Add new template to list
      setSavedTemplates([...savedTemplates, data.template]);

      alert("Template saved successfully!");
    } catch (error) {
      setError(extractErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  // Save the final mapping
  const saveMapping = async (): Promise<void> => {
    try {
      setIsSaving(true);

      const response = await fetch(`${apiUrl}/api/mappingRoutes/saveMappings`, {
        method: "POST",
        headers: authHeader,
        body: JSON.stringify({
          fileId,
          mappings,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save mappings: ${response.status}`);
      }

      // Notify parent component that mapping is complete
      if (onMappingComplete) {
        onMappingComplete(true);
      }

      alert("Mapping saved successfully!");
    } catch (error) {
      setError(extractErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  // Update a single mapping
  const updateMapping = (sourceField: string, canonicalField: string): void => {
    setMappings({
      ...mappings,
      [sourceField]: canonicalField,
    });
  };

  // Clear a single mapping
  const clearMapping = (sourceField: string): void => {
    const newMappings = { ...mappings };
    delete newMappings[sourceField];
    setMappings(newMappings);
  };

  // Filter canonical fields by search term and category
  const filteredCanonicalFields = canonicalFields.filter((field) => {
    const matchesSearch =
      field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (field.description?.toLowerCase().includes(searchTerm.toLowerCase()) ??
        false);
    const matchesCategory =
      selectedCategory === "all" || field.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  //Get confidence level class
  const getConfidenceClass = (sourceField: string): string => {
    const score = confidenceScores[sourceField] || 0;

    if (score >= 0.8) return "high-confidence";
    if (score >= 0.5) return "medium-confidence";
    return "low-confidence";
  };

  // Check if all required fields are mapped
  const requiredFieldsMapped = (): boolean => {
    const requiredCanonicalFields = canonicalFields.filter(
      (field) => field.required
    );
    return requiredCanonicalFields.every((field) =>
      Object.values(mappings).includes(field.id)
    );
  };

  // Group source fields by confidence level
  type ConfidenceLevel = "high" | "medium" | "low" | "unmapped";
  const confidenceLevels: ConfidenceLevel[] = [
    "high",
    "medium",
    "low",
    "unmapped",
  ];

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-4">
      <div className="card shadow-sm border-0">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">
            <i className="bi bi-diagram-3 me-2"></i>Map Your Data Fields
          </h4>
        </div>
        <div className="card-body">
          {error && (
            <div className="alert alert-danger" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
          )}

          <div className="row mb-4">
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label fw-bold">Search Fields</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search for fields..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label fw-bold">Filter by Category</label>
                <select
                  className="form-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {savedTemplates.length > 0 && (
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label fw-bold">y Saved Template</label>
                  <div className="input-group">
                    <select
                      className="form-select"
                      value={selectedTemplate}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                    >
                      <option value="">Select a template...</option>
                      {savedTemplates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => applyTemplate(selectedTemplate)}
                      disabled={!selectedTemplate}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="d-flex align-items-end justify-content-end h-100">
                  <button
                    className="btn btn-outline-secondary mb-2"
                    onClick={saveAsTemplate}
                    disabled={isSaving}
                  >
                    <i className="bi bi-bookmark-plus me-2"></i>
                    Save Current Mapping as Template
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="row">
            <div className="col">
              {/* Group mappings by confidence level */}
              {confidenceLevels.map((confidenceLevel) => {
                // Get source fields for this confidence level
                const levelFields = sourceFields.filter((field) => {
                  const score = confidenceScores[field] || 0;
                  if (confidenceLevel === "high") return score >= 0.8;
                  if (confidenceLevel === "medium")
                    return score >= 0.5 && score < 0.8;
                  if (confidenceLevel === "low")
                    return score > 0 && score < 0.5;
                  return !mappings[field]; // unmapped
                });

                if (levelFields.length === 0) return null;

                const levelTitle: Record<ConfidenceLevel, string> = {
                  high: "High Confidence Matches",
                  medium: "Medium Confidence Matches",
                  low: "Low Confidence Matches",
                  unmapped: "Unmapped Fields",
                };

                const levelColor: Record<ConfidenceLevel, string> = {
                  high: "success",
                  medium: "warning",
                  low: "danger",
                  unmapped: "secondary",
                };

                return (
                  <div key={confidenceLevel} className="card mb-4">
                    <div
                      className={`card-header bg-${levelColor[confidenceLevel]} bg-opacity-10`}
                    >
                      <h5 className="mb-0">
                        <i
                          className={`bi bi-${
                            confidenceLevel === "unmapped"
                              ? "question-circle"
                              : "check-circle"
                          } me-2`}
                        ></i>
                        {levelTitle[confidenceLevel]} ({levelFields.length})
                      </h5>
                    </div>
                    <div className="card-body p-0">
                      <table className="table table-hover mb-0">
                        <thead>
                          <tr>
                            <th style={{ width: "40%" }}>Source Field</th>
                            <th style={{ width: "40%" }}>Mapped To</th>
                            <th style={{ width: "20%" }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {levelFields.map((sourceField) => {
                            const mappedTo = mappings[sourceField];
                            const mappedField = canonicalFields.find(
                              (cf) => cf.id === mappedTo
                            );

                            return (
                              <tr key={sourceField}>
                                <td>
                                  <div className="fw-bold">{sourceField}</div>
                                </td>
                                <td>
                                  <select
                                    className={`form-select ${
                                      mappedField?.required
                                        ? "border-primary"
                                        : ""
                                    }`}
                                    value={mappedTo || ""}
                                    onChange={(e) =>
                                      updateMapping(sourceField, e.target.value)
                                    }
                                  >
                                    <option value="">-- Not Mapped --</option>
                                    {filteredCanonicalFields.map((cf) => (
                                      <option key={cf.id} value={cf.id}>
                                        {cf.name}{" "}
                                        {cf.required ? "(Required)" : ""}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td>
                                  <div className="btn-group">
                                    <button
                                      className="btn btn-sm btn-outline-danger"
                                      onClick={() => clearMapping(sourceField)}
                                      disabled={!mappedTo}
                                    >
                                      <i className="bi bi-x-lg"></i>
                                    </button>
                                    <button
                                      className="btn btn-sm btn-outline-secondary"
                                      onClick={() => {
                                        setSearchTerm(sourceField);
                                        setSelectedCategory("all");
                                      }}
                                    >
                                      <i className="bi bi-search"></i>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="d-flex justify-content-between mt-4">
            <div>
              <button
                className="btn btn-outline-secondary me-2"
                onClick={() => onMappingComplete(false)}
              >
                <i className="bi bi-x-circle me-2"></i>Cancel
              </button>
              <button
                className="btn btn-success"
                onClick={saveMapping}
                disabled={isSaving || !requiredFieldsMapped()}
              >
                {isSaving ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Save Mapping
                  </>
                )}
              </button>
            </div>

            {!requiredFieldsMapped() && (
              <div className="text-danger">
                <i className="bi bi-exclamation-triangle me-2"></i>
                All required fields must be mapped
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-header bg-light">
          <h5 className="mb-0">Color Legend</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <div className="d-flex align-items-center mb-2">
                <div
                  className="bg-success bg-opacity-10 p-2 rounded me-2"
                  style={{ width: 24, height: 24 }}
                ></div>
                <span>High Confidence Match (80%+)</span>
              </div>
            </div>
            <div className="col-md-4">
              <div className="d-flex align-items-center mb-2">
                <div
                  className="bg-warning bg-opacity-10 p-2 rounded me-2"
                  style={{ width: 24, height: 24 }}
                ></div>
                <span>Medium Confidence Match (50-79%)</span>
              </div>
            </div>
            <div className="col-md-4">
              <div className="d-flex align-items-center mb-2">
                <div
                  className="bg-danger bg-opacity-10 p-2 rounded me-2"
                  style={{ width: 24, height: 24 }}
                ></div>
                <span>Low Confidence Match (&lt; 50%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapperComponent;
