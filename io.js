const fs = require("fs");
const path = require("path");
const fsPromises = require("fs").promises;
const AdmZip = require("adm-zip");

const extensions = [".obj", ".fbx", ".gltf", ".glb", ".stl"];

const getModelPath = async (parentPath) => {
  const files = await fsPromises.readdir(parentPath);
  const file = files.find((f) => {
    const ext = path.extname(f);
    return extensions.includes(ext);
  });
  return path.join(parentPath, file);
};

const decompress = async (file) => {
  const id = file.md5;
  const parentPath = `${__dirname}/public/files/${id}`;
  const uploadPath = `${parentPath}/${file.name}`;

  if (!fs.existsSync(parentPath)) fs.mkdirSync(parentPath);

  await fsPromises.writeFile(uploadPath, file.data);

  // Check if constructor accepts file.data to avoid reading from disk
  const zip = AdmZip(uploadPath);
  zip.extractAllTo(parentPath);

  const filePath = await getModelPath(parentPath);

  return { id, path: filePath };
};

const cleanup = async (modelPath) => {
  const parentPath = path.dirname(modelPath);
  const files = await fsPromises.readdir(parentPath);
  files.forEach((f) => {
    if (f !== "output.glb") fs.unlinkSync(path.join(parentPath, f));
  });
};

module.exports = { decompress, cleanup };
