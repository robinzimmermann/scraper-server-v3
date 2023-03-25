import * as postsDb from './data/postsDb-data';
import * as searchesDb from './data/searchesDb-data';

export default <T>(
  file: string,
): {
  read: () => T;
  write: () => void;
} => {
  const readAny = (): unknown => {
    switch (file) {
      case 'postsDb-1':
        return postsDb.postsDb1;

      case 'searchesDb-1':
        return searchesDb.searchesDb1;

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
