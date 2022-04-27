import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

const bucket = new aws.s3.Bucket("3d-model-optimizer");

const image = awsx.ecr.buildAndPushImage("model-optimizer", {
  context: "..",
});

const role = new aws.iam.Role("modelOptimizerRole", {
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
    Service: "lambda.amazonaws.com",
  }),
});

const lambdaS3Access = new aws.iam.RolePolicyAttachment("lambdaFullAccess", {
  role: role.name,
  policyArn: aws.iam.ManagedPolicy.AWSLambdaExecute,
});

const optimizer = new aws.lambda.Function("optimizer", {
  packageType: "Image",
  imageUri: image.imageValue,
  role: role.arn,
  timeout: 300,
});

bucket.onObjectCreated("onNewZip", optimizer, { filterSuffix: ".zip" });

// Export the bucket name.
export const bucketName = bucket.id;

const logger = new aws.lambda.CallbackFunction<aws.s3.BucketEvent, void>(
  "onModelOptimized",
  {
    callback: async (bucketArgs) => {
      if (!bucketArgs.Records) return;

      for (const record of bucketArgs.Records) {
        console.log(`Model optimizer ${record.s3.object.key}`);
      }
    },
    policies: [aws.iam.ManagedPolicy.AWSLambdaExecute],
  }
);

// When a new model is optimized, log a message.
bucket.onObjectCreated("onModelOptimized", logger, { filterSuffix: ".gdb" });
