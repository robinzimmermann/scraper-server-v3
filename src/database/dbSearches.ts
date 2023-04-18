import { err, ok, Result } from 'neverthrow';
import chalk from 'chalk';
// import R from 'ramda';

import {
  type Search,
  Searches,
  Source,
  CraigslistSearchDetails,
  FacebookSearchDetails,
  CraigslistRegion,
  CraigslistSubcategory,
  FacebookRegion,
} from './models/dbSearches';
import { JsonDb } from '../api/jsonDb/JsonDb';
// import jsonDb from '../api/jsonDb/lowdbDriver';
import { DbLogger } from './util';
import { getDateTimestamp, isValueInEnum } from '../utils/utils';
import { rankComparator } from '../utils/sorters/searches';

export type Database = Searches;

// let dbFile: JsonDb<Database>;
let myJsonDb: JsonDb<Database>;
let dbData: Database;

const dbLoggerPrefix = '[dbSearches]';
const dbLogger = DbLogger(dbLoggerPrefix);

// const validateSearchTerms = (searchTerms: string[]): string | null => {
//   if (searchTerms.length === 0) {
//     return 'no search terms';
//   }
//   const duplicates = [
//     ...new Set(searchTerms.filter((e, i, a) => a.indexOf(e) !== i)),
//   ];
//   if (duplicates.length) {
//     return `duplicate search terms: ${chalk.bold(duplicates.join(', '))}`;
//   }
//   return null;
// };

// const validate = (): Result<string[], string[]> => {
//   dbLogger.debug("I'm skipping the validate() method for now");
//   return ok([]);
//   const errors = [] as string[];
//   const warnings = [] as string[];
//   let fixableIssues = 0;

//   Object.keys(dbData).forEach((sid) => {
//     const search = dbData[sid];

//     if (!search.sid) {
//       warnings.push(
//         `${dbLoggerPrefix} search "${chalk.bold(
//           sid,
//         )}" has no internal sid, setting it to ${chalk.bold(sid)}`,
//       );
//       search.sid = sid;
//       fixableIssues++;
//     }

//     if (!search.alias) {
//       errors.push(
//         `${dbLoggerPrefix} search sid ${chalk.bold(search.sid)} has no alias`,
//       );
//     }

//     if (!search.isEnabled) {
//       warnings.push(
//         `${dbLoggerPrefix} search "${chalk.bold(
//           sid,
//         )}" is missing configuration, setting ${chalk.bold('isEnabled=false')}`,
//       );
//       search.isEnabled = false;
//       fixableIssues++;
//     }

//     if (!search.rank) {
//       search.rank = getNextRank();
//       warnings.push(
//         `alias "${chalk.bold(search.alias)}" (${chalk.bold(
//           sid,
//         )}) has no rank, setting it ${chalk.bold(search.rank)}`,
//       );
//       fixableIssues++;
//     }

//     if (!search.sources || search.sources.length === 0) {
//       errors.push(
//         `${dbLoggerPrefix} search sid ${chalk.bold(search.sid)} has no sources`,
//       );
//     } else {
//       search.sources.forEach((source) => {
//         // Check that source is valid
//         if (!isValueInEnum(source, Source)) {
//           errors.push(
//             `${dbLoggerPrefix} search ${chalk.bold(
//               sid,
//             )} has an invalid source: ${chalk.bold(source)}`,
//           );
//         } else {
//           // Check there is a details for a valid source
//           const craigslistSearchDetailsName: keyof Search =
//             'craigslistSearchDetails';
//           const facebookSearchDetailsName: keyof Search =
//             'facebookSearchDetails';
//           let detailsName: keyof Search;
//           const searchTermsElementName = 'searchTerms';
//           switch (source) {
//             case Source.craigslist:
//               detailsName = craigslistSearchDetailsName;
//               break;
//             case Source.facebook:
//               detailsName = facebookSearchDetailsName;
//               break;
//           }
//           // if (Object.prototype.hasOwnProperty.call(search, detailsName)) {
//           if (detailsName in search) {
//             const theDetails = search[detailsName];
//             if (
//               theDetails !== undefined &&
//               searchTermsElementName in theDetails
//             ) {
//               const searchTermErrors = validateSearchTerms(
//                 theDetails.searchTerms,
//               );
//               if (searchTermErrors) {
//                 errors.push(
//                   `Search ${chalk.bold(sid)} has ${searchTermErrors}`,
//                 );
//               }
//             } else {
//               errors.push(
//                 `Search ${chalk.bold(sid)} has no ${chalk.bold(
//                   searchTermsElementName,
//                 )} element`,
//               );
//             }
//           } else {
//             errors.push(
//               `${dbLoggerPrefix} search sid ${chalk.bold(
//                 sid,
//               )} has a source of ${chalk.bold(
//                 source,
//               )} but doesn't have a ${chalk.bold(detailsName)} element`,
//             );
//           }
//         }
//       });

