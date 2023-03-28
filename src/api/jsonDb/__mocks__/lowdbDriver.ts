export default <T>(
  file: string,
): {
  read: () => T;
  write: () => void;
} => {
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

  return { read, write };
};
