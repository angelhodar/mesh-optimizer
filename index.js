const express = require("express");
const fileUpload = require("express-fileupload");
const { decompress, cleanup } = require("./io.js");
const pipeline = require("./pipeline.js");

const app = express();

const port = process.env.PORT || 8000;

app.use(express.static('public'));
app.use(fileUpload());

app.post("/upload", async function (req, res) {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }
  
  const { file } = req.files;
  const { id, path } = await decompress(file);
  await pipeline(path);
  await cleanup(path);

  // Incluir subcarpetas

  res.json({ id });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