//       // Check that source doesn't appear more than once
//       const duplicates = [
//         ...new Set(search.sources.filter((e, i, a) => a.indexOf(e) !== i)),
//       ];
//       duplicates.forEach((source) =>
//         errors.push(
//           `${dbLoggerPrefix} search sid ${chalk.bold(
//             search.sid,
//           )} has a duplicate source: ${chalk.bold(source)}`,
//         ),
//       );
//     }
//   });

//   if (fixableIssues > 0) {
//     saveData();
//     dbLogger.warn(
//       `fixed ${fixableIssues} issue${fixableIssues > 1 ? 's' : ''}`,
//     );
//   }

//   if (errors.length > 0) {
//     // If there are errors, then we will be stopping, so print out the warnings as well.
//     warnings.forEach((warning) => dbLogger.warn(warning));
//     return err(errors);
//   }

//   return ok(warnings);
// };

// export const init = (thePath: string): Result<boolean, string[]> => {
export const init = (jsonDb: JsonDb<Database>): Result<boolean, string[]> => {
  dbLogger.info('initializing');

  // myJsonDb = jsonDb;

  // const jsonDbPosts = jsonDb<Database>(thePath);
  // const jsonDbPosts = myJsonDb.read();
  // dbFile = jsonDbPosts;
  // dbData = dbFile.read();
  // dbData = myJsonDb.read();

  myJsonDb = jsonDb;
  dbData = myJsonDb.read();

  const result = isDbValid();
  // dbLogger.debug(`dbData=${JSON.stringify(dbData)}`);

  return result;
  // if (result.isErr()) {
  //   const messages = [] as string[];
  //   messages.push('error validating searches');
  //   result.mapErr((errors) => {
  //     errors.forEach((msg) => messages.push(msg));
  //   });
  //   return err(messages);
  // }
  // console.log('dbData=', dbData);

  // return ok(result.value);
};

/**
 * Tells whether the given search is valid or not. In invalid search is one where this is a problem,
 * such as a missing field.
 */
