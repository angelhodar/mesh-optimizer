import fetch from "node-fetch";
import fs from "fs";
import crypto from "crypto";
import path from "path";
import { FormData } from "formdata-polyfill/esm.min.js";

const url = `https://content-api.cloud.unity3d.com/api/v1/buckets/${process.env.UNITY_BUCKET_ID}/entries`;
const credentials = Buffer.from(`:${unityCCD.api_key}`).toString("base64");

export const uploadFile = async (filePath) => {
  const file = fs.readFileSync(filePath);
  const { size } = fs.statSync(filePath);

  const entryRes = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Basic ${credentials}` },
    body: {
      content_hash: crypto.createHash("md5").update(file).digest("hex"),
      content_size: size,
      content_type: "model/gltf-binary",
      path: path.basename(filePath),
    },
  });

  const { entryid } = await entryRes.json();

  const response = await fetch(url + "/" + entryid + "/content", {
    method: "PATCH",
    headers: { Authorization: `Basic ${credentials}` },
    body: new FormData().set("file", file),
  });

  const data = await response.json();
};

export const deleteFile = async (entryId) => {
  // Delete file
};
