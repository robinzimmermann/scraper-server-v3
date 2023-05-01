import chalk from 'chalk';
import { Result, ok, err } from 'neverthrow';

import { CraiglistFields, Post, Posts } from './models/dbPosts';
import { JsonDb } from '../api/jsonDb/JsonDb';
// import jsonDb from '../api/jsonDb/JsonDb';
import {
  DbLogger,
  ElementType,
  arrayHasElements,
  arrayHasValidEnumElements,
  propHasChars,
} from './utils';
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
import { appendErrors, propIsCorrectType1 as propIsCorrectType, propIsPresent } from './utils';

export type Database = Posts;

// let dbFile: JsonDb<Database>;
let postsDb: JsonDb<Database>;
let dbData: Database;

const dbLoggerPrefix = '[dbPosts]';
const dbLogger = DbLogger(dbLoggerPrefix);

// To check a string matches YYYY-MM-DD, where year is higher than 2023.
const dateChecker = /^202[3-9]-[01][0-9]-[0123][0-9]$/;

// To check a string matches currency
const currencyChecker = /([$*\s]*(?:\d{1,3}(?:[\s,]\d{3})+|\d+)(?:.\d{2})?([\s]*[a-z-A-Z]{0,3}))/;

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

/**
 * Assume extras field exists
 */
