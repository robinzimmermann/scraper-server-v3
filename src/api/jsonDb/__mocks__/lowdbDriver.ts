import fs from 'fs';
// import * as postsDb from './data/postsDb-data';
// import * as searchesDb from './data/searchesDb-data';

export default <T>(
  file: string,
): {
  read: () => T;
  write: () => void;
} => {
  // Make sure the file exists
  if (!fs.existsSync(file)) {
    console.log('PROBLEM PROBLEM PROBLEM file does not exist:', file);
  } else {
    console.log('The file actually exists:', file);
  }
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
