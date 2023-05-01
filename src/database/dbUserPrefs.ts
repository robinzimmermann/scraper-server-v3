import { Result, ok, err } from 'neverthrow';

import { JsonDb } from '../api/jsonDb/JsonDb';
import { DbLogger, ElementType } from './utils';
import { SearchPrefs, UserPrefs } from './models/dbUserPrefs';
import { appendErrors, propIsCorrectType1, propIsPresent } from './utils';

export type Database = UserPrefs;

// let dbFile: JsonDb<Database>;
let userPrefsDb: JsonDb<Database>;
let dbData: Database;

const dbLoggerPrefix = '[dbUserPrefs]';
const dbLogger = DbLogger(dbLoggerPrefix);

const isSearchPrefsValid = (searchPrefs: SearchPrefs): Result<boolean, string[]> => {
  const errors: string[] = [];

  Object.keys(searchPrefs).forEach((searchPrefSid) => {
    const searchPref = searchPrefs[searchPrefSid];

    const propIsPresentResult = propIsPresent(
      searchPref,
      `userPrefs.searchPrefs.${searchPrefSid}`,
      'sid',
    );
    if (propIsPresentResult.isErr()) {
      appendErrors(errors, propIsPresentResult);
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

  let propName = 'isUndoing';
  let expectedType = ElementType.boolean;
  let propIsPresentResult = propIsPresent(dbData, 'userPrefs', propName);
  if (propIsPresentResult.isOk()) {
    const userPrefsErrors1 = propIsCorrectType1(dbData, 'userPrefs', propName, expectedType);
    if (userPrefsErrors1.isOk()) {
      // All is good, do nothing
    } else {
      userPrefsErrors1.mapErr((messages: string[]) => messages.forEach((msg) => errors.push(msg)));
    }
  } else {
    propIsPresentResult.mapErr((messages: string[]) => messages.forEach((msg) => errors.push(msg)));
  }

  propName = 'displayMinimalPostcards';
  expectedType = ElementType.boolean;
  propIsPresentResult = propIsPresent(dbData, 'userPrefs', propName);
  if (propIsPresentResult.isOk()) {
    const userPrefsErrors1 = propIsCorrectType1(dbData, 'userPrefs', propName, expectedType);

    if (userPrefsErrors1.isOk()) {
      // All is good, do nothing
    } else {
      userPrefsErrors1.mapErr((messages: string[]) => messages.forEach((msg) => errors.push(msg)));
    }
  } else {
    propIsPresentResult.mapErr((messages: string[]) => messages.forEach((msg) => errors.push(msg)));
  }

  propName = 'searchPrefs';
  expectedType = ElementType.object;
  propIsPresentResult = propIsPresent(dbData, 'userPrefs', propName);
  if (propIsPresentResult.isOk()) {
    const userPrefsErrors = propIsCorrectType1(dbData, 'userPrefs', propName, expectedType);
    if (userPrefsErrors.isOk()) {
      const searchPrefsErrors = isSearchPrefsValid(dbData.searchPrefs);
      if (searchPrefsErrors.isOk()) {
        // All is good, do nothing
      } else {
        appendErrors(errors, searchPrefsErrors);
      }
    } else {
      appendErrors(errors, userPrefsErrors);
    }
  } else {
    appendErrors(errors, propIsPresentResult);
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

  const result = isDbValid();

  return result;
};

export const getUserPrefs = (): UserPrefs => {
  return dbData;
};
