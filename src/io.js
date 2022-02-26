import fs from "fs";
import tmp from "tmp";
import path from "path";
import AdmZip from "adm-zip";

let extensions = [".obj", ".fbx", ".dae", ".gltf", ".glb", ".stl"];
extensions = extensions.concat(extensions.map((e) => e.toUpperCase()));

export const getSwaggerSpecs = () => {
  const specsPath = path.join(process.cwd(), "docs/swagger.json");
  return JSON.parse(fs.readFileSync(specsPath));
}

const getModelPath = (tmpPath) => {
  const files = fs.readdirSync(tmpPath);
  const file = files.find((f) => {
    const ext = path.extname(f);
    return extensions.includes(ext);
  });
  return path.join(tmpPath, file);
};

export const decompress = (file) => {
  const { name: tmpPath, removeCallback } = tmp.dirSync({ unsafeCleanup: true });

  const zip = AdmZip(file.data);
  zip.extractAllTo(tmpPath, true);

  const modelPath = getModelPath(tmpPath);

  return { modelPath, cleanup: removeCallback }
};
