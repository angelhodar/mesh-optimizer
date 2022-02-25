import path from "path";
import fs from "fs";

const localProvider = {
  checkURL: ({ url, hostname }) => {
    return url.includes(hostname);
  },
  upload: async ({ file, hostname }) => {
    const fileName = path.basename(file);
    const newPath = path.join(process.cwd(), `public/${fileName}`);
    fs.renameSync(file, newPath);
    if (process.env.NODE_ENV !== "production")
      return `http://localhost:8000/${fileName}`;
    return `https://${hostname}/${fileName}`;
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
