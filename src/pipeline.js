const path = require("path");
const util = require("util");
const { exec } = require("child_process");
const { NodeIO } = require("@gltf-transform/core");
const { prune, textureResize } = require("@gltf-transform/functions");
const { DracoMeshCompression } = require("@gltf-transform/extensions");
const draco3d = require("draco3dgltf");

const convert = async (modelPath, { decimateRatio = 0.7 }) => {
  const execAsync = util.promisify(exec);
  const scriptPath = path.join(process.cwd(), 'scripts/2gltf.py')
  await execAsync(`blender -b -P ${scriptPath} -- "${modelPath}" ${decimateRatio}`);
};

const optimize = async (
  modelPath,
  { id, draco = true, textureSize = 1024 }
) => {
  const directory = path.dirname(modelPath);
  const filename = path.basename(modelPath).split(".")[0];
  const io = new NodeIO()
    .registerExtensions([DracoMeshCompression])
    .registerDependencies({
      "draco3d.decoder": await draco3d.createDecoderModule(),
      "draco3d.encoder": await draco3d.createEncoderModule(),
    });
  const document = await io.read(`${directory}/${filename}.glb`);
  await document.transform(
    prune(),
    textureResize({
      size: [textureSize, textureSize],
    })
  );
  if (draco) document.createExtension(DracoMeshCompression).setRequired(true);
  const resultPath = `${directory}/${id}.glb`;
  await io.write(resultPath, document);
  return resultPath;
};

const pipeline = async (path, params) => {
  await convert(path, params);
  return await optimize(path, params);
};

module.exports = pipeline;
