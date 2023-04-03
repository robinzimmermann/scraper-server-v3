import { Posts } from './models/dbPosts';
import { JsonDb } from '../api/jsonDb/JsonDb';
// import jsonDb from '../api/jsonDb/JsonDb';
import { DbLogger } from './util';

export type Database = Posts;

// let dbFile: JsonDb<Database>;
let myJsonDb: JsonDb<Database>;
let dbData: Database;

const dbLoggerPrefix = '[dbPosts]';
const dbLogger = DbLogger(dbLoggerPrefix);

export const saveData = (): void => {
  // dbFile.write();
  myJsonDb.write();
};

//export const init = (thePath: string): void => {
export const init = (jsonDb: JsonDb<Database>): void => {
  dbLogger.info('initializing');

  myJsonDb = jsonDb;
  dbData = myJsonDb.read();

  // dbFile = jsonDb<Database>(thePath);
  // dbData = dbFile.read();

  // data['123'] = { pid: '123', title: 'The Poop' };
  // db.write();
  // checkValidity();
};

export const getPosts = (): Posts => {
  return dbData;
};

export const hasPost = (pid: string): boolean => {
  return pid in dbData;
};

const checkTitle = (title: string): void => {
  dbLogger.silly(`checking the title ${title}`);
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
