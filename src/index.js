const fs = require("fs");
const path = require("path");
const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  HeadObjectCommand
} = require("@aws-sdk/client-s3");
const { decompress, streamToString } = require("./io.js");
const pipeline = require("./pipeline.js");

const s3 = new S3Client();

exports.handler = async (event) => {
  console.log("Optimizer called");

  if (!event.Records) return event;

  for (const record of event.Records) {
    const fileName = record.s3.object.key;
    const bucketName = record.s3.bucket.name;

    console.log(
      `Started optimization of file ${fileName} in bucket ${bucketName}`
    );

    const params = {
      Bucket: bucketName,
      Key: fileName,
    }
    // Get zip file from S3
    const getCommand = new GetObjectCommand(params);
    const { Body: file } = await s3.send(getCommand);
    // Decompress zip to tmp folder and get model path and optimization parameters
    const modelPath = decompress(await streamToString(file));
    // Get parameters from metadata keys
    const headCommand = new HeadObjectCommand(params);
    const { Metadata: parameters } = await s3.send(headCommand);
    // Optimize the model (Blender + gltf-transform)
    const resultPath = await pipeline(modelPath, { id: "test", ...parameters });
    console.log(resultPath);
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
      await s3.send(putCommand);
      console.log(
        `Optimization completed for model ${fileName} saved as ${resultFileName}`
      );
    } catch (err) {
      console.log(`Optimization failed for model ${fileName}`, err);
    }
  }
}
