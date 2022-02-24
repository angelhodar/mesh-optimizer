import express from "express";
import fileUpload from "express-fileupload";
import { decompress, cleanup } from "./io.js";
import pipeline from "./pipeline.js";

const app = express();

const port = process.env.PORT || 8000;

app.use(express.static("public"));
app.use(fileUpload());

const hasValidFile = (uploadData) => {
  return (
    uploadData &&
    Object.keys(uploadData).length > 0 &&
    uploadData.file &&
    uploadData.file.mimetype === "application/zip"
  );
};

app.post("/upload", async function (req, res) {
  // Check uploaded file is valid
  if (!hasValidFile(req.files)) return res.status(400).send();
  // Get file as .zip and any other parameters
  const { file } = req.files;
  const { decimateRatio } = req.body;
  // Decompress zip to folder
  const { id, path } = decompress(file);
  // Convert to glb with Blender and postprocess with optimizations
  await pipeline(path);
  // Remove all except the resulting .glb
  await cleanup(path);
  // Return the file md5 hash to be accessed later
  res.json({ id });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
