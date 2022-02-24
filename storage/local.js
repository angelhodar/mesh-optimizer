import path from "path";
import fs from "fs";
import { getDirName } from "../io.js";

const localProvider = {
  checkURL: ({ url, hostname }) => {
    return url.includes(hostname);
  },
  upload: async ({ file, hostname, protocol }) => {
    const newPath = path.join(getDirName(), `public/${path.basename(file)}`);
    fs.renameSync(file, newPath);
    const port = process.env.NODE_ENV !== "production" ? 8000 : null;
    return `${protocol}://${hostname}${port ? ":" + port : ""}/${path.basename(
      file
    )}`;
  },
  delete: async (url) => {
    const id = path.basename(url);
    try {
      fs.unlinkSync(path.join("public", id));
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  },
};

export default localProvider;
