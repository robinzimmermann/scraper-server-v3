export interface JsonDb<T> {
  setCacheDir: (cacheDir: string) => void;

  read: () => T;

  write: () => void;
}
