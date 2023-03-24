import { Posts } from './models';
import { JsonDb } from '../api/jsonDb/JsonDb';
import lowdb from '../api/jsonDb/lowdbDriver';

export type Database = Posts;

let db: JsonDb<Database>;
let data: Database;

// jsonDb: JsonDb<Database>, thePath: string
export const init = (thePath: string): void => {
  // dbLogger.info('initializing');
  console.log('initializing');
  const jsonDbPosts = lowdb<Database>(thePath);
  db = jsonDbPosts;
  data = db.read();
  console.log(`data=${JSON.stringify(data)}`);

  // data['123'] = { pid: '123', title: 'The Poop' };
  // db.write();
  // checkValidity();
};
