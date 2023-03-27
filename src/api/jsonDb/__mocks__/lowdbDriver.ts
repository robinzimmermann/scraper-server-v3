// import * as postsDb from './data/postsDb-data';
// import * as searchesDb from './data/searchesDb-data';

export default <T>(
  file: string,
): {
  read: () => T;
  write: () => void;
} => {
  const read = (): T => {
    if (file) {
      console.log('doing it the easy way:', file);
      return JSON.parse(file) as T;
    } else {
      console.log('doing it the hard way');
      return {} as T;
    }
  };

  const write = (): void => {
    // do nothing
  };

  return { read, write };
};
