const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.mimetype.includes("image")) {
      cb(null, "./public/uploads/Images");
    } else if (file.mimetype.includes("video")) {
      cb(null, "./public/uploads/Videos");
    } else if (file.mimetype.includes("audio")) {
      cb(null, "./public/uploads/Audios");
    } else if (file.mimetype === "application/pdf") {
      cb(null, "./public/uploads/PDFs"); // Destination pour les fichiers PDF
    } else if (file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.mimetype === "application/msword") {
      cb(null, "./public/uploads/WordDocuments"); // Destination pour les fichiers Word
    } else {
      cb(new Error("Unsupported file type"), false); // Gérer les types de fichiers non pris en charge
    }
  },
  filename: function (req, file, cb) {
    let file_name = null;
    if (file.mimetype.includes("image")) {
      file_name = "IMAGE-" + Date.now() + ".jpg";
    } else if (file.mimetype.includes("video")) {
      file_name = "VID-" + Date.now() + ".mp4";
    } else if (file.mimetype.includes("audio")) {
      file_name = "AUD-" + Date.now() + ".mp3";
    } else if (file.mimetype === "application/pdf") {
      file_name = "PDF-" + Date.now() + ".pdf"; // Nom pour les fichiers PDF
    } else if (file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      file_name = "WORD-" + Date.now() + ".docx"; // Nom pour les fichiers Word
    } else if (file.mimetype === "application/msword") {
      file_name = "WORD-" + Date.now() + ".doc"; // Nom pour les anciens fichiers Word
    }
    cb(null, file_name);
  },
});

const uploads = multer({ storage: storage });

module.exports = uploads;