const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

const router = express.Router();

// Đảm bảo thư mục uploads tồn tại
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình Multer để lưu trữ file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ 
  storage: storage,
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
router.post("/", auth, authorize('ADMIN'), upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: { message: "Không tìm thấy file upload." } });
    }

    // BUG-C01 fix: Trả về relative URL thay vì absolute URL để tương thích production
    const imageUrl = `/uploads/${req.file.filename}`;

    res.status(200).json({ url: imageUrl });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: { message: "Lỗi server khi upload file." } });
  }
});

module.exports = router;
