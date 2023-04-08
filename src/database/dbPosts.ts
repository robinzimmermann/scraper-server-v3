import { Post, Posts } from './models/dbPosts';
import { JsonDb } from '../api/jsonDb/JsonDb';
// import jsonDb from '../api/jsonDb/JsonDb';
import { DbLogger } from './util';

export type Database = Posts;

// let dbFile: JsonDb<Database>;
let jsonDb: JsonDb<Database>;
let dbData: Database;

const dbLoggerPrefix = '[dbPosts]';
const dbLogger = DbLogger(dbLoggerPrefix);

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export const saveData = (): void => {
  // dbFile.write();
  jsonDb.write();
};

//export const init = (thePath: string): void => {
export const init = (db: JsonDb<Database>): void => {
  dbLogger.info('initializing');

  jsonDb = db;
  dbData = jsonDb.read();

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

export const upsertPost = (
  pid: string,
  sid: string,
  title: string,
  postDate: string,
  price: number,
  hood: string,
  thumbnailUrl: string,
): void => {
  const postExists = hasPost(pid);
  if (!postExists) {
    dbData[pid] = {} as Post;
  }

  const dbPost = dbData[pid];

  const newPost: Post = {
    pid,
    sid,
    title,
    postDate,
    price,
    priceStr: currencyFormatter.format(price),
    hood,
    thumbnailUrl,
  };

  // dbLogger.debug(
  //   `upsertPost() pid=${pid}, sid=${sid}, postDate=${postDate}, price=${newPost.price} (${newPost.priceStr}), title=${title}`,
  // );

  /*
export type Post = {
  pid: string;
  sid: string;
  title: string;
  postDate: string; // 2022-12-07
  price: number;
  thumbnailUrl: string;
  hood: string;
};
*/
  /*
  const newPost = {
    pid,
    searchAlias,
    sid,
    source,
    regions,
    searchTerms,
    url,
    title,
    postDate,
    price,
    priceStr,
    thumbnailUrl,
    hood,
    status: PostStatus.new,
    lastStatusBeforeClosed: PostStatus.new,
    log: <string[]>[],
    clSubcategories,
    isLongGone: false,
  } as Post;

  const postExists = hasPost(pid);
  if (!postExists) {
    data.posts[pid] = { status: PostStatus.new, searchTerms: [] } as Post;
  }

  const dbPost = data.posts[pid];

  const mergeRegions = (): Region[] => {
    return postExists
      ? _.union(dbPost.regions, newPost.regions).sort()
      : newPost.regions.sort();
  };

  const mergeCraigslistSubcategories = (): CraigslistSubcategory[] => {
    return postExists
      ? _.union(dbPost.clSubcategories, newPost.clSubcategories).sort()
      : newPost.clSubcategories.sort();
  };

  const mergeSearchTerms = (): string[] => {
    return [...new Set(dbPost.searchTerms.concat(newPost.searchTerms))].sort();
  };

  */

  dbData[pid] = {
    ...dbPost,
    ...newPost,
    postDate: dbPost.postDate ? dbPost.postDate : postDate, // Keep the original postDate
  };

  /*
  const post = data.posts[pid];

  post.year = guessTheYear(post);

  */
  jsonDb.write();
};
