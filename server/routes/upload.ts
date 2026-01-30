import { Router, Request, Response } from "express";
import { uploadFile, deleteFile } from "../services/supabase";
import multer from "multer";

// Configure multer for PDF uploads
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      cb(new Error("Only PDF files are allowed"));
    } else {
      cb(null, true);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

const router = Router();

// Upload PDF endpoint
router.post("/pdf", upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const { folder = "documents" } = req.body;

    const result = await uploadFile(req.file.buffer, req.file.originalname, folder);

    res.json({
      success: true,
      url: result.url,
      path: result.path,
      fileName: req.file.originalname,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Upload failed",
    });
  }
});

// Delete PDF endpoint
router.delete("/:filePath", async (req: Request, res: Response) => {
  try {
    const { filePath } = req.params;
    const decodedPath = decodeURIComponent(filePath);

    await deleteFile(decodedPath);

    res.json({ success: true, message: "File deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Delete failed",
    });
  }
});

export default router;
