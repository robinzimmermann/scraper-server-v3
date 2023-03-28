export interface Cache {
  getParentDir: () => string;
  getCacheName: () => string;
  getCacheDir: () => string;
  createIfNotExists: () => void;
}
