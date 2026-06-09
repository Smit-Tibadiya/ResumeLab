const express = require("express");
const { authenticateToken } = require("../middlewares");
const { analyzeResume, fetchAllResume, getResumeResult, deleteResume } = require("../controllers/resume");
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({storage:storage, limits: { fileSize: 5 * 1000 * 1000 } });

router.post("/analyze", authenticateToken, upload.single('previewImage') ,analyzeResume)
    .get("/", authenticateToken, fetchAllResume)
    .get("/:id", authenticateToken, getResumeResult)
    .delete("/:id",authenticateToken, deleteResume );

module.exports = router;