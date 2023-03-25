import { Searches } from './models/dbSearches';
import { JsonDb } from '../api/jsonDb/JsonDb';
import lowdb from '../api/jsonDb/lowdbDriver';
import { DbLogger } from './util';

export type Database = Searches;

let dbFile: JsonDb<Database>;
let dbData: Database;

const dbLogger = DbLogger('[DbSearches]');

export const saveData = (): void => {
  dbFile.write();
};

export const init = (thePath: string): void => {
  dbLogger.info('initializing');
  const jsonDbPosts = lowdb<Database>(thePath);
  dbFile = jsonDbPosts;
  dbData = dbFile.read();
  dbLogger.info(`IGNORE TEMPORARY data=${JSON.stringify(dbData)}`);
  // data['123'].alias = 'dd'

  // data['123'] = { pid: '123', title: 'The Poop' };
  // db.write();
  // checkValidity();
};

export const getSearches = (): Searches => {
  return dbData;
};
