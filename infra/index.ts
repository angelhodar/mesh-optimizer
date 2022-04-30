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

const attachment = new aws.iam.RolePolicyAttachment("lambdaFullAccess", {
  role: role.name,
  policyArn: aws.iam.ManagedPolicy.AWSLambdaExecute,
});

const optimizer = new aws.lambda.Function("optimizer", {
  packageType: "Image",
  imageUri: image.imageValue,
  role: role.arn,
  timeout: 300,
  memorySize: 1536,
}, { dependsOn: [ attachment ]});

bucket.onObjectCreated("onNewModel", optimizer, { filterSuffix: ".zip" });
