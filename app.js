const fs = require("fs");
const path = require("path");
const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");
const { decompress } = require("./src/io.js");
const pipeline = require("./src/pipeline.js");

const s3 = new S3Client();

exports.handler = async (event) => {
  console.log("Optimizer called");
  console.log(event);

  if (!event.Records) return event;

  for (const record of event.Records) {
    const fileName = record.s3.object.key;
    const bucketName = record.s3.bucket.name;
    // Take the filename without extension as file id
    const id = fileName.split(".")[0];

    console.log(
      `Started optimization of file ${fileName} in bucket ${bucketName}`
    );

    // https://pandeysoni.medium.com/how-to-send-metadata-along-with-s3-signedurl-in-node-js-c708aca2b951

    // Get zip file from S3
    const getCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: fileName,
    });
    const { Body: file } = await s3.send(getCommand);
    // Decompress zip to tmp folder and get model path and optimization parameters
    const { modelPath, parameters } = decompress(file);
    // Optimize the model (Blender + gltf-transform)
    const resultPath = await pipeline(modelPath, { id, ...parameters });
    // Prepare data to upload
    const resultFileName = path.basename(resultPath);
    const optimizedModel = fs.createReadStream(resultPath);
    // Upload to S3
    const putCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: resultFileName,
      Body: optimizedModel,
    });

    try {
      const result = await s3.send(putCommand);
      console.log(
        `Optimization completed for model ${fileName} saved as ${resultFileName}`
      );
    } catch (err) {
      console.log(`Optimization failed for model ${fileName}`, err);
    }
  }
};
