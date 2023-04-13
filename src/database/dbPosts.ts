import chalk from 'chalk';
import { Result, ok, err } from 'neverthrow';

import { CraiglistFields, Post, Posts } from './models/dbPosts';
import { JsonDb } from '../api/jsonDb/JsonDb';
// import jsonDb from '../api/jsonDb/JsonDb';
import { DbLogger } from './util';
import {
  Source,
  Region,
  CraigslistSubcategory,
  CraigslistRegion,
  FacebookRegion,
} from './models/dbSearches';
import * as dbSearches from './dbSearches';
import * as utils from '../utils/utils';
import { isNumeric } from '../utils/utils';

export type Database = Posts;

// let dbFile: JsonDb<Database>;
let postsDb: JsonDb<Database>;
let dbData: Database;

const dbLoggerPrefix = '[dbPosts]';
const dbLogger = DbLogger(dbLoggerPrefix);

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

// export const saveData = (): void => {
//   // dbFile.write();
//   jsonDb.write();
// };

const isPostValid = (post: Post): Result<boolean, string[]> => {
  const errors: string[] = [];

  /*
export type CraiglistFields = {
  subcategories: CraigslistSubcategory[];
};

export type Post = {
  pid: string;
  sid: string;
  source: Source;
  regions: Region[];
  searchTerms: string[];
  title: string;
  postDate: string; // 2022-12-07
  price: number;
  priceStr: string;
  hood: string;
  thumbnailUrl: string;
  extras?: CraiglistFields;
};
*/

  // Check PID element is present
  if (!Object.prototype.hasOwnProperty.call(post, 'pid')) {
    errors.push(`a post has no element ${chalk.bold('pid')}`);
    return err(errors);
  }

  if (typeof post.pid !== 'string') {
    errors.push(
      `a post has a ${chalk.bold('pid')} element that is not a ${chalk.bold(
        'string',
      )}`,
    );
    return err(errors);
  }

  if (!isNumeric(post.pid)) {
    errors.push(
      `a post has a ${chalk.bold('pid')} element that is not numeric`,
    );
    return err(errors);
  }

  const errPrefix = `post ${post.pid}`;

  const error = (msg: string): void => {
    errors.push(`${errPrefix} ${msg}`);
  };

  // Check SID element is present
  if (!Object.prototype.hasOwnProperty.call(post, 'sid')) {
    error(`has no element ${chalk.bold('sid')}`);
  } else if (typeof post.sid !== 'string') {
    error(`has invalid type of ${chalk.bold('sid')}: ${typeof post.sid}`);
  } else if (!dbSearches.getSearchBySid(post.sid)) {
    error(
      `references a search ${chalk.bold(
        'sid',
      )} that doesn't exist: ${chalk.bold(post.sid)}`,
    );
  }
  // Don't continue if there are errors
  if (errors.length > 0) {
    return err(errors);
  }

  if (!post.source) {
    error(`has no element ${chalk.bold('source')}`);
  } else if (!utils.isValueInEnum(post.source, Source)) {
    error(
      `has invalid value for ${chalk.bold('source')}: ${chalk.bold(
        post.source,
      )}`,
    );
  }
  // Don't continue if there are errors
  if (errors.length > 0) {
    return err(errors);
  }

  if (!post.regions) {
    error(`has no element ${chalk.bold('regions')}`);
  } else if (!Array.isArray(post.regions)) {
    error(`has ${chalk.bold('regions')} that is not an array`);
  } else if (post.regions.length === 0) {
    error(`has ${chalk.bold('regions')} with no elements`);
  } else {
    const enumName =
      post.source === Source.craigslist ? CraigslistRegion : FacebookRegion;
    post.regions
      .filter((region) => !utils.isValueInEnum(region, enumName))
      .forEach((region) =>
        error(
          `has ${post.source} ${chalk.bold(
            'regions',
          )} which contains an invalid value: ${chalk.bold(region)}`,
        ),
      );
  }

  if (!post.priceStr) {
    error(`post has no element ${chalk.bold('priceStr')}`);
  }

  if (errors.length > 0) {
    return err(errors);
  } else {
    return ok(true);
  }
};

const isDbValid = (): Result<boolean, string[]> => {
  const errors: string[] = [];

  Object.keys(dbData).forEach((pid) => {
    const post = dbData[pid];

    const result = isPostValid(post);
    if (result.isErr()) {
      result.mapErr((resultErrors) => {
        resultErrors.forEach((msg) => {
          errors.push(msg);
        });
      });
    } else {
      if (post.pid !== pid) {
        errors.push(
          `post ${chalk.bold(post.pid)} does not match it's key: ${chalk.bold(
            pid,
          )}`,
        );
      }
    }
  });

  if (errors.length > 0) {
    return err(errors);
  } else {
    return ok(true);
  }
};

