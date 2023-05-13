import { err, ok, Result } from 'neverthrow';
import chalk from 'chalk';

import {
  type Search,
  Searches,
  Source,
  CraigslistRegion,
  CraigslistSubcategory,
  FacebookRegion,
  FacebookRadius,
} from './models/dbSearches';
import { JsonDb } from '../api/jsonDb/JsonDb';
// import jsonDb from '../api/jsonDb/lowdbDriver';
import {
  DbLogger,
  appendErrors,
  PropertyType,
  PropertyPresence,
  appendError,
  checkProp,
  checkForExtraProps,
} from './utils';
import { getDateTimestamp } from '../utils/utils';
import { rankComparator } from '../utils/sorters/searches';

export type Database = Searches;

let searchesDb: JsonDb<Database>;
let dbData: Database;

const dbLoggerPrefix = '[dbSearches]';
const dbLogger = DbLogger(dbLoggerPrefix);

export const init = (jsonDb: JsonDb<Database>): Result<boolean, string[]> => {
  dbLogger.info('initializing');

  searchesDb = jsonDb;
  dbData = searchesDb.read();

  const result = isDbValid();

  return result;
};

const isCraigslistSearchDetailsValid = (search: Search): Result<boolean, string[]> => {
  const errors: string[] = [];

  const parent = search.craigslistSearchDetails;
  if (!parent) {
    return err(['this parent should be here, abort!']);
  }

  const errorPrefix = chalk.bold(`search ${search.sid} craigslistSearchDetails`);

  appendError(
    errors,
    checkProp(parent, 'searchTerms', PropertyType.array, PropertyPresence.mandatory, errorPrefix, {
      arrayElementsExpectedType: PropertyType.string,
    }),
  );

  appendError(
    errors,
    checkProp(parent, 'regions', PropertyType.array, PropertyPresence.mandatory, errorPrefix, {
      arrayElementsExpectedType: PropertyType.enum,
      arrayElementsExpectedEnum: CraigslistRegion,
      arrayElementsExpectedEnumName: 'CraigslistRegion',
    }),
  );

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

  appendErrors(
    errors,
    checkForExtraProps(parent, ['searchTerms', 'regions', 'subcategories'], errorPrefix),
  );

  if (errors.length === 0) {
    return ok(true);
  } else {
    return err(errors);
  }
};

/**
 * If we got here, we know that regionalDetails is an array and it has values. This function checks
 * that the values are valid.
 */
const isFacebookSearchRegionalDetailsValid = (search: Search): Result<boolean, string[]> => {
  const errors: string[] = [];

  if (!search.facebookSearchDetails) {
    return err(['Yet another Typescript check that can never happen']);
  }
  const parent = search.facebookSearchDetails.regionalDetails;

  const errorPrefix = chalk.bold(`search ${search.sid} facebookSearchDetails.regionalDetails`);

  parent?.forEach((regionalDetail) => {
    appendError(
      errors,
      checkProp(
        regionalDetail,
        'region',
        PropertyType.enum,
        PropertyPresence.mandatory,
        errorPrefix,
        {
          expectedEnum: FacebookRegion,
          expectedEnumName: 'FacebookRegion',
        },
      ),
    );

    appendError(
      errors,
      checkProp(
        regionalDetail,
        'distance',
        PropertyType.enum,
        PropertyPresence.mandatory,
        errorPrefix,
        {
          expectedEnum: FacebookRadius,
          expectedEnumName: 'FacebookRadius',
        },
      ),
    );

    appendErrors(errors, checkForExtraProps(regionalDetail, ['region', 'distance'], errorPrefix));
  });

  if (errors.length === 0) {
    return ok(true);
  } else {
    return err(errors);
  }
};

const isFacebookSearchDetailsValid = (search: Search): Result<boolean, string[]> => {
  const errors: string[] = [];

  const parent = search.facebookSearchDetails;
  if (!parent) {
    return err(['this parent should be here, abort!']);
  }

  const errorPrefix = chalk.bold(`search ${search.sid} facebookSearchDetails`);

  appendError(
    errors,
    checkProp(parent, 'searchTerms', PropertyType.array, PropertyPresence.mandatory, errorPrefix, {
      arrayElementsExpectedType: PropertyType.string,
    }),
  );

  const regionalDetailsResults = checkProp(
    parent,
    'regionalDetails',
    PropertyType.array,
    PropertyPresence.mandatory,
    errorPrefix,
    {
      arrayElementsExpectedType: PropertyType.object,
    },
  );

  appendErrors(errors, checkForExtraProps(parent, ['searchTerms', 'regionalDetails'], errorPrefix));

  if (regionalDetailsResults.isOk()) {
    // prop is good so far, drill down to next object.
    appendErrors(errors, isFacebookSearchRegionalDetailsValid(search));
  } else {
    appendError(errors, regionalDetailsResults);
  }

  if (errors.length === 0) {
    return ok(true);
  } else {
    return err(errors);
  }
};

/**
 * Tells whether the given search is valid or not. In invalid search is one where this is a problem,
 * such as a missing field.
 */