const isSearchValid = (search: Search): Result<boolean, string[]> => {
  const errors: string[] = [];

  // Check SID element is present
  if (search.sid === undefined) {
    errors.push(`search has no element ${chalk.bold('sid')}`);
    return err(errors);
  }

  // Check SID element is the correct type
  if (typeof search.sid !== 'string') {
    errors.push(
      `search has ${chalk.bold('sid')} that is not of type ${chalk.bold(
        'string',
      )}`,
    );
    return err(errors);
  }

  // Check SID element has a value
  if (search.sid.length === 0) {
    errors.push(`search has a ${chalk.bold('sid')} with no value`);
    return err(errors);
  }

  const sid = search['sid']; // sid must exist at this point

  const buildError = (msg: string): void => {
    errors.push(`search ${chalk.bold(sid)} ${msg}`);
  };

  const checkPrimitiveProperty = (
    elementName: keyof Search,
    myType: string,
  ): void => {
    if (!(elementName in search)) {
      buildError(`has no element ${chalk.bold(elementName)}`);
    } else if (typeof search[elementName] !== myType) {
      buildError(
        `has ${chalk.bold(elementName)} that is not of type ${chalk.bold(
          myType,
        )} (it is type ${typeof search[elementName]})`,
      );
    } else if (
      myType === 'string' &&
      (search[elementName] as string).length === 0
    ) {
      buildError(`has no value for ${chalk.bold(elementName)}`);
    }

    // Check if sources are valid
    // if ()
  };

  // Make sure the sources are valid, and the assocated details section for
  // each source is valid.
  const checkSourcesAreValid = (sources: Source[]): void => {
    const checkCraigslistSearchDetails = (
      searchDetails: CraigslistSearchDetails,
    ): void => {
      const searchDetailsName = 'craigslistSearchDetails';

      if (!('searchTerms' in searchDetails)) {
        buildError(
          `has ${chalk.bold(searchDetailsName)} without a ${chalk.bold(
            'searchTerms',
          )} element`,
        );
        return;
      }
      const { searchTerms } = searchDetails;
      if (!(searchTerms instanceof Array)) {
        buildError(
          `has ${chalk.bold(
            `${searchDetailsName}.searchTerms`,
          )} which is not an ${chalk.bold('array')}`,
        );
      }
      if (searchTerms.length === 0) {
        buildError(
          `has ${chalk.bold(
            `${searchDetailsName}.searchTerms`,
          )} with no values`,
        );
      }

      if (!('regions' in searchDetails)) {
        buildError(
          `has ${chalk.bold(searchDetailsName)} without a ${chalk.bold(
            'regions',
          )} element`,
        );
        return;
      }
      if (!Array.isArray(searchDetails.regions)) {
        buildError(
          `has ${chalk.bold(
            `${searchDetailsName}.regions`,
          )} which is not an ${chalk.bold('array')}`,
        );
      } else {
        const { regions } = searchDetails;
        if (regions.length === 0) {
          buildError(
            `has ${chalk.bold(`${searchDetailsName}.regions`)} with no values`,
          );
        }
        // Make sure regions has valid values.
        regions.forEach((region) => {
          if (!isValueInEnum(region, CraigslistRegion)) {
            buildError(
              `has ${chalk.bold(
                `${searchDetailsName}.regions`,
              )} that contains an invalid value: ${chalk.bold(region)}`,
            );
          }
        });
      }

      if (!('subcategories' in searchDetails)) {
        buildError(
          `has ${chalk.bold(searchDetailsName)} without a ${chalk.bold(
            'subcategories',
          )} element`,
        );
        return;
      }
      const { subcategories } = searchDetails;
      if (!Array.isArray(subcategories)) {
        buildError(
          `has ${chalk.bold(
            `${searchDetailsName}.subcategories`,
          )} which is not an ${chalk.bold('array')}`,
        );
      } else if (subcategories.length === 0) {
        buildError(
          `has ${chalk.bold(
            `${searchDetailsName}.subcategories`,
          )} with no values`,
        );
      } else {
        // Make sure subcategories has valid values.
        subcategories.forEach((subcategory) => {
          if (!isValueInEnum(subcategory, CraigslistSubcategory)) {
            buildError(
              `has ${chalk.bold(
                `${searchDetailsName}.subcategories`,
              )} that contains an invalid value: ${chalk.bold(subcategory)}`,
            );
          }
        });
      }
    };

    const checkFacebookSearchDetails = (
      searchDetails: FacebookSearchDetails,
    ): void => {
      const searchDetailsName = 'facebookSearchDetails';
      if (!('searchTerms' in searchDetails)) {
        buildError(
          `has ${chalk.bold(searchDetailsName)} without a ${chalk.bold(
            'searchTerms',
          )} element`,
        );
        return;
      }
      const { searchTerms } = searchDetails;
      if (!(searchTerms instanceof Array)) {
        buildError(
          `has ${chalk.bold(
            `${searchDetailsName}.searchTerms`,
          )} which is not an ${chalk.bold('array')}`,
        );
      }
      if (searchTerms.length === 0) {
        buildError(
          `has ${chalk.bold(
            `${searchDetailsName}.searchTerms`,
          )} with no values`,
        );
      }

      if (!('regionalDetails' in searchDetails)) {
        buildError(
          `has ${chalk.bold(searchDetailsName)} without a ${chalk.bold(
            'regionalDetails',
          )} element`,
        );
        return;
      }
      const { regionalDetails } = searchDetails;
      if (!(regionalDetails instanceof Array)) {
        buildError(
          `has ${chalk.bold(
            `${searchDetailsName}.regionalDetails`,
          )} which is not an ${chalk.bold('array')}`,
        );
      }
      if (regionalDetails.length === 0) {
        buildError(
          `has ${chalk.bold(
            `${searchDetailsName}.regionalDetails`,
          )} with no values`,
        );
      }
      // Make sure regionalDetails has valid regions.
      regionalDetails.forEach((regionalDetail) => {
        if (!('region' in regionalDetail)) {
          buildError(
            `has a ${chalk.bold(
              `${searchDetailsName}.regionalDetails`,
            )} section with ${chalk.bold('region')} element missing`,
          );
        }
        if (typeof regionalDetail.region !== 'string') {
          buildError(
            `has a ${chalk.bold(
              `${searchDetailsName}.regionalDetails`,
            )} section where ${chalk.bold('region')} is not a ${chalk.bold(
              'string',
            )} type`,
          );
        }
        // Make sure region has valid values.
        if (!isValueInEnum(regionalDetail.region, FacebookRegion)) {
          buildError(
            `has a ${chalk.bold(
              `${searchDetailsName}.regionalDetails`,
            )} section where ${chalk.bold(
              'region',
            )} is not a valid value from ${chalk.bold(
              'FacebookRegion',
            )} enum: ${chalk.bold(regionalDetail.region)}`,
          );
        }
        if (Object.keys(regionalDetail).length !== 2) {
          buildError(
            `has a ${chalk.bold(
              `${searchDetailsName}.regionalDetails`,
            )} section where ${chalk.bold(
              'region',
            )} has extra properties: ${chalk.bold(
              JSON.stringify(regionalDetail),
            )}`,
          );
        }

        if (!('distance' in regionalDetail)) {
          buildError(
            `has a ${chalk.bold(
              `${searchDetailsName}.regionalDetails`,
            )} section with ${chalk.bold('distance')} element missing`,
          );
        }
        if (typeof regionalDetail.distance !== 'number') {
          buildError(
            `has a ${chalk.bold(
              `${searchDetailsName}.regionalDetails`,
            )} section where ${chalk.bold('distance')} is not a ${chalk.bold(
              'number',
            )} type`,
          );
        }
      });
    };

    if (!sources) {
      buildError(`has no value for ${chalk.bold('sources')}`);
      return;
    }
    if (!(sources instanceof Array)) {
      buildError(
        `has ${chalk.bold('sources')} which is not an ${chalk.bold('array')}`,
      );
      return;
    }
    if (sources.length === 0) {
      buildError(`has ${chalk.bold('sources')} with no values`);
      return;
    }

    sources.forEach((source) => {
      if (!isValueInEnum(source, Source)) {
        buildError(
          `contains a ${chalk.bold('source')} which is not valid: ${chalk.bold(
            source,
          )}`,
        );
      } else {
        // For every valid source, there must be details section
        const detailsName: keyof Search = `${source}SearchDetails`;
        if (!search[detailsName]) {
          buildError(
            `contains a source of ${chalk.bold(source)} but no ${chalk.bold(
              detailsName,
            )} element`,
          );
        } else {
          switch (source) {
            case Source.craigslist:
              checkCraigslistSearchDetails(
                search[detailsName] as CraigslistSearchDetails,
              );
              break;
            case Source.facebook:
              checkFacebookSearchDetails(
                search[detailsName] as FacebookSearchDetails,
              );
              break;
          }
        }
      }
    });
  };

  // const checkSearchDetails = (details: CraigslistSearchDetails | FacebookSearchDetails): void => {
  // };

  checkPrimitiveProperty('alias', 'string');
  checkPrimitiveProperty('isEnabled', 'boolean');
  checkPrimitiveProperty('rank', 'number');

  let optionalField = 'minPrice' as keyof Search;
  if (search[optionalField] !== undefined) {
    checkPrimitiveProperty(optionalField, 'number');
  }

  optionalField = 'maxPrice' as keyof Search;
  if (search[optionalField] !== undefined) {
    checkPrimitiveProperty(optionalField, 'number');
  }

  checkSourcesAreValid(search.sources);

  /*
  export type CraigslistSearchDetails = {
  searchTerms: string[];
  regions: CraigslistRegion[];
  subcategories: CraigslistSubcategory[];
};

export type FacebookSearchRegionDetails = {
  region: FacebookRegion;
  distance: FacebookRadius;
};

export type FacebookSearchDetails = {
  searchTerms: string[];
  regionalDetails: FacebookSearchRegionDetails[];
};

export type Search = {
  sid: string; //search id
  alias: string; // common search term name that applies to all sources
  isEnabled: boolean; // whether this will be included in the next search
  rank: number;
  minPrice?: number;
  maxPrice?: number;
  sources: Source[]; // list of sources this search should use
  craigslistSearchDetails?: CraigslistSearchDetails;
  facebookSearchDetails?: FacebookSearchDetails;
  log?: string[];
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

  Object.keys(dbData).forEach((sid) => {
    const search = dbData[sid];
    const result = isSearchValid(search);
    if (result.isErr()) {
      result.mapErr((resultErrors) => {
        resultErrors.forEach((msg) => {
          errors.push(msg);
        });
      });
    }
  });

  /*
  const buildError = (msg: string): void => {
    errors.push(`search ${chalk.bold(sid)} ${msg}`);
  };


  console.log('sid:', sid);
  const search = dbData[sid];
  console.log('sid:', sid);
  console.log('search:', search);

  // Check SID element is present                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               .
/                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       if (!Object.prototype.hasOwnProperty.call(search, 'sid')) {
    buildError(`doesn't exist`);
    return err(errors)
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
    console.log(`checkProperty() 111, name=${elementName}, myType=${myType}`);
    console.log('the search', search[elementName]);
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

    // Check if sources are valid
    // if ()
  };

  console.log('000');

  checkProperty('alias', 'string');
  // checkStringProperty('isEnabled');
  // if (!('alias' in search) || search['alias'].length === 0) {
  //   console.log('111');
  //   buildError(`has no ${chalk.bold('alias')} element or value`);
  // }

  checkProperty('isEnabled', 'boolean');

  checkProperty('rank', 'number');

  console.log('TYPE:', typeof search.sources);
  checkProperty('sources', 'object');

  console.log(`in isValid, errors: ${errors}`);
  */
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
  // dbFile.write();
  myJsonDb.write();
};

