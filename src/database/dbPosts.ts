import chalk from 'chalk';
import { Result, ok, err } from 'neverthrow';

import { CraiglistFields, Post, Posts } from './models/dbPosts';
import { JsonDb } from '../api/jsonDb/JsonDb';
// import jsonDb from '../api/jsonDb/JsonDb';
import {
  DbLogger,
  PropertyPresence,
  PropertyType,
  appendError,
  appendErrors,
  checkProp,
  checkSidReference,
} from './utils';
import * as dbSearches from '../database/dbSearches';
import {
  Source,
  CraigslistSubcategory,
  CraigslistRegion,
  FacebookRegion,
  ScraperRegion,
} from './models/dbSearches';
import * as utils from '../utils/utils';

export type Database = Posts;

// let dbFile: JsonDb<Database>;
let postsDb: JsonDb<Database>;
let dbData: Database;

const dbLoggerPrefix = '[dbPosts]';
const dbLogger = DbLogger(dbLoggerPrefix);

// TODO Add tests which test date format and currency format

// To check a string matches YYYY-MM-DD, where year is higher than 2023.
const dateChecker = /^202[3-9]-[01][0-9]-[0123][0-9]$/;

// To check a string matches currency
const currencyChecker = /^\$(?!0\.00)\d{1,3}(,\d{3})*(\.\d\d)?$/;

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

/**
 * Assume extras field exists
 */
/*
const isExtrasValid = (extras: CraiglistFields, errPrefix: string): Result<boolean, string[]> => {
  const errors: string[] = [];

  const propName = 'subcategories';

  const subcategoriesTypeErrors = propIsCorrectType(
    extras,
    errPrefix,
    propName,
    PropertyType.array,
  );
  if (subcategoriesTypeErrors.isOk()) {
    const propHasStringLength = propHasChars(extras, errPrefix, propName);
    if (propHasStringLength.isOk()) {
      const enumElementsErrors = arrayHasValidEnumElements(
        extras,
        errPrefix,
        propName,
        CraigslistSubcategory,
      );
      if (enumElementsErrors.isOk()) {
        const actualElementKeys = Object.keys(extras);
        if (utils.differenceArrays([propName], actualElementKeys).length === 0) {
          // All good, do nothing
        } else {
          const arr = utils.differenceArrays([propName], actualElementKeys);
          errors.push(
            `${errPrefix} has ${chalk.bold('extras')} element with extra keys: ${chalk.bold(
              arr.join(', '),
            )}`,
          );
        }
      } else {
        appendErrors(errors, enumElementsErrors);
      }
    } else {
      appendErrors(errors, propHasStringLength);
    }
  } else {
    appendErrors(errors, subcategoriesTypeErrors);
  }

  if (errors.length > 0) {
    return err(errors);
  } else {
    return ok(true);
  }
};
*/

/**
 * At this point the extras field exists, but we know nothing about it.
 */
const isExtrasValid = (post: Post, parentErrorPrefix: string): Result<boolean, string[]> => {
  const errors: string[] = [];

  const errorPrefix = chalk.bold(`${parentErrorPrefix} extras`);

  const parent = post.extras;

  appendError(
    errors,
    checkProp(
      parent,
      'subcategories',
      PropertyType.array,
      PropertyPresence.mandatory,
      errorPrefix,
      {
        arrayElementsExpectedType: PropertyType.enum,
        arrayElementsExpectedEnum: CraigslistSubcategory,
        arrayElementsExpectedEnumName: 'CraigslistSubcategory',
      },
    ),
  );

  if (errors.length > 0) {
    return err(errors);
  } else {
    return ok(true);
  }
};

