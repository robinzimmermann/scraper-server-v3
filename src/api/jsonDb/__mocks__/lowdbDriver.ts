// import * as postsDb from './data/postsDb-data';
// import * as searchesDb from './data/searchesDb-data';

export default <T>(
  file: string,
): {
  read: () => T;
  write: () => void;
} => {
  console.log(`FILE FILE FILE = ${JSON.parse(file)}`);
  // const readAny = (): unknown => {
  //   switch (file) {
  //     case 'postsDb-1':
  //       return postsDb.postsDb1;

  //     case 'searchesDb-1':
  //       return searchesDb.searchesDb1;

  //     case 'searchesDbInvalid':
  //       return searchesDb.searchesDbInvalid;

  //     case 'searchesDbValid':
  //       return searchesDb.searchesDbValid;

  //     case 'searchesDbMissingSidElement':
  //       return searchesDb.searchesDbMissingSidElement;

  //     case 'searchesDbEmptySid':
  //       return searchesDb.searchesDbEmptySid;

  //     case 'searchesDbSidElementDoesntMatch':
  //       return searchesDb.searchesDbSidElementDoesntMatch;

  //     case 'searchesDbMissingAlias':
  //       return searchesDb.searchesDbMissingAlias;

  //     case 'searchesDbEmptyAlias':
  //       return searchesDb.searchesDbEmptyAlias;

  //     case 'searchesDbWrongTypeAlias':
  //       return searchesDb.searchesDbWrongTypeAlias;

  //     default:
  //       return {};
  //   }
  // };

  const read = (): T => {
    // return JSON.parse(JSON.stringify(readAny())) as T;
    return JSON.parse(file) as T;
  };

  const write = (): void => {
    // do nothing
  };

  return { read, write };
};
