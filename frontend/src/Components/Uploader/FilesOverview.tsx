import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import { extractErrorMessage } from "../errors/errorUtils";
import SchemaMapperComponent from "./MapperComponent";

// Get API URL from environment variables
const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3002";

type SupportedFileType = {
  name: string;
  extensions: string[];
  mimeTypes: string[];
};

// Define supported file types primarily for the input's 'accept' attribute
const supportedFileTypes: SupportedFileType[] = [
  { name: "JSON", extensions: [".json"], mimeTypes: ["application/json"] },
  { name: "CSV", extensions: [".csv"], mimeTypes: ["text/csv"] },
  {
    name: "Excel",
    extensions: [".xlsx", ".xls"],
    mimeTypes: [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ],
  },
  {
    name: "XML",
    extensions: [".xml"],
    mimeTypes: ["application/xml", "text/xml"],
  },
];
const token = localStorage.getItem("accessToken");

// Helper function to get all allowed extensions for the file input
const getAllowedExtensions = (): string => {
  return supportedFileTypes.flatMap((type) => type.extensions).join(",");
};

// Helper function to check if the file extension is supported
const isExtensionSupported = (filename: string): boolean => {
  const extension = filename.substring(filename.lastIndexOf(".")).toLowerCase();
  return supportedFileTypes.some((type) => type.extensions.includes(extension));
};

// Helper function to get file type from extension
const getFileTypeFromExtension = (filename: string): string => {
  const extension = filename
    .substring(filename.lastIndexOf(".") + 1)
    .toLowerCase();
  if (extension === "json") return "json";
  if (extension === "csv") return "csv";
  if (extension === "xlsx" || extension === "xls") return "excel";
  if (extension === "xml") return "xml";
  return "unknown";
};