//export const init = (thePath: string): void => {
export const init = (db: JsonDb<Database>): Result<boolean, string[]> => {
  dbLogger.info('initializing');

  postsDb = db;
  dbData = postsDb.read();

  // dbFile = jsonDb<Database>(thePath);
  // dbData = dbFile.read();

  // data['123'] = { pid: '123', title: 'The Poop' };
  // db.write();
  // checkValidity();

  const result = isDbValid();

  return result;
};

export const getPosts = (): Posts => {
  return dbData;
};

export const getPost = (pid: string): Post => {
  return dbData[pid];
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
    postsDb.write();
  } else {
    throw Error(`pid ${pid} does not exist`);
  }
};

export const upsertPost = (
  pid: string,
  sid: string,
  source: Source,
  region: Region,
  searchTerm: string,
  title: string,
  postDate: string,
  price: number,
  hood: string,
  thumbnailUrl: string,
  extras?: CraiglistFields,
): void => {
  if (source === Source.craigslist) {
    if (!extras) {
      throw Error(
        'upsertPost() Craiglists posts must have an "extras" element',
      );
    }
    if (!extras.subcategories) {
      throw new Error(
        'upsertPost() Craiglists posts must have "extras" with a Craigslist subcategory',
      );
    }
  }

  const newPost: Post = {
    pid,
    sid,
    source,
    regions: [region],
    searchTerms: [searchTerm],
    title,
    postDate,
    price,
    priceStr: currencyFormatter.format(price),
    hood,
    thumbnailUrl,
    extras: source === Source.craigslist ? extras : undefined,
  };

  const postExists = hasPost(pid);
  if (!postExists) {
    dbData[pid] = newPost as Post;
  }

  const dbPost = dbData[pid];

  const mergeRegions = (): Region[] => {
    return postExists
      ? utils.mergeArrays(dbPost.regions, newPost.regions).sort()
      : newPost.regions;
  };

  const mergeSearchTerms = (): string[] => {
    return postExists
      ? utils.mergeArrays(dbPost.searchTerms, newPost.searchTerms).sort()
      : newPost.searchTerms;
  };

  // This will only be called for Craigslist posts so it can be assumed the "extras" element
  // will already exist and contain Craigslist details.
  const mergeCraigslistSubcategories = (): CraigslistSubcategory[] => {
    return postExists
      ? utils
          .mergeArrays(
            dbPost.extras?.subcategories || [],
            newPost.extras?.subcategories || [],
          )
          .sort()
      : newPost?.extras?.subcategories || [];

    // const newPostSubcategories = newPost?.extras?.subcategories;
    // if (dbPost.extras?.subcategories && newPost.extras?.subcategories) {
    //   console.log('111');
    //   console.log('post.extras.subcategories:', dbPost.extras.subcategories);
    //   console.log(
    //     'newPost.extras.subcategories:',
    //     newPost.extras.subcategories,
    //   );
    //   return postExists
    //     ? utils
    //         .mergeArrays(
    //           dbPost.extras.subcategories,
    //           newPost.extras.subcategories,
    //         )
    //         .sort()
    //     : newPost.extras.subcategories;
    // } else {
    //   console.log('222');
    //   return [];
    // }
  };

  // dbData[pid] = {
  dbData[pid] = {
    ...dbPost,
    ...newPost,
    regions: mergeRegions(),
    postDate: dbPost.postDate ? dbPost.postDate : postDate, // Keep the original postDate
    searchTerms: mergeSearchTerms(),
    extras:
      source === Source.craigslist
        ? { subcategories: mergeCraigslistSubcategories() }
        : undefined,
  };

  // console.log(
  //   `upsertPost() dbPost.pid=${dbPost.pid}, dbPost.source=${dbPost.source}/${
  //     dbData[pid].source
  //   }, is craigslist=${dbPost.source === Source.craigslist}`,
  // );
  // console.log(`dbPost: ${JSON.stringify(dbPost, null, 2)}`);
  // if (dbPost.source === Source.craigslist) {
  //   console.log('111');
  //   // Necessary extra if for Typescript
  //   if (dbPost.extras) {
  //     console.log('222');
  //     dbPost.extras.subcategories = mergeCraigslistSubcategories();
  //     console.log(`got back: ${dbPost.extras.subcategories}`);
  //     console.log(`dbPost again: ${JSON.stringify(dbPost, null, 2)}`);
  //     console.log(`dbData[pid] again: ${JSON.stringify(dbData[pid], null, 2)}`);
  //   }
  // }

  /*
  const post = data.posts[pid];

  post.year = guessTheYear(post);

  */
  postsDb.write();
};
