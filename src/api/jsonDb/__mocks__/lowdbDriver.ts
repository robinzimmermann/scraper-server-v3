export default <T>(): {
  setCacheDir: (cacheDir: string) => void;
  read: () => T;
  write: () => void;
} => {
  let file: string;

  const setCacheDir = (cacheDir: string): void => {
    file = cacheDir;
  };

  const read = (): T => {
    if (file) {
      return JSON.parse(file) as T;
    } else {
      return {} as T;
    }
  };

  const write = (): void => {
    // do nothing
  };

  return { setCacheDir, read, write };
};