const FileUploadComponent: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [extensionError, setExtensionError] = useState<string>("");
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);
  const [uploadedFileType, setUploadedFileType] = useState<string | null>(null);
  const [showMapper, setShowMapper] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log("File state changed:", file?.name || "No file");
  }, [file]);

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const pollFileStatus = (fileId: string) => {
    console.log(fileId);

    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    setProcessingStatus("processing");

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(
          `${apiUrl}/api/fileRoutes/status/${fileId}`
        );
        const data = await response.json();
        console.log("Polling file status:", data.status);

        if (data.status === "processed") {
          setProcessingStatus("processed");
          clearInterval(pollingIntervalRef.current!);
          setShowMapper(true);
        } else if (data.status === "error") {
          setProcessingStatus("error");
          setErrorMessage(data.message || "Error processing file");
          clearInterval(pollingIntervalRef.current!);
        }
      } catch (error) {
        console.error("Error polling file status:", error);
      }
    }, 2000);
  };

  const resetState = () => {
    setFile(null);
    setIsUploading(false);
    setErrorMessage("");
    setUploadSuccess(false);
    setExtensionError("");
    setUploadedFileId(null);
    setUploadedFileType(null);
    setShowMapper(false);
    setProcessingStatus(null);

    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    console.log("File input change event triggered");

    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      console.error("Selected file is null or undefined");
      return;
    }

    resetState();

    if (!isExtensionSupported(selectedFile.name)) {
      setExtensionError(
        `File type not supported. Please select a file with one of these extensions: ${getAllowedExtensions()}`
      );
      return;
    }

    setFile(selectedFile);
    setUploadedFileType(getFileTypeFromExtension(selectedFile.name));
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorMessage("Please select a supported file first.");
      return;
    }

    console.log("Starting upload for file:", file.name, "size:", file.size);
    setIsUploading(true);
    setErrorMessage("");
    setUploadSuccess(false);
    setUploadedFileId(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${apiUrl}/api/fileRoutes/upload`, {
        method: "POST",
        body: formData,
      });

      console.log("Response status:", response.status);

      let result;
      try {
        result = await response.json();
        console.log("Response data:", result);
      } catch (error) {
        console.error("Error parsing response:", error);
        result = null;
      }

      if (!response.ok) {
        throw new Error(
          result?.message || `Upload failed with status ${response.status}`
        );
      }

      setUploadSuccess(true);
      setUploadedFileId(result.data?.fileId);
      console.log("Upload successful! File ID:", result.data?.fileId);

      pollFileStatus(result.data?.fileId);
    } catch (error: unknown) {
      const userFriendlyMessage = extractErrorMessage(error);
      setErrorMessage(userFriendlyMessage);
      setUploadSuccess(false);
    } finally {
      setIsUploading(false);
    }
  };

  const handleMappingComplete = (success = true) => {
    if (success) {
      alert("Mapping completed successfully! Redirecting to data view...");
    } else {
      resetState();
    }
  };

  if (showMapper && uploadedFileId && uploadedFileType) {
    console.log("About to render SchemaMapperComponent", {
      showMapper,
      uploadedFileId,
      uploadedFileType,
    });

    return (
      <SchemaMapperComponent
        fileId={uploadedFileId}
        fileType={uploadedFileType}
        onMappingComplete={handleMappingComplete}
      />
    );
  }

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-sm border-0 my-5">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">
                <i className="bi bi-upload me-2"></i>Upload Data File
              </h4>
            </div>
            <div className="card-body p-4">
              {/* File input */}
              <div className="mb-4">
                <label htmlFor="fileInput" className="form-label fw-bold">
                  Select a file
                </label>
                <div className="input-group">
                  <input
                    type="file"
                    id="fileInput"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept={getAllowedExtensions()}
                    className="form-control"
                  />
                </div>
                <div className="form-text">
                  Supported formats:{" "}
                  {supportedFileTypes.map((type) => type.name).join(", ")}
                </div>
              </div>

              {/* Error for unsupported file types */}
              {extensionError && (
                <div className="alert alert-warning" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {extensionError}
                </div>
              )}

              {/* Selected file info */}
              {file && (
                <div className="card bg-light mb-4">
                  <div className="card-body">
                    <h5 className="card-title">
                      <i className="bi bi-file-earmark me-2"></i>
                      Selected File
                    </h5>
                    <ul className="list-group list-group-flush">
                      <li className="list-group-item bg-transparent">
                        <span className="fw-bold">Name:</span> {file.name}
                      </li>
                      <li className="list-group-item bg-transparent">
                        <span className="fw-bold">Size:</span>{" "}
                        {(file.size / 1024).toFixed(2)} KB
                      </li>
                      <li className="list-group-item bg-transparent">
                        <span className="fw-bold">Last modified:</span>{" "}
                        {new Date(file.lastModified).toLocaleString()}
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Error messages */}
              {errorMessage && (
                <div className="alert alert-danger" role="alert">
                  <i className="bi bi-x-circle me-2"></i>
                  {errorMessage}
                </div>
              )}

              {/* Upload success message */}
              {uploadSuccess && (
                <div className="alert alert-success" role="alert">
                  <i className="bi bi-check-circle me-2"></i>
                  File uploaded successfully!
                  {processingStatus === "processing" && (
                    <div className="mt-2">
                      <div className="d-flex align-items-center">
                        <div
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        >
                          <span className="visually-hidden">Processing...</span>
                        </div>
                        <span>Processing file data...</span>
                      </div>
                      <div className="progress mt-2">
                        <div
                          className="progress-bar progress-bar-striped progress-bar-animated"
                          role="progressbar"
                          style={{ width: "100%" }}
                        ></div>
                      </div>
                    </div>
                  )}
                  {processingStatus === "error" && (
                    <div className="text-danger mt-2">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      Error processing file. Please try again.
                    </div>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="d-flex justify-content-between mt-4">
                <button
                  onClick={resetState}
                  className="btn btn-outline-secondary"
                  type="button"
                >
                  <i className="bi bi-x-circle me-2"></i>Reset
                </button>

                <button
                  onClick={handleUpload}
                  disabled={!file || isUploading || uploadSuccess}
                  className="btn btn-primary"
                  type="button"
                >
                  {isUploading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-cloud-arrow-up me-2"></i>Upload
                    </>
                  )}
                </button>
              </div>

              {/* Process description */}
              <div className="mt-5">
                <h5 className="fw-bold">How It Works</h5>
                <div className="card">
                  <div className="card-body p-0">
                    <ul className="list-group list-group-flush">
                      <li className="list-group-item d-flex">
                        <div
                          className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                          style={{ width: "30px", height: "30px" }}
                        >
                          1
                        </div>
                        <div>
                          <strong>Upload File</strong>
                          <p className="mb-0 text-muted">
                            Select and upload your data file (JSON, CSV, Excel,
                            XML)
                          </p>
                        </div>
                      </li>
                      <li className="list-group-item d-flex">
                        <div
                          className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                          style={{ width: "30px", height: "30px" }}
                        >
                          2
                        </div>
                        <div>
                          <strong>Processing</strong>
                          <p className="mb-0 text-muted">
                            Our system processes your file and analyzes its
                            structure
                          </p>
                        </div>
                      </li>
                      <li className="list-group-item d-flex">
                        <div
                          className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                          style={{ width: "30px", height: "30px" }}
                        >
                          3
                        </div>
                        <div>
                          <strong>Map Schema</strong>
                          <p className="mb-0 text-muted">
                            Map your data fields to our standardized format
                          </p>
                        </div>
                      </li>
                      <li className="list-group-item d-flex">
                        <div
                          className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                          style={{ width: "30px", height: "30px" }}
                        >
                          4
                        </div>
                        <div>
                          <strong>View & Analyze</strong>
                          <p className="mb-0 text-muted">
                            Access your imported data for visualization and
                            analysis
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Additional information */}
              <div className="mt-4">
                <div className="alert alert-info" role="alert">
                  <h5 className="alert-heading">
                    <i className="bi bi-info-circle me-2"></i>Tips for best
                    results
                  </h5>
                  <ul className="mb-0 ps-3">
                    <li>Ensure your file is properly formatted with headers</li>
                    <li>Files should be less than 50MB in size</li>
                    <li>For CSV files, ensure data is comma-separated</li>
                    <li>For Excel files, data should be in the first sheet</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="card-footer bg-light py-3">
              <div className="d-flex justify-content-center">
                <span className="text-muted">
                  Need help?{" "}
                  <a href="/support" className="text-decoration-none">
                    Contact Support
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadComponent;
