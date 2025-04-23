// File: frontend\src\Components\Uploader\FilesOverview.tsx
import { useState, useRef, useEffect } from "react";

// Get API URL from environment variables
const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3002";

// Define supported file types primarily for the input's 'accept' attribute
const supportedFileTypes = [
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
    name: "XML", // Includes BMEcat for accept attribute
    extensions: [".xml"],
    mimeTypes: ["application/xml", "text/xml"],
  },
];

// Helper function to get all allowed extensions for the file input
const getAllowedExtensions = () => {
  return supportedFileTypes.flatMap((type) => type.extensions).join(",");
};

// Helper function to check if the file extension is supported
const isExtensionSupported = (filename: string): boolean => {
  const extension = filename.substring(filename.lastIndexOf(".")).toLowerCase();
  return supportedFileTypes.some((type) => type.extensions.includes(extension));
};

const FileUploadComponent = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [extensionError, setExtensionError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Log any time the file state changes
  useEffect(() => {
    console.log("File state changed:", file?.name || "No file");
  }, [file]);

  // Reset component state
  const resetState = () => {
    setFile(null);
    setIsUploading(false);
    setErrorMessage("");
    setUploadSuccess(false);
    setExtensionError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("File input change event triggered");

    // Check if event has files
    if (!event.target.files) {
      console.error("No files property on event target");
      return;
    }

    // Check if files array has items
    if (event.target.files.length === 0) {
      console.error("Files array is empty");
      return;
    }

    // Get the selected file
    const selectedFile = event.target.files[0];
    console.log("Selected file:", selectedFile?.name || "None");

    // Reset state before processing new file
    resetState();

    if (!selectedFile) {
      console.error("Selected file is null despite files array having length");
      return;
    }

    // Check file extension
    if (!isExtensionSupported(selectedFile.name)) {
      setExtensionError(
        `File type not supported. Please select a file with one of these extensions: ${getAllowedExtensions()}`
      );
      return;
    }

    // Set the file if it passes validation
    setFile(selectedFile);
  };

  // Handle the upload process
  const handleUpload = async () => {
    // Check if we have a file
    if (!file) {
      setErrorMessage("Please select a supported file first.");
      return;
    }

    console.log("Starting upload for file:", file.name, "size:", file.size);
    setIsUploading(true);
    setErrorMessage("");
    setUploadSuccess(false);

    // Create form data
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Log the URL we're sending to
      console.log("Sending request to:", `${apiUrl}/api/fileRoutes/upload`);

      // Send the request
      const response = await fetch(`${apiUrl}/api/fileRoutes/upload`, {
        method: "POST",
        body: formData,
      });

      console.log("Response status:", response.status);

      // Try to parse JSON response
      let result;
      try {
        result = await response.json();
        console.log("Response data:", result);
      } catch (error) {
        console.error("Error parsing response:", error);
        result = null;
      }

      // Check if request was successful
      if (!response.ok) {
        throw new Error(
          result?.message || `Upload failed with status ${response.status}`
        );
      }

      // Upload successful
      setUploadSuccess(true);
      console.log("Upload successful!");
    } catch (error: any) {
      console.error("Upload error:", error);
      setErrorMessage(error.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Upload Data File</h2>

      {/* File input wrapper with debugging info */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select file (Supported: {getAllowedExtensions()})
        </label>

        {/* Use a more explicit input element */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={getAllowedExtensions()}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Display current file input state for debugging */}
        <div className="mt-1 text-xs text-gray-500">
          Input status:{" "}
          {fileInputRef.current ? "Initialized" : "Not initialized"}
        </div>
      </div>

      {/* Error for unsupported file types */}
      {extensionError && (
        <div className="mb-4 p-3 bg-yellow-50 text-yellow-700 rounded-md">
          {extensionError}
        </div>
      )}

      {/* Selected file info */}
      {file && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <p>
            <strong>File selected:</strong> {file.name}
          </p>
          <p>
            <strong>Size:</strong> {(file.size / 1024).toFixed(2)} KB
          </p>
          <p>
            <strong>Last modified:</strong>{" "}
            {new Date(file.lastModified).toLocaleString()}
          </p>
        </div>
      )}

      {/* Error messages */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
          {errorMessage}
        </div>
      )}

      {/* Success message */}
      {uploadSuccess && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
          File uploaded successfully! Backend is processing.
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={resetState}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Reset
        </button>

        <button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            !file || isUploading
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {isUploading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
};

export default FileUploadComponent;
