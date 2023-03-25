import * as postsDb from './data/postsDb-data';

export default <T>(
  file: string,
): {
  read: () => T;
  write: () => void;
} => {
  const readAny = (): unknown => {
    switch (file) {
      case 'postsDb-empty':
        return postsDb.postsEmpty;

      case 'postsDb-1':
        console.log('woot!');
        return postsDb.postsDb1;

      default:
        return {};
    }
  };

  const read = (): T => {
    return JSON.parse(JSON.stringify(readAny())) as T;
  };

  const write = (): void => {
    // do nothing
  };

  return { read, write };
};
