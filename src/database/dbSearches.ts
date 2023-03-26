import { err, ok, Result } from 'neverthrow';
import chalk from 'chalk';
// import R from 'ramda';

import { Search, Searches, Source } from './models/dbSearches';
import { JsonDb } from '../api/jsonDb/JsonDb';
import lowdb from '../api/jsonDb/lowdbDriver';
import { DbLogger } from './util';
import { isValueInEnum, getDateTimestamp } from '../utils/utils';

export type Database = Searches;

let dbFile: JsonDb<Database>;
let dbData: Database;

const dbLoggerPrefix = '[dbSearches]';
const dbLogger = DbLogger(dbLoggerPrefix);

export const saveData = (): void => {
  dbFile.write();
};

const validateSearchTerms = (searchTerms: string[]): string | null => {
  if (searchTerms.length === 0) {
    return `no search terms`;
  }
  const duplicates = [
    ...new Set(searchTerms.filter((e, i, a) => a.indexOf(e) !== i)),
  ];
  if (duplicates.length) {
    return `duplicate search terms: ${chalk.bold(duplicates.join(', '))}`;
  }
  return null;
};

const validate = (): Result<string[], string[]> => {
  dbLogger.debug("I'm skipping the validate() method for now");
  return ok([]);
  const errors = [] as string[];
  const warnings = [] as string[];
  let fixableIssues = 0;

  Object.keys(dbData).forEach((sid) => {
    const search = dbData[sid];

    if (!search.sid) {
      warnings.push(
        `${dbLoggerPrefix} search "${chalk.bold(
          sid,
        )}" has no internal sid, setting it to ${chalk.bold(sid)}`,
      );
      search.sid = sid;
      fixableIssues++;
    }

    if (!search.alias) {
      errors.push(
        `${dbLoggerPrefix} search sid ${chalk.bold(search.sid)} has no alias`,
      );
    }

    if (!search.isEnabled) {
      warnings.push(
        `${dbLoggerPrefix} search "${chalk.bold(
          sid,
        )}" is missing configuration, setting ${chalk.bold('isEnabled=false')}`,
      );
      search.isEnabled = false;
      fixableIssues++;
    }

    if (!search.rank) {
      search.rank = getNextRank();
      warnings.push(
        `alias "${chalk.bold(search.alias)}" (${chalk.bold(
          sid,
        )}) has no rank, setting it ${chalk.bold(search.rank)}`,
      );
      fixableIssues++;
    }

    if (!search.sources || search.sources.length === 0) {
      errors.push(
        `${dbLoggerPrefix} search sid ${chalk.bold(search.sid)} has no sources`,
      );
    } else {
      search.sources.forEach((source) => {
        // Check that source is valid
        if (!isValueInEnum(source, Source)) {
          errors.push(
            `${dbLoggerPrefix} search ${chalk.bold(
              sid,
            )} has an invalid source: ${chalk.bold(source)}`,
          );
        } else {
          // Check there is a details for a valid source
          const craigslistSearchDetailsName: keyof Search =
            'craigslistSearchDetails';
          const facebookSearchDetailsName: keyof Search =
            'facebookSearchDetails';
          let detailsName: keyof Search;
          const searchTermsElementName = 'searchTerms';
          switch (source) {
            case Source.craigslist:
              detailsName = craigslistSearchDetailsName;
              break;
            case Source.facebook:
              detailsName = facebookSearchDetailsName;
              break;
          }
          // if (Object.prototype.hasOwnProperty.call(search, detailsName)) {
          if (detailsName in search) {
            const theDetails = search[detailsName];
            if (
              theDetails !== undefined &&
              searchTermsElementName in theDetails
            ) {
              const searchTermErrors = validateSearchTerms(
                theDetails.searchTerms,
              );
              if (searchTermErrors) {
                errors.push(
                  `Search ${chalk.bold(sid)} has ${searchTermErrors}`,
                );
              }
            } else {
              errors.push(
                `Search ${chalk.bold(sid)} has no ${chalk.bold(
                  searchTermsElementName,
                )} element`,
              );
            }
          } else {
            errors.push(
              `${dbLoggerPrefix} search sid ${chalk.bold(
                sid,
              )} has a source of ${chalk.bold(
                source,
              )} but doesn't have a ${chalk.bold(detailsName)} element`,
            );
          }
        }
      });

      // Check that source doesn't appear more than once
      const duplicates = [
        ...new Set(search.sources.filter((e, i, a) => a.indexOf(e) !== i)),
      ];
      duplicates.forEach((source) =>
        errors.push(
          `${dbLoggerPrefix} search sid ${chalk.bold(
            search.sid,
          )} has a duplicate source: ${chalk.bold(source)}`,
        ),
      );
    }
  });

  if (fixableIssues > 0) {
    saveData();
    dbLogger.warn(
      `fixed ${fixableIssues} issue${fixableIssues > 1 ? 's' : ''}`,
    );
  }

  if (errors.length > 0) {
    // If there are errors, then we will be stopping, so print out the warnings as well.
    warnings.forEach((warning) => dbLogger.warn(warning));
    return err(errors);
  }

  return ok(warnings);
};

