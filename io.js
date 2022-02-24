import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import AdmZip from "adm-zip";

let extensions = [".obj", ".fbx", ".gltf", ".glb", ".stl"];
extensions = extensions.concat(extensions.map((e) => e.toUpperCase()));

const getModelPath = (dstPath) => {
  const files = fs.readdirSync(dstPath);
  const file = files.find((f) => {
    const ext = path.extname(f);
    return extensions.includes(ext);
  });
  return path.join(dstPath, file);
};

const getDestinationPath = (id) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  return path.join(__dirname, `public/files/${id}`);
}

export const decompress = (file) => {
  const id = file.md5;
  const dstPath = getDestinationPath(id);

  const zip = AdmZip(file.data);
  zip.extractAllTo(dstPath, true);

  const filePath = getModelPath(dstPath);

  return { id, path: filePath };
};

export const cleanup = (modelPath) => {
  const parentPath = path.dirname(modelPath);
  const files = fs.readdirSync(parentPath);
  files.forEach((f) => {
    const fullPath = path.join(parentPath, f);
    const stats = fs.lstatSync(fullPath);
    if (stats.isDirectory()) fs.rmSync(fullPath, { recursive: true });
    if (stats.isFile() && f !== "output.glb") fs.unlinkSync(fullPath);
  });
};
