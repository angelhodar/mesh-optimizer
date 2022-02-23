const util = require("util");
const path = require("path");
const exec = util.promisify(require("child_process").exec);
const { NodeIO } = require("@gltf-transform/core");
const { prune, textureResize } = require("@gltf-transform/functions");
const { DracoMeshCompression } = require("@gltf-transform/extensions");
const draco3d = require("draco3dgltf");

const convert = async (modelPath, ratio = 0.7) => {
  await exec(`blender -b -P 2gltf.py -- "${modelPath}" ${ratio}`);
}

const optimize = async (modelPath) => {
  const directory = path.dirname(modelPath);
  const filename = path.basename(modelPath).split('.')[0];
  const io = new NodeIO();
  io.registerExtensions([DracoMeshCompression]).registerDependencies({
    "draco3d.decoder": await draco3d.createDecoderModule(),
    "draco3d.encoder": await draco3d.createEncoderModule(),
  });
  const document = await io.read(`${directory}/${filename}.glb`);
  await document.transform(
    prune(),
    textureResize({
      size: [1024, 1024],
    })
  );
  document.createExtension(DracoMeshCompression).setRequired(true);
  await io.write(`${directory}/output.glb`, document);
};

const pipeline = async (path) => {
  await convert(path);
  await optimize(path);
}

module.exports = pipeline;
