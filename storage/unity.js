import fetch from "node-fetch";
import fs from "fs";
import crypto from "crypto";
import path from "path";
import * as tus from "tus-js-client";

const projectId = process.env.UNITY_PROJECT_ID;
const bucket = process.env.UNITY_BUCKET_ID;
const apiKey = process.env.UNITY_API_KEY;

const managmentUrl = `https://content-api.cloud.unity3d.com/api/v1/buckets/${bucket}/entries`;
const clientUrl = `https://${projectId}.client-api.unity3dusercontent.com/client_api/v1/buckets/${bucket}/entries`;

const credentials = Buffer.from(`:${apiKey}`).toString("base64");

const createEntry = async ({ fileSize, fileStream, fileName }) => {
  const entryRes = await fetch(managmentUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content_hash: crypto.createHash("md5").update(fileStream).digest("hex"),
      content_size: fileSize,
      content_type: "model/gltf-binary",
      path: fileName,
    }),
  });

  const { entryid: entry } = await entryRes.json();

  return entry;
};

const uploadEntryData = async ({ fileSize, fileStream, fileName, entry }) => {
  const contentURL = `${managmentUrl}/${entry}/content/`;
  const fileName = fileName.split(".")[0];

  return await new Promise((resolve, reject) => {
    const upload = new tus.Upload(fileStream, {
      endpoint: contentURL,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      uploadSize: fileSize,
      metadata: {
        filename: fileName,
        filetype: "model/gltf-binary",
      },
      headers: {
        Authorization: `Basic ${credentials}`,
      },
      onError: function (error) {
        console.log("Failed because: " + error);
        resolve(false);
      },
      onSuccess: function () {
        resolve(true);
      },
    });
    upload.start();
  });
};

const getUrl = async ({ entry }) => {
  const res = await fetch(`${managmentUrl}/${entry}`, {
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
  });
  const { current_versionid } = await res.json();
  return `${clientUrl}/${entry}/versions/${current_versionid}/content/`;
}

const unityProvider = {
  checkURL: ({ url }) => {
    return url.includes(clientUrl);
  },
  upload: async ({ file }) => {
    // Read file pros
    const fileStream = fs.readFileSync(file);
    const { size: fileSize } = fs.statSync(file);
    const fileName = path.basename(file);

    const { entry } = await createEntry({ fileStream, fileSize, fileName });
    const success = await uploadEntryData({ fileStream, fileSize, fileName, entry });

    if (success) return await getUrl({ entry });
    else return null;
  },
  delete: async (fileUrl) => {
    const key = fileUrl.split("/").at(-5);
    const response = await fetch(`${managmentUrl}/${key}`, {
      method: "DELETE",
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    });
    return response.status === 204;
  },
};

export default unityProvider;