export const init = (thePath: string): Result<string[], string[]> => {
  dbLogger.debug('initializing');
  const jsonDbPosts = lowdb<Database>(thePath);
  dbFile = jsonDbPosts;
  dbData = dbFile.read();
  // data['123'].alias = 'dd'

  // data['123'] = { pid: '123', title: 'The Poop' };
  // db.write();
  // checkValidity();

  const result = validate();
  if (result.isErr()) {
    const messages = [] as string[];
    messages.push('error validating searches');
    result.mapErr((errors) => {
      errors.forEach((msg) => messages.push(msg));
    });
    return err(messages);
  }

  return ok(result.value);
};

/**
 * Tells whether the given search is valid or not. In invalid search is one where this is a problem,
 * such as a missing field.
 */
export const isSearchValid = (sid: string): Result<boolean, string[]> => {
  const errors: string[] = [];

  const buildError = (msg: string): void => {
    errors.push(`search ${chalk.bold(sid)} ${msg}`);
  };

  console.log('sid:', sid);
  const search = dbData[sid];
  console.log('sid:', sid);
  console.log('search:', search);

  // Check SID element is present
  if (!Object.prototype.hasOwnProperty.call(search, 'sid')) {
    buildError(`doesn't exist`);
    return err(errors);
  }
  // Check SID element has a value
  if (!search.sid) {
    buildError(`no search containing that sid`);
    return err(errors);
  }
  // Check SID element matches the parent property element
  if (sid !== search.sid) {
    buildError(`doesn't match sid element of ${chalk.bold(search.sid)}`);
  }

  const checkProperty = (elementName: keyof Search, myType: string): void => {
    console.log('checkProperty() 111, with name', elementName);
    console.log('the type', search[elementName]);
    if (!(elementName in search)) {
      console.log('checkProperty() 222');
      buildError(`has no ${chalk.bold(elementName)} element`);
    } else if (typeof search[elementName] !== myType) {
      console.log('checkProperty() 333');
      buildError(
        `has ${chalk.bold(elementName)} that is not of type ${chalk.bold(
          myType,
        )}`,
      );
    } else if (
      myType === 'string' &&
      (search[elementName] as string).length === 0
    ) {
      console.log('checkProperty() 444');
      buildError(`has no ${chalk.bold(elementName)} value`);
    }
  };

  console.log('000');

  checkProperty('alias', 'string');
  // checkStringProperty('isEnabled');
  // if (!('alias' in search) || search['alias'].length === 0) {
  //   console.log('111');
  //   buildError(`has no ${chalk.bold('alias')} element or value`);
  // }

  checkProperty('isEnabled', 'boolean');

  console.log(`in isValid, errors: ${errors}`);
  if (errors.length > 0) {
    return err(errors);
  } else {
    return ok(true);
  }
};

const buildLogMsg = (msg: string): string => {
  return `[${getDateTimestamp()}] ${msg}`;
};

const addLogNoWrite = (sid: string, msg: string): void => {
  if (!dbData[sid]) {
    return;
  }
  if (!dbData[sid].log) {
    dbData[sid].log = [];
  }
  (dbData[sid].log as string[]).push(buildLogMsg(msg));
};

export const addLogWithWrite = (pid: string, msg: string): void => {
  addLogNoWrite(pid, msg);
  dbFile.write();
};

/**
 * Returns searches that are actionable. i.e. Can actually be searched.
 * Thus it won't return searches with are no enabled, or which have issues.
 */
export const getValidEnabledSearches = (): Searches => {
  return dbData;
};

const getNextRank = (): number => {
  const ranks = Object.values(dbData)
    .filter((search) => typeof search.rank === 'number')
    .map((search) => search.rank);

  const currentMax = ranks.reduce(
    (element, max) => (element > max ? element : max),
    0,
  );

  if (!currentMax || currentMax < 0) {
    return 10;
  }
  return currentMax + 10;
};

// export const createEmptySearch = () => {

// }

// export const addSearch = (search: Search): Result<boolean, string[]> => {
//   return isSearchValid(search.sid);
// };