const isSearchValid = (key: string, search: Search): Result<boolean, string[]> => {
  const errors: string[] = [];

  // First make sure the parent key and primary key are valid so future errors can be referenced correctly

  if (!key) {
    errors.push(`there is a search with an invalid key`);
  } else {
    const propPresent = checkProp(
      search,
      'sid',
      PropertyType.string,
      PropertyPresence.mandatory,
      chalk.bold('search'),
    );
    if (propPresent.isOk()) {
      if (search.sid !== key) {
        errors.push(
          `${chalk.bold('search')} with key [${chalk.bold(
            key,
          )}] does not match its sid: [${chalk.bold(search.sid)}]`,
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

  const errorPrefix = chalk.bold(`search ${search.sid}`);

  appendError(
    errors,
    checkProp(search, 'alias', PropertyType.string, PropertyPresence.mandatory, errorPrefix),
  );

  appendError(
    errors,
    checkProp(search, 'isEnabled', PropertyType.boolean, PropertyPresence.mandatory, errorPrefix),
  );

  appendError(
    errors,
    checkProp(search, 'rank', PropertyType.number, PropertyPresence.mandatory, errorPrefix),
  );

  appendError(
    errors,
    checkProp(search, 'minPrice', PropertyType.number, PropertyPresence.optional, errorPrefix),
  );

  appendError(
    errors,
    checkProp(search, 'maxPrice', PropertyType.number, PropertyPresence.optional, errorPrefix),
  );

  // If both minPrice and maxPrice are present, make sure minPrice is lower than maxPrice
  if (search.minPrice !== undefined && search.maxPrice !== undefined) {
    if (search.minPrice > search.maxPrice) {
      errors.push(
        `${errorPrefix} has ${chalk.bold('minPrice')} (${chalk.bold(
          search.minPrice,
        )}) larger than ${chalk.bold('maxPrice')} (${chalk.bold(search.maxPrice)})`,
      );
    }
  }

  const sourcesResult = checkProp(
    search,
    'sources',
    PropertyType.array,
    PropertyPresence.mandatory,
    errorPrefix,
    {
      arrayElementsExpectedType: PropertyType.enum,
      arrayElementsExpectedEnum: Source,
      arrayElementsExpectedEnumName: 'Source',
    },
  );
  appendError(errors, sourcesResult);

  if (sourcesResult.isOk()) {
    const pushUnneeded = (arrayItemName: string, propName: string): void => {
      errors.push(
        `${errorPrefix} has property ${chalk.bold(propName)}, but it doesn't contain '${chalk.bold(
          arrayItemName,
        )}'`,
      );
    };

    if (search.sources.includes(Source.craigslist)) {
      // If craigslist is the source, make sure there is an craigslistSeachDetails
      const craigslistSearchDetailsResult = checkProp(
        search,
        'craigslistSearchDetails',
        PropertyType.object,
        PropertyPresence.mandatory,
        errorPrefix,
        {
          expectedObjectName: 'CraigslistSearchDetails',
        },
      );

      if (craigslistSearchDetailsResult.isOk()) {
        // The prop is present, now drill into the object and validate it
        appendErrors(errors, isCraigslistSearchDetailsValid(search));
      } else {
        appendError(errors, craigslistSearchDetailsResult);
      }
    } else {
      // If source does not contain craigslist, then there should not be an associated craigslistSeachDetails
      if (search.craigslistSearchDetails !== undefined) {
        pushUnneeded(Source.craigslist, 'sources');
      }
    }

    // If facebook is the source, make sure there is an facebookSeachDetails
    if (search.sources.includes(Source.facebook)) {
      const facebookSearchDetailsResult = checkProp(
        search,
        'facebookSearchDetails',
        PropertyType.object,
        PropertyPresence.mandatory,
        errorPrefix,
        {
          expectedObjectName: 'FacebookSearchDetails',
        },
      );

      if (facebookSearchDetailsResult.isOk()) {
        // The prop is present, now drill into the object and validate it
        appendErrors(errors, isFacebookSearchDetailsValid(search));
      } else {
        appendError(errors, facebookSearchDetailsResult);
      }
    } else {
      // If source does not contain facebook, then there should not be an associated facebookSeachDetails
      if (search.facebookSearchDetails !== undefined) {
        pushUnneeded(Source.facebook, 'sources');
      }
    }
  }

  appendError(
    errors,
    checkProp(search, 'log', PropertyType.array, PropertyPresence.optional, errorPrefix, {
      arrayElementsExpectedType: PropertyType.string,
    }),
  );

  appendErrors(
    errors,
    checkForExtraProps(
      search,
      [
        'sid',
        'alias',
        'isEnabled',
        'rank',
        'sources',
        'craigslistSearchDetails',
        'facebookSearchDetails',
        'minPrice',
        'maxPrice',
        'log',
      ],
      errorPrefix,
    ),
  );

  if (errors.length === 0) {
    return ok(true);
  } else {
    return err(errors);
  }
};

const isDbValid = (): Result<boolean, string[]> => {
  const errors: string[] = [];

  Object.keys(dbData).forEach((sid) => {
    const search = dbData[sid];
    const result = isSearchValid(sid, search);
    if (result.isOk()) {
      // All good, nothing to do
    } else {
      appendErrors(errors, result);
    }
  });

  if (errors.length === 0) {
    return ok(true);
  } else {
    return err(errors);
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
  searchesDb.write();
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
      const result = isSearchValid(sid, dbData[sid]);
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