/**
 * Returns searches that are actionable. i.e. Can actually be searched.
 * Thus it won't return searches with are no enabled, or which have issues.
 * Searches will be returned in order sortd by rank.
 */
export const getValidEnabledSearches = (): Search[] => {
  const goodSearches: Search[] = [];
  Object.keys(dbData)
    .filter((sid) => {
      const result = isSearchValid(dbData[sid]);
      return result.isOk();
    })
    .filter((sid) => dbData[sid].isEnabled)
    .map((sid) => dbData[sid])
    .sort(rankComparator)
    .forEach((search) => goodSearches.push(search));
  return goodSearches;
};

export const getSearchBySid = (sid: string): Search | undefined => {
  if (!dbData[sid]) {
    return undefined;
  }
  return dbData[sid];
};

// const getNextRank = (): number => {
//   const ranks = Object.values(dbData)
//     .filter((search) => typeof search.rank === 'number')
//     .map((search) => search.rank);

//   const currentMax = ranks.reduce(
//     (element, max) => (element > max ? element : max),
//     0,
//   );

//   if (!currentMax || currentMax < 0) {
//     return 10;
//   }
//   return currentMax + 10;
// };

// export const createEmptySearch = () => {

// }

// export const addSearch = (search: Search): Result<boolean, string[]> => {
//   return isSearchValid(search.sid);
// };
