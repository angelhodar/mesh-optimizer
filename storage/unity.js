import fetch from "node-fetch";
import fs from "fs";
import crypto from "crypto";
import path from "path";
import { FormData } from "formdata-node";

const projectId = process.env.UNITY_PROJECT_ID;
const bucket = process.env.UNITY_BUCKET_ID;
const apiKey = process.env.UNITY_API_KEY;

const managmentUrl = `https://content-api.cloud.unity3d.com/api/v1/buckets/${bucket}/entries`;
const clientUrl = `https://${projectId}.client-api.unity3dusercontent.com/client_api/v1/buckets/${bucket}/entries`;

const credentials = Buffer.from(`:${apiKey}`).toString("base64");

const unityProvider = {
  checkURL: ({ url }) => {
    return url.includes(clientUrl);
  },
  upload: async ({ file }) => {
    const fileStream = fs.readFileSync(file);
    const { size } = fs.statSync(file);

    const entryRes = await fetch(managmentUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content_hash: crypto.createHash("md5").update(fileStream).digest("hex"),
        content_size: size,
        content_type: "model/gltf-binary",
        path: path.basename(file),
      }),
    });

    const { entryid } = await entryRes.json();

    const formData = new FormData();
    formData.append("file", fileStream);

    const contentURL = `${managmentUrl}/${entryid}/content/`;

    const response = await fetch(contentURL, {
      method: "PATCH",
      headers: {
        Authorization: `Basic ${credentials}`,
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
      body: formData,
    });

    if (response.status === 204) {
      const res = await fetch(`${managmentUrl}/${entryid}`, {
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
      });
      const { current_versionid } = await res.json();
      return `${clientUrl}/${entryid}/versions/${current_versionid}/content/`;
    } else return null;
  },
  delete: async (fileUrl) => {
    const splitted = fileUrl.split("/");
    const key = splitted.at(-5);
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
