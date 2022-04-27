const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");

let extensions = [".obj", ".fbx", ".dae", ".gltf", ".glb", ".stl"];
extensions = extensions.concat(extensions.map((e) => e.toUpperCase()));

const getModelPath = (tmpPath) => {
  const files = fs.readdirSync(tmpPath);
  const file = files.find((f) => {
    const ext = path.extname(f);
    return extensions.includes(ext);
  });
  return path.join(tmpPath, file);
};

const decompress = (file) => {
  const tmpPath = "/tmp"

  const zip = AdmZip(file.data);
  zip.extractAllTo(tmpPath, true);

  const modelPath = getModelPath(tmpPath);
  const parameters = fs.readFileSync(path.join(tmpPath, "parameters.json"));
  
  return { modelPath, parameters: JSON.parse(parameters) };
};

module.exports = { decompress };