const isExtrasValid = (extras: CraiglistFields, errPrefix: string): Result<boolean, string[]> => {
  const errors: string[] = [];

  const propName = 'subcategories';

  const subcategoriesTypeErrors = propIsCorrectType(extras, errPrefix, propName, ElementType.array);
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

const isPostValid = (post: Post): Result<boolean, string[]> => {
  const errors: string[] = [];

  // Check that some important elements are there first, before continuing with the standard error checks.
  let propName = 'pid';
  let expectedType = ElementType.string;
  let propIsPresentResult = propIsPresent(post, 'post', propName);
  let propIsCorrectTypeResult: Result<boolean, string[]>;
  if (propIsPresentResult.isOk()) {
    propIsCorrectTypeResult = propIsCorrectType(post, `post ${post.pid}`, propName, expectedType);
    if (propIsCorrectTypeResult.isOk()) {
      if (!isNumeric(post.pid)) {
        errors.push(`a post has a ${chalk.bold('pid')} element that is not numeric string`);
        // return err(errors);
      }
    } else {
      appendErrors(errors, propIsCorrectTypeResult);
    }
  } else {
    appendErrors(errors, propIsPresentResult);
    // return err(errors);
  }

  // Don't continue if there are errors
  if (errors.length > 0) {
    return err(errors);
  }

  const errPrefix = chalk.bold(`post ${post.pid}`);

  const error = (msg: string): void => {
    errors.push(`${errPrefix} ${msg}`);
  };

  propName = 'sid';
  expectedType = ElementType.string;
  propIsPresentResult = propIsPresent(post, errPrefix, propName);
  if (propIsPresentResult.isOk()) {
    propIsCorrectTypeResult = propIsCorrectType(post, errPrefix, propName, expectedType);
    if (propIsCorrectTypeResult.isOk()) {
      if (!dbSearches.getSearchBySid(post.sid)) {
        error(
          `references a search ${chalk.bold('sid')} that doesn't exist: ${chalk.bold(post.sid)}`,
        );
      }
    } else {
      appendErrors(errors, propIsCorrectTypeResult);
    }
  } else {
    appendErrors(errors, propIsPresentResult);
  }

  propName = 'source';
  propIsPresentResult = propIsPresent(post, errPrefix, propName);
  if (propIsPresentResult.isOk()) {
    if (!utils.isValueInEnum(post.source, Source)) {
      error(`has invalid value for ${chalk.bold('source')}: ${chalk.bold(post.source)}`);
    }
  } else {
    appendErrors(errors, propIsPresentResult);
    // return err(errors);
  }

  // Don't continue if there are errors
  if (errors.length > 0) {
    return err(errors);
  }

  propName = 'regions';
  expectedType = ElementType.array;
  propIsPresentResult = propIsPresent(post, 'post', propName);
  if (propIsPresentResult.isOk()) {
    const postTypeErrors = propIsCorrectType(post, errPrefix, propName, expectedType);
    if (postTypeErrors.isOk()) {
      const postArrayLengthErrors = arrayHasElements(post, errPrefix, propName);
      if (postArrayLengthErrors.isOk()) {
        const theEnum = post.source === Source.craigslist ? CraigslistRegion : FacebookRegion;
        const postArrayEnumElementsErrors = arrayHasValidEnumElements(
          post,
          errPrefix,
          propName,
          theEnum,
        );
        if (postArrayEnumElementsErrors.isOk()) {
          // All is good, do nothing
        } else {
          appendErrors(errors, postArrayEnumElementsErrors);
        }
      } else {
        appendErrors(errors, postArrayLengthErrors);
      }
    } else {
      appendErrors(errors, postTypeErrors);
    }
  } else {
    appendErrors(errors, propIsPresentResult);
  }

  propName = 'searchTerms';
  expectedType = ElementType.array;
  propIsPresentResult = propIsPresent(post, 'post', propName);
  if (propIsPresentResult.isOk()) {
    const postTypeErrors = propIsCorrectType(post, errPrefix, propName, expectedType);
    if (postTypeErrors.isOk()) {
      const postArrayLengthErrors = arrayHasElements(post, errPrefix, propName);
      if (postArrayLengthErrors.isOk()) {
        // All is good, do nothing
      } else {
        appendErrors(errors, postArrayLengthErrors);
      }
    } else {
      appendErrors(errors, postTypeErrors);
    }
  } else {
    appendErrors(errors, propIsPresentResult);
  }

  propName = 'title';
  expectedType = ElementType.string;
  propIsPresentResult = propIsPresent(post, errPrefix, propName);
  if (propIsPresentResult.isOk()) {
    propIsCorrectTypeResult = propIsCorrectType(post, errPrefix, propName, expectedType);
    if (propIsCorrectTypeResult.isOk()) {
      const propHasStringLength = propHasChars(post, errPrefix, propName);
      if (propHasStringLength.isOk()) {
        // All is good, do nothing
      } else {
        appendErrors(errors, propHasStringLength);
      }
    } else {
      appendErrors(errors, propIsCorrectTypeResult);
    }
  } else {
    appendErrors(errors, propIsPresentResult);
  }

  propName = 'postDate';
  expectedType = ElementType.string;
  propIsPresentResult = propIsPresent(post, errPrefix, propName);
  if (propIsPresentResult.isOk()) {
    propIsCorrectTypeResult = propIsCorrectType(post, errPrefix, propName, expectedType);
    if (propIsCorrectTypeResult.isOk()) {
      const propHasStringLength = propHasChars(post, errPrefix, propName);
      if (propHasStringLength.isOk()) {
        if (dateChecker.test(post.postDate)) {
          // All is good, do nothing
        } else {
          error(
            `invalid format of ${chalk.bold(propName)}: ${chalk.bold(
              post.postDate,
            )} (should be 'YYYY-MM-DD')`,
          );
        }
      } else {
        // Facebook Marketplace doesn't include post dates on its search results page,
        // so they may be blank.
        // The future postDate tests only apply if the post is not Facebook, or it is Facebook,
        // but the postDate is supplied
        if (post.source !== Source.facebook) {
          appendErrors(errors, propHasStringLength);
        }
      }
    } else {
      appendErrors(errors, propIsCorrectTypeResult);
    }
  } else {
    appendErrors(errors, propIsPresentResult);
  }

  propName = 'price';
  expectedType = ElementType.number;
  propIsPresentResult = propIsPresent(post, errPrefix, propName);
  if (propIsPresentResult.isOk()) {
    propIsCorrectTypeResult = propIsCorrectType(post, errPrefix, propName, expectedType);
    if (propIsCorrectTypeResult.isOk()) {
      // All is good, do nothing
    } else {
      appendErrors(errors, propIsCorrectTypeResult);
    }
  } else {
    appendErrors(errors, propIsPresentResult);
  }

  propName = 'priceStr';
  expectedType = ElementType.string;
  propIsPresentResult = propIsPresent(post, errPrefix, propName);
  if (propIsPresentResult.isOk()) {
    propIsCorrectTypeResult = propIsCorrectType(post, errPrefix, propName, expectedType);
    if (propIsCorrectTypeResult.isOk()) {
      const propHasStringLength = propHasChars(post, errPrefix, propName);
      if (propHasStringLength.isOk()) {
        if (currencyChecker.test(post.priceStr)) {
          // All is good, do nothing
        } else {
          error(`invalid format of ${chalk.bold(propName)}: ${chalk.bold(post.postDate)}`);
        }
      } else {
        // Facebook Marketplace doesn't include post dates on its search results page,
        // so they may be blank.
        // The future postDate tests only apply if the post is not Facebook, or it is Facebook,
        // but the postDate is supplied
        if (post.source !== Source.facebook) {
          appendErrors(errors, propHasStringLength);
        }
      }
    } else {
      appendErrors(errors, propIsCorrectTypeResult);
    }
  } else {
    appendErrors(errors, propIsPresentResult);
  }

  propName = 'hood';
  expectedType = ElementType.string;
  propIsPresentResult = propIsPresent(post, errPrefix, propName);
  if (propIsPresentResult.isOk()) {
    propIsCorrectTypeResult = propIsCorrectType(post, errPrefix, propName, expectedType);
    if (propIsCorrectTypeResult.isOk()) {
      const propHasStringLength = propHasChars(post, errPrefix, propName);
      if (propHasStringLength.isOk()) {
        // All is good, do nothing
      } else {
        // Craiglist posts sometimes have no hood, so a blank hood can
        // be ignored for Craigslist.
        if (post.source !== Source.craigslist) {
          appendErrors(errors, propHasStringLength);
        }
      }
    } else {
      appendErrors(errors, propIsCorrectTypeResult);
    }
  } else {
    appendErrors(errors, propIsPresentResult);
  }

  propName = 'thumbnailUrl';
  expectedType = ElementType.string;
  propIsPresentResult = propIsPresent(post, errPrefix, propName);
  if (propIsPresentResult.isOk()) {
    propIsCorrectTypeResult = propIsCorrectType(post, errPrefix, propName, expectedType);
    if (propIsCorrectTypeResult.isOk()) {
      const propHasStringLength = propHasChars(post, errPrefix, propName);
      if (propHasStringLength.isOk()) {
        // All is good, do nothing
      } else {
        appendErrors(errors, propHasStringLength);
      }
    } else {
      appendErrors(errors, propIsCorrectTypeResult);
    }
  } else {
    appendErrors(errors, propIsPresentResult);
  }

  propName = 'extras';
  expectedType = ElementType.object;
  propIsPresentResult = propIsPresent(post, errPrefix, propName);
  if (propIsPresentResult.isOk()) {
    // Only Craigslist posts should have this field.
    if (post.source !== Source.craigslist) {
      error(`has ${chalk.bold('extras')} element when the source is ${chalk.bold(post.source)}`);
    }
    const extrasTypeErrors = propIsCorrectType(post, errPrefix, propName, expectedType);
    if (extrasTypeErrors.isOk() && post.extras) {
      const extrasErrors = isExtrasValid(post.extras, errPrefix);
      if (extrasErrors.isOk()) {
        // All is good, do nothing
      } else {
        appendErrors(errors, extrasErrors);
      }
    } else {
      appendErrors(errors, extrasTypeErrors);
    }
  } else {
    // This is a mandatory field for Craigslist posts.
    if (post.source === Source.craigslist) {
      appendErrors(errors, propIsPresentResult);
    }
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
    error(`has unknown keys: ${chalk.bold(arr.join(', '))}`);
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
        errors.push(`post ${chalk.bold(post.pid)} does not match its key: ${chalk.bold(pid)}`);
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

  const mergeRegions = (): Region[] => {
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

  const result = isPostValid(dbData[pid]);
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
