const express = require("express");
const multer = require("multer");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const { uploadBuffer } = require("../config/cloudinary");

const router = express.Router();

// Xác minh magic bytes thật của file thay vì chỉ tin vào mimetype client gửi lên
// (mimetype có thể bị giả mạo dễ dàng). Chỉ chấp nhận các định dạng ảnh phổ biến.
function isValidImageBuffer(buffer) {
  if (!buffer || buffer.length < 12) return false;

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (buffer.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return true;
  // JPEG: FF D8 FF
  if (buffer.slice(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return true;
  // GIF: "GIF8"
  if (buffer.slice(0, 4).toString('ascii') === 'GIF8') return true;
  // WebP: "RIFF"....."WEBP"
  if (buffer.slice(0, 4).toString('ascii') === 'RIFF' && buffer.slice(8, 12).toString('ascii') === 'WEBP') return true;

  return false;
}

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

    if (!isValidImageBuffer(req.file.buffer)) {
      return res.status(400).json({ error: { message: "File không phải ảnh hợp lệ (định dạng không được hỗ trợ)." } });
    }

    const result = await uploadBuffer(req.file.buffer, "ocseafood/uploads");

    res.status(200).json({ url: result.secure_url });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: { message: "Lỗi server khi upload file." } });
  }
});

module.exports = router;
