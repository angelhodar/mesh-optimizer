import path from "path";
import fs from "fs";
import AmazonS3Uri from "amazon-s3-uri";
import { S3Client } from "@aws-sdk/client-s3";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const REGION = process.env.AWS_BUCKET_REGION;
const s3Client = new S3Client({ region: REGION });

const s3Provider = {
  checkURL: ({ url }) => {
    try {
      AmazonS3Uri(url);
      return true;
    } catch {
      return false;
    }
  },
  upload: async ({ file }) => {
    const fileStream = fs.createReadStream(file);
    // Set the parameters
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: path.basename(file),
      Body: fileStream,
    };
    try {
      await s3Client.send(new PutObjectCommand(params));
      return `https://${params.Bucket}.s3.${REGION}.amazonaws.com/${params.Key}`;
    } catch (e) {
      console.log(e);
      return null;
    }
  },
  delete: async (url) => {
    const { bucket: Bucket, key: Key } = AmazonS3Uri(url);
    const params = { Bucket, Key };
    try {
      await s3Client.send(new DeleteObjectCommand(params));
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  },
};

export default s3Provider;
