const express = require("express");
const multer = require("multer");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const { uploadBuffer } = require("../config/cloudinary");

const router = express.Router();

// Ảnh được giữ trong bộ nhớ rồi upload thẳng lên Cloudinary, không ghi ra đĩa local
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ hỗ trợ upload file ảnh."));
    }
  }
});

// Route xử lý upload - chỉ Admin mới được phép upload
router.post("/", auth, authorize('ADMIN'), upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: { message: "Không tìm thấy file upload." } });
    }

    const result = await uploadBuffer(req.file.buffer, "ocseafood/uploads");

    res.status(200).json({ url: result.secure_url });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: { message: "Lỗi server khi upload file." } });
  }
});

module.exports = router;
