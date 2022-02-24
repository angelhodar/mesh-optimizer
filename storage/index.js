import LocalProvider from "./local.js";
import S3Provider from "./s3.js";
import UnityProvider from "./unity.js";

const providers = {
  local: LocalProvider,
  s3: S3Provider,
  unity: UnityProvider,
};

const environemtProvider = process.env.STORAGE_PROVIDER;

export const getUploadProvider = () => {
  return providers[environemtProvider];
};

export const getDeleteProvider = (data) => {
  return Object.values(providers).find((provider) => provider.checkURL(data));
};
