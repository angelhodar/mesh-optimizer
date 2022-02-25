import "dotenv/config";
import express from "express";
import fileUpload from "express-fileupload";
import swaggerUI from "swagger-ui-express";
import { decompress, getSwaggerSpecs, cleanup } from "./io.js";
import pipeline from "./pipeline.js";
import { getUploadProvider, getDeleteProvider } from "./storage.js";

const app = express();
const port = process.env.PORT || 8000;

app.use(express.static("public"));
app.use(fileUpload());
app.use("/docs", swaggerUI.serve, swaggerUI.setup(getSwaggerSpecs()));

const hasValidFile = (uploadData) => {
  return (
    uploadData &&
    Object.keys(uploadData).length > 0 &&
    uploadData.file &&
    (uploadData.file.mimetype === "application/zip" ||
      uploadData.file.mimetype === "application/x-zip-compressed")
  );
};

app.post("/", async function (req, res) {
  // Check uploaded file is valid
  if (!hasValidFile(req.files)) return res.status(400).send();
  // Get file as .zip and any other parameters
  const { file } = req.files;
  // Decompress zip to folder
  const { id, path } = decompress(file);
  // Convert to glb with Blender and postprocess with optimizations
  const resultFile = await pipeline(path, { ...req.body, id });
  // File upload to provider
  const { upload } = getUploadProvider();
  const url = await upload({
    file: resultFile,
    protocol: req.protocol,
    hostname: req.hostname,
  });
  // Remove all temporal data
  cleanup(path);
  // Return the file md5 hash to be accessed later
  res.status(201).json({ url });
});

app.delete("/", async function (req, res) {
  const { url } = req.query;
  const provider = getDeleteProvider({ url, hostname: req.hostname });
  const result = await provider.delete(url);
  if (result) return res.status(204).send();
  else return res.status(500).send();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
