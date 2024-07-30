const express = require("express");
const multer = require("multer");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");

const cors = require("cors");
const app = express();
const port = 3000;

app.use(morgan("combined"));

app.use(cors());
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./tmp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

if (!fs.existsSync("./tmp")) {
  fs.mkdirSync("./tmp");
}

app.post("/file/upload", upload.single("file"), (req, res) => {
  res.status(200).json({
    message: "File uploaded successfully",
    filename: req.file.filename,
  });
});

app.get("/file", (req, res) => {
  fs.readdir("./tmp", (err, files) => {
    if (err) {
      return res.status(500).json({ message: "Unable to scan files" });
    }
    res.status(200).json({ files: files.map((file) => ({ name: file })) });
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