const isPostValid = (key: string, post: Post): Result<boolean, string[]> => {
  const errors: string[] = [];

  // First make sure the parent key and primary key are valid so future errors can be referenced correctly

  if (!key) {
    errors.push(`there is a post with an invalid key`);
  } else {
    const propPresent = checkProp(
      post,
      'pid',
      PropertyType.string,
      PropertyPresence.mandatory,
      chalk.bold('post'),
    );
    if (propPresent.isOk()) {
      if (post.pid !== key) {
        errors.push(
          `${chalk.bold('post')} with key [${chalk.bold(
            key,
          )}] does not match its sid: [${chalk.bold(post.pid)}]`,
        );
      }
    } else {
      appendError(errors, propPresent);
    }
  }
  // Only continue if there is a valid primary key
  if (errors.length > 0) {
    return err(errors);
  }

  const errorPrefix = chalk.bold(`post ${post.pid}`);

  appendError(
    errors,
    checkProp(post, 'pid', PropertyType.string, PropertyPresence.mandatory, errorPrefix),
  );

  const sidResult = checkProp(
    post,
    'sid',
    PropertyType.string,
    PropertyPresence.mandatory,
    errorPrefix,
  );
  if (sidResult.isOk()) {
    // sid is good, now make sure it exists
    appendError(
      errors,
      checkSidReference(post.sid, dbSearches.getSearchBySid(post.sid), errorPrefix),
    );
  }
  appendError(errors, sidResult);

  appendError(
    errors,
    checkProp(post, 'source', PropertyType.enum, PropertyPresence.mandatory, errorPrefix, {
      expectedEnum: Source,
      expectedEnumName: 'Source',
    }),
  );

  appendError(
    errors,
    checkProp(post, 'regions', PropertyType.array, PropertyPresence.mandatory, errorPrefix, {
      arrayElementsExpectedType: PropertyType.enum,
      arrayElementsExpectedEnum: ScraperRegion,
      arrayElementsExpectedEnumName: 'Region',
    }),
  );

  appendError(
    errors,
    checkProp(post, 'searchTerms', PropertyType.array, PropertyPresence.mandatory, errorPrefix, {
      arrayElementsExpectedType: PropertyType.string,
    }),
  );

  appendError(
    errors,
    checkProp(post, 'title', PropertyType.string, PropertyPresence.mandatory, errorPrefix),
  );

  const postDateResult = checkProp(
    post,
    'postDate',
    PropertyType.string,
    PropertyPresence.mandatory,
    errorPrefix,
    {
      propFormat: dateChecker,
      propFormatStr: 'MM-DD-YYYY',
    },
  );
  if (postDateResult.isOk()) {
    // check the format
    // appendError(errors, checkFormat(post.postDate, dateChecker, errorPrefix));
  } else {
    // Facebook posts can have a blank postDate because their results page doesn't show post dates
    if (post.source === Source.facebook) {
      // Ignore it, it's a Facebook post, it's allowed to have empty postDate fields.
    } else {
      appendError(errors, postDateResult);
    }
  }

  appendError(
    errors,
    checkProp(post, 'price', PropertyType.number, PropertyPresence.mandatory, errorPrefix),
  );

  appendError(
    errors,
    checkProp(post, 'priceStr', PropertyType.string, PropertyPresence.mandatory, errorPrefix, {
      propFormat: currencyChecker,
      propFormatStr: '$0,000',
    }),
  );

  appendError(
    errors,
    checkProp(post, 'hood', PropertyType.string, PropertyPresence.mandatory, errorPrefix),
  );

  appendError(
    errors,
    checkProp(post, 'thumbnailUrl', PropertyType.string, PropertyPresence.mandatory, errorPrefix),
  );

  if (post.extras !== undefined) {
    const propExtras = checkProp(
      post,
      'extras',
      PropertyType.object,
      PropertyPresence.optional,
      errorPrefix,
      {
        expectedObjectName: 'CraiglistFields',
      },
    );
    if (propExtras.isOk()) {
      appendErrors(errors, isExtrasValid(post, errorPrefix));
    } else {
      appendError(errors, propExtras);
    }
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

    const result = isPostValid(pid, post);
    if (result.isErr()) {
      result.mapErr((resultErrors) => {
        resultErrors.forEach((msg) => {
          errors.push(msg);
        });
      });
    } else {
      if (post.pid !== pid) {
        errors.push(`post ${chalk.bold(post.pid)} does not match its key: ${chalk.bold(pid)} AAA`);
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
  region: CraigslistRegion | FacebookRegion,
  searchTerm: string,
  title: string,
  postDate: string,
  price: number,
  hood: string,
  thumbnailUrl: string,
  extras?: CraiglistFields,
): Result<Post, string[]> => {
  const errors = <string[]>[];
  if (source === Source.craigslist) {
    if (!extras) {
      errors.push('upsertPost() Craiglists posts must have an "extras" element');
    } else if (!extras.subcategories) {
      errors.push('upsertPost() Craiglists posts must have "extras" with a Craigslist subcategory');
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

  const mergeRegions = (): (CraigslistRegion | FacebookRegion)[] => {
    return postExists ? utils.mergeArrays(dbPost.regions, newPost.regions).sort() : newPost.regions;
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
          .mergeArrays(dbPost.extras?.subcategories || [], newPost.extras?.subcategories || [])
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
      source === Source.craigslist ? { subcategories: mergeCraigslistSubcategories() } : undefined,
  };

  const result = isPostValid(pid, dbData[pid]);
  if (result.isOk()) {
    postsDb.write();
    return ok(dbData[pid]);
  } else {
    return err(result.error);
    // result.mapErr((resultErrors) => {
    //   resultErrors.forEach((msg) => {
    //     logger.error(msg);
    //   });
    // });
  }
};
