import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import AdmZip from "adm-zip";

let extensions = [".obj", ".fbx", ".dae", ".gltf", ".glb", ".stl"];
extensions = extensions.concat(extensions.map((e) => e.toUpperCase()));

export const getSwaggerSpecs = () => {
  return JSON.parse(fs.readFileSync("./docs/swagger.json"));
}

const getModelPath = (dstPath) => {
  const files = fs.readdirSync(dstPath);
  const file = files.find((f) => {
    const ext = path.extname(f);
    return extensions.includes(ext);
  });
  return path.join(dstPath, file);
};

export const getDirName = () => {
  const __filename = fileURLToPath(import.meta.url);
  return path.dirname(__filename);
}

export const decompress = (file) => {
  const id = file.md5;
  const dstPath = path.join(getDirName(), `tmp/${id}`);

  const zip = AdmZip(file.data);
  zip.extractAllTo(dstPath, true);

  const filePath = getModelPath(dstPath);

  return { id, path: filePath };
};

export const cleanup = (modelPath) => {
  fs.rmSync(path.dirname(modelPath), { recursive: true });
};
