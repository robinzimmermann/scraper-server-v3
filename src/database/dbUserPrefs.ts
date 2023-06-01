import { Result, ok, err } from 'neverthrow';

import { JsonDb } from '../api/jsonDb/JsonDb';
import {
  DbLogger,
  PropertyPresence,
  PropertyType,
  appendError,
  checkProp,
  checkSidReference,
} from './utils';
import { SearchPref, UserPrefs } from './models/dbUserPrefs';
import { appendErrors } from './utils';
import chalk from 'chalk';
import * as dbSearches from '../database/dbSearches';

export type Database = UserPrefs;

// let dbFile: JsonDb<Database>;
let userPrefsDb: JsonDb<Database>;
let dbData: Database;

const dbLoggerPrefix = '[dbUserPrefs]';
const dbLogger = DbLogger(dbLoggerPrefix);

const isSearchPrefValid = (key: string, searchPref: SearchPref): Result<boolean, string[]> => {
  const errors: string[] = [];

  const errorPrefix = chalk.bold(`userPrefs.searchPrefs['${key}']`);

  const sidResult = checkProp(
    searchPref,
    'sid',
    PropertyType.string,
    PropertyPresence.mandatory,
    errorPrefix,
  );
  if (sidResult.isOk()) {
    appendError(
      errors,
      checkSidReference(searchPref.sid, dbSearches.getSearchBySid(searchPref.sid), errorPrefix),
    );
  } else {
    appendError(errors, sidResult);
  }

  appendError(
    errors,
    checkProp(
      searchPref,
      'showInHeader',
      PropertyType.boolean,
      PropertyPresence.mandatory,
      errorPrefix,
    ),
  );

  appendError(
    errors,
    checkProp(
      searchPref,
      'isSelected',
      PropertyType.boolean,
      PropertyPresence.mandatory,
      errorPrefix,
    ),
  );

  if (errors.length > 0) {
    return err(errors);
  } else {
    return ok(true);
  }
};

/**
 Assumes searchPrefs exists.
 */
const isSearchPrefsValid = (): Result<boolean, string[]> => {
  const errors: string[] = [];

  const searchPrefs = dbData.searchPrefs;

  const errorPrefix = chalk.bold(`userPrefs.searchPrefs`);

  Object.keys(searchPrefs).forEach((key) => {
    // TODO searchPref is an actual object
    // TODO searchPref.sid = its parent key
    // TODO searchPref is a valid SearchPref
    const searchPref = searchPrefs[key];
    const dummy = checkProp(
      searchPrefs,
      key,
      PropertyType.object,
      PropertyPresence.mandatory,
      errorPrefix,
    );

    if (dummy.isOk()) {
      if (key === searchPref.sid) {
        const searchPrefResult = isSearchPrefValid(key, searchPref);
        if (searchPrefResult.isOk()) {
          // Everything is going well
        } else {
          appendErrors(errors, searchPrefResult);
        }
      } else {
        let sidError = searchPref.sid;
        if (searchPref.sid === '') {
          sidError = "''";
        } else if (!searchPref.sid) {
          sidError = '<blank>';
        }
        errors.push(
          `${chalk.bold(errorPrefix)} with key [${chalk.bold(
            key,
          )}] does not match its sid: [${chalk.bold(sidError)}]`,
        );
      }
    } else {
      appendError(errors, dummy);
    }
  });

  if (errors.length > 0) {
    return err(errors);
  } else {
    return ok(true);
  }
};

const isDbValid = (): Result<boolean, string[]> => {
  const errors: string[] = [];

  const userPrefs = dbData;

  const errorPrefix = chalk.bold(`userPrefs`);

  appendError(
    errors,
    checkProp(
      userPrefs,
      'isUndoing',
      PropertyType.boolean,
      PropertyPresence.mandatory,
      errorPrefix,
    ),
  );

  appendError(
    errors,
    checkProp(
      userPrefs,
      'displayMinimalPostcards',
      PropertyType.boolean,
      PropertyPresence.mandatory,
      errorPrefix,
    ),
  );

  const prefsProp = checkProp(
    userPrefs,
    'searchPrefs',
    PropertyType.object,
    PropertyPresence.mandatory,
    errorPrefix,
    {
      expectedObjectName: 'SearchPrefs',
    },
  );
  if (prefsProp.isOk()) {
    appendErrors(errors, isSearchPrefsValid());
  } else {
    appendError(errors, prefsProp);
  }

  if (errors.length > 0) {
    return err(errors);
  } else {
    return ok(true);
  }
};

export const init = (db: JsonDb<Database>): Result<boolean, string[]> => {
  dbLogger.info('initializing');

  userPrefsDb = db;
  dbData = userPrefsDb.read();

  // If user prefs doesn't exist, create the minimal data
  if (Object.keys(dbData).length === 0) {
    dbData = <UserPrefs>{ isUndoing: false, displayMinimalPostcards: false, searchPrefs: {} };
  }
  const result = isDbValid();

  return result;
};

export const getUserPrefs = (): UserPrefs => {
  return dbData;
};
