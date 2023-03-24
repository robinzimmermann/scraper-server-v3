import { Searches } from './models/dbSearches';
import { JsonDb } from '../api/jsonDb/JsonDb';
import lowdb from '../api/jsonDb/lowdbDriver';
import { DbLogger } from './util';

export type Database = Searches;

let db: JsonDb<Database>;
let data: Database;

const dbLogger = DbLogger('[DbSearches]');

export const init = (thePath: string): void => {
  dbLogger.info('initializing');
  const jsonDbPosts = lowdb<Database>(thePath);
  db = jsonDbPosts;
  data = db.read();
  dbLogger.info(`IGNORE TEMPORARY data=${JSON.stringify(data)}`);
  // data['123'].alias = 'dd'

  // data['123'] = { pid: '123', title: 'The Poop' };
  // db.write();
  // checkValidity();
};
