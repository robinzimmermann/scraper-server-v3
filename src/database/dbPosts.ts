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

// To check a string matches YYYY-MM-DD, where year is higher than 2023.
const dateChecker = /^202[3-9]-[01][0-9]-[0123][0-9]$/;

// To check a string matches currency
const currencyChecker =
  /([$*\s]*(?:\d{1,3}(?:[\s,]\d{3})+|\d+)(?:.\d{2})?([\s]*[a-z-A-Z]{0,3}))/;

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

  if (!Object.prototype.hasOwnProperty.call(post, 'source')) {
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

  if (!Object.prototype.hasOwnProperty.call(post, 'regions')) {
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

  if (!Object.prototype.hasOwnProperty.call(post, 'searchTerms')) {
    error(`has no element ${chalk.bold('searchTerms')}`);
  } else if (!Array.isArray(post.searchTerms)) {
    error(`has ${chalk.bold('searchTerms')} that is not an array`);
  } else if (post.searchTerms.length === 0) {
    error(`has ${chalk.bold('searchTerms')} with no elements`);
  }

  if (!Object.prototype.hasOwnProperty.call(post, 'title')) {
    error(`has no element ${chalk.bold('title')}`);
  } else if (!(typeof post.title === 'string')) {
    error(`has ${chalk.bold('title')} that is not a string`);
  } else if (post.title.length === 0) {
    error(`has a ${chalk.bold('title')} with no value`);
  }

  if (!Object.prototype.hasOwnProperty.call(post, 'postDate')) {
    error(`has no element ${chalk.bold('postDate')}`);
  } else if (!(typeof post.postDate === 'string')) {
    error(`has ${chalk.bold('postDate')} that is not a string`);
  } else if (post.postDate.length === 0) {
    error(`has a ${chalk.bold('postDate')} with no value`);
  } else if (!dateChecker.test(post.postDate)) {
    error(
      `invalid format of ${chalk.bold('postDate')}: ${chalk.bold(
        post.postDate,
      )} (should be 'YYYY-MM-DD')`,
    );
  }

  if (!Object.prototype.hasOwnProperty.call(post, 'price')) {
    error(`has no element ${chalk.bold('price')}`);
  } else if (!(typeof post.price === 'number')) {
    error(
      `has ${chalk.bold('price')} that is not a number: ${chalk.bold(
        post.price,
      )}`,
    );
  }

  if (!Object.prototype.hasOwnProperty.call(post, 'priceStr')) {
    error(`has no element ${chalk.bold('priceStr')}`);
  } else if (!(typeof post.priceStr === 'string')) {
    error(`has ${chalk.bold('priceStr')} that is not a string`);
  } else if (post.priceStr.length === 0) {
    error(`has a ${chalk.bold('priceStr')} with no value`);
  } else if (!currencyChecker.test(post.priceStr)) {
    error(
      `invalid format of ${chalk.bold('priceStr')}: ${chalk.bold(
        post.priceStr,
      )}`,
    );
  }

  if (!Object.prototype.hasOwnProperty.call(post, 'hood')) {
    error(`has no element ${chalk.bold('hood')}`);
  } else if (!(typeof post.hood === 'string')) {
    error(`has ${chalk.bold('hood')} that is not a string`);
  } else if (post.hood.length === 0 && post.source !== Source.craigslist) {
    // Craiglist posts sometimes have no hood, so a blank hood can
    // be ignored for Craigslist.
    error(`has a ${chalk.bold('hood')} with no value`);
  }

  if (!Object.prototype.hasOwnProperty.call(post, 'thumbnailUrl')) {
    error(`has no element ${chalk.bold('thumbnailUrl')}`);
  } else if (!(typeof post.thumbnailUrl === 'string')) {
    error(`has ${chalk.bold('thumbnailUrl')} that is not a string`);
  } else if (post.thumbnailUrl.length === 0) {
    error(`has a ${chalk.bold('thumbnailUrl')} with no value`);
  }

  if (Object.prototype.hasOwnProperty.call(post, 'extras')) {
    if (post.source !== Source.craigslist) {
      error(
        `has ${chalk.bold('extras')} element when the source is ${chalk.bold(
          post.source,
        )}`,
      );
    } else {
      const actualElementKeys = post.extras
        ? Object.keys(post.extras)
        : <string[]>[];
      if (!Object.prototype.hasOwnProperty.call(post.extras, 'subcategories')) {
        error(
          `has ${chalk.bold('extras')} with no element ${chalk.bold(
            'subcategories',
          )}`,
        );
      } else if (
        utils.differenceArrays(['subcategories'], actualElementKeys).length !==
        0
      ) {
        const arr = utils.differenceArrays(
          ['subcategories'],
          actualElementKeys,
        );
        error(
          `has ${chalk.bold('extras')} element with extra keys: ${chalk.bold(
            arr.join(', '),
          )}`,
        );
      } else if (!Array.isArray(post.extras?.subcategories)) {
        error(
          `has ${chalk.bold('extras')} with ${chalk.bold(
            'subcategories',
          )} that is not an array`,
        );
      } else if (post.extras?.subcategories.length === 0) {
        error(
          `has ${chalk.bold('extras')} with ${chalk.bold(
            'subcategories',
          )} with no elements`,
        );
      } else {
        post.extras?.subcategories
          .filter(
            (subcategory) =>
              !utils.isValueInEnum(subcategory, CraigslistSubcategory),
          )
          .forEach((subcategory) =>
            error(
              `has ${'post.extras.subcategories'} which contains an invalid value: ${chalk.bold(
                subcategory,
              )}`,
            ),
          );
      }
    }
  } else if (post.source === Source.craigslist) {
    error(
      `has a source of ${chalk.bold(post.source)} but no ${chalk.bold(
        'extras',
      )} element`,
    );
  }

  // Make sure there are no additional elements which shouldn't be there.
  const actualElementKeys = post ? Object.keys(post) : <string[]>[];
  const arr = utils.differenceArrays(
    [
      'pid',
      'sid',
      'source',
      'regions',
      'searchTerms',
      'title',
      'postDate',
      'price',
      'priceStr',
      'hood',
      'thumbnailUrl',
      'extras',
    ],
    actualElementKeys,
  );
  if (arr.length !== 0) {
    error(`has extra keys: ${chalk.bold(arr.join(', '))}`);
  }
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
    hood: hood ? hood : '',
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
