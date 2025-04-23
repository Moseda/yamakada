// File: backend/routes/fileRoutes.ts
import express from "express";
import multer from "multer";
import { uploadFile, getFiles } from "../controllers/fileController";
import { validateFileType } from "../Middlewares/fileValidator";

const router = express.Router();

// Configure multer (example: save to disk)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Ensure 'uploads/' directory exists
  },
  filename: function (req, file, cb) {
    // Use a unique filename to avoid collisions
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Example: 10MB limit
});

// POST /api/fileRoutes/upload
router.post(
  "/upload",
  upload.single("file"), // 1. Multer handles form-data, saves file, adds req.file
  validateFileType, // 2. Middleware validates, parses, adds req.body.fileType, req.parsedData, req.structure
  uploadFile // 3. Controller uses validated/parsed data to save to DB
);

// GET /api/fileRoutes/files
router.get("/files", getFiles); // Fixed path

export default router;
