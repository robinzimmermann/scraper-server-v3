import { Result, ok, err } from 'neverthrow';

import { JsonDb } from '../api/jsonDb/JsonDb';
import { DbLogger } from './util';
import { SearchPrefs, UserPrefs } from './models/dbUserPrefs';
import { appendErrors, propIsCorrectType, propIsPresent } from './utils';

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

    // const prop = getPpAsKey('sid');
    const propIsPResult = propIsPresent(
      searchPref,
      `userPrefs.searchPrefs.${searchPrefSid}`,
      'sid',
    );
    if (propIsPResult.isErr()) {
      // propIsPResult.mapErr((messages: string[]) => messages.forEach((msg) => errors.push(msg)));
      appendErrors(errors, propIsPResult);
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

  // const propIsPresent = (propName: string): boolean => {
  //   const prop = getPpAsKey(propName);
  //   const propIsPresentResult = dbData[prop] !== undefined;
  //   if (!propIsPresentResult) {
  //     errors.push(
  //       `userPrefs has no element ${chalk.bold(JSON.stringify(prop))}`,
  //     );
  //   }
  //   return propIsPresentResult;
  // };

  // const propIsCorrectType = (propName: string, eType: string): boolean => {
  //   const prop = getPpAsKey(propName);
  //   const propIsCorectTypeResult = dbData[prop] !== undefined;
  //   if (typeof dbData[prop] !== eType) {
  //     errors.push(
  //       `userPrefs has ${getAorAn(propName)} ${chalk.bold(
  //         propName,
  //       )} element that is not ${getAorAn(eType)} ${chalk.bold(eType)}`,
  //     );
  //   }
  //   return propIsCorectTypeResult;
  // };

  let propName = 'isUndoing';
  let expectedType = 'boolean';
  const propIsPResult3 = propIsPresent(dbData, 'userPrefs', propName);
  if (propIsPResult3.isOk()) {
    const userPrefsErrors1 = propIsCorrectType(dbData, 'userPrefs', propName, expectedType);

    if (userPrefsErrors1.isOk()) {
      // All is good, do nothing
    } else {
      userPrefsErrors1.mapErr((messages: string[]) => messages.forEach((msg) => errors.push(msg)));
    }
  } else {
    propIsPResult3.mapErr((messages: string[]) => messages.forEach((msg) => errors.push(msg)));
  }

  propName = 'displayMinimalPostcards';
  expectedType = 'boolean';
  const propIsPResult = propIsPresent(dbData, 'userPrefs', propName);
  if (propIsPResult.isOk()) {
    const userPrefsErrors1 = propIsCorrectType(dbData, 'userPrefs', propName, expectedType);

    if (userPrefsErrors1.isOk()) {
      // All is good, do nothing
    } else {
      userPrefsErrors1.mapErr((messages: string[]) => messages.forEach((msg) => errors.push(msg)));
    }
  } else {
    propIsPResult.mapErr((messages: string[]) => messages.forEach((msg) => errors.push(msg)));
  }

  propName = 'searchPrefs';
  expectedType = 'object';
  const propIsPResult2 = propIsPresent(dbData, 'userPrefs', propName);
  if (propIsPResult2.isOk()) {
    const userPrefsErrors = propIsCorrectType(dbData, 'userPrefs', propName, expectedType);
    if (userPrefsErrors.isOk()) {
      const searchPrefsErrors = isSearchPrefsValid(dbData.searchPrefs);
      // searchPrefsErrors.mapErr((messages: string[]) => messages.forEach((msg) => errors.push(msg)));
      if (searchPrefsErrors.isOk()) {
        // All is good, do nothing
      } else {
        appendErrors(errors, searchPrefsErrors);
      }
    } else {
      // userPrefsErrors.mapErr((messages: string[]) => messages.forEach((msg) => errors.push(msg)));
      appendErrors(errors, userPrefsErrors);
    }
  } else {
    // propIsPResult2.mapErr((messages: string[]) => messages.forEach((msg) => errors.push(msg)));
    appendErrors(errors, propIsPResult2);
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
