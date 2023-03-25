import { Posts } from './models/dbPosts';
import { JsonDb } from '../api/jsonDb/JsonDb';
import lowdb from '../api/jsonDb/lowdbDriver';
import { DbLogger } from './util';

export type Database = Posts;

let dbFile: JsonDb<Database>;
let dbData: Database;

const dbLogger = DbLogger('[DbPosts]');

export const saveData = (): void => {
  dbFile.write();
};

export const getPosts = (): Posts => {
  return dbData;
};

export const hasPost = (pid: string): boolean => {
  return pid in dbData;
};

const checkTitle = (title: string): void => {
  console.log(`checking the title ${title}`);
};

export const updateTitle = (pid: string, newTitle: string): void => {
  if (hasPost(pid)) {
    // logger.silly(
    //   dbInfoColor(
    //     `[db] setting year of post ${pid} from ${data.posts[pid].year} to ${year}`,
    //   ),
    // );
    const post = dbData[pid];
    if (post.title === newTitle) {
      // No change, so do nothing
      return;
    }
    post.title = newTitle;
    checkTitle(newTitle);
    saveData();
  } else {
    throw new Error(`pid ${pid} does not exist`);
  }
};

export const init = (thePath: string): void => {
  dbLogger.info('initializing');
  dbFile = lowdb<Database>(thePath);
  dbData = dbFile.read();
  console.log(`IGNORE TEMPORARY data=${JSON.stringify(dbData)}`);

  // data['123'] = { pid: '123', title: 'The Poop' };
  // db.write();
  // checkValidity();
};
