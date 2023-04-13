import { jest } from '@jest/globals';
import 'jest-extended';
// import os from 'os';
import JsonDb from '../../src/api/jsonDb/lowdbDriver';
import { Searches } from '../../src/database/models/dbSearches';

import * as dbSearches from '../../src/database/dbSearches';
import {
  CraigslistRegion,
  CraigslistSearchDetails,
  CraigslistSubcategory,
  FacebookRegion,
  FacebookSearchDetails,
  Source,
} from '../../src/database/models/dbSearches';
import { logger } from '../../src/utils/logger/logger';
import * as dbSearchesTestData from './testData/dbSearchesTestData';
import { SpiedFunction } from 'jest-mock';
// import { JsonDb } from '../../src/api/jsonDb/JsonDb';

jest.mock('../../src/api/jsonDb/lowdbDriver');

let searchesDb = JsonDb<Searches>();
let writeSpy: SpiedFunction<() => void>;

const initializeJest = (): void => {
  jest.clearAllMocks();
  searchesDb = JsonDb<Searches>();
  writeSpy = jest.spyOn(searchesDb, 'write');
};

describe('dbSearches initialization', () => {
  beforeEach(() => {
    initializeJest();
  });

  // const doNegativeTest = (element: unknown, phraseInError: string): void => {
  const doNegativeTest = (element: Searches, phraseInError: string): void => {
    const jsonDb = JsonDb<Searches>();
    jsonDb.setCacheDir(JSON.stringify(element));
    const result = dbSearches.init(jsonDb);
    const negErrors: string[] = [];
    expect(result.isOk()).toBeFalse();
    expect(result.isErr()).toBeTrue();
    result.mapErr((errorMessages) =>
      errorMessages.forEach((msg) => negErrors.push(msg)),
    );
    negErrors.forEach((error) => logger.info(error));
    expect(negErrors).toHaveLength(1);
    expect(negErrors[0]).toContain(phraseInError);
  };

  test('initializes when no database file is present', () => {
    searchesDb.setCacheDir('');
    dbSearches.init(searchesDb);

    expect(dbSearches.getValidEnabledSearches()).toBeEmpty();
    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('valid search', () => {
    searchesDb.setCacheDir(JSON.stringify(dbSearchesTestData.valid));
    const result = dbSearches.init(searchesDb);

    // const result = dbSearches.init(JSON.stringify(dbSearchesTestData.valid));
    expect(result.isOk()).toBeTrue();

    expect(writeSpy).toHaveBeenCalledTimes(0);

    let search = dbSearches.getSearchBySid('5');
    // This if is only here to satisfy typescript
    if (!search) {
      expect(search).toBeDefined();
      return;
    }
    expect(search.sid).toBe('5');
    expect(search.isEnabled).toBeBoolean();
    expect(typeof search.rank).toBe('number');
    expect(search.sources).toIncludeSameMembers([Source.craigslist]);
    let searchDetails:
      | CraigslistSearchDetails
      | FacebookSearchDetails
      | undefined = search.craigslistSearchDetails;
    expect(searchDetails).toBeObject();
    expect(searchDetails).toContainAllKeys([
      'searchTerms',
      'regions',
      'craigslistSubcategories',
    ]);
    expect(searchDetails?.searchTerms).toBeArrayOfSize(2);
    expect(searchDetails?.regions).toBeArrayOfSize(2);
    expect(searchDetails?.regions).toIncludeSameMembers([
      CraigslistRegion.sfBayArea,
      CraigslistRegion.inlandEmpire,
    ]);
    expect(searchDetails?.craigslistSubcategories).toIncludeSameMembers([
      CraigslistSubcategory.motorcycles,
      CraigslistSubcategory.tools,
    ]);
    searchDetails = search.facebookSearchDetails;
    expect(searchDetails).toBeFalsy();

    search = dbSearches.getSearchBySid('6');
    // This if is only here to satisfy typescript
    if (!search) {
      expect(search).toBeDefined();
      return;
    }
    expect(search.sources).toIncludeSameMembers([Source.facebook]);
    searchDetails = search.craigslistSearchDetails;
    expect(searchDetails).toBeFalsy();
    searchDetails = search.facebookSearchDetails;
    expect(searchDetails).toBeObject();
    expect(searchDetails).toContainAllKeys(['searchTerms', 'regionalDetails']);
    expect(searchDetails?.searchTerms).toBeArrayOfSize(2);
    expect(searchDetails?.regionalDetails).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ region: FacebookRegion.reno }),
        expect.objectContaining({ region: FacebookRegion.telluride }),
      ]),
    );

    search = dbSearches.getSearchBySid('7');
    // This if is only here to satisfy typescript
    if (!search) {
      expect(search).toBeDefined();
      return;
    }
    expect(search.sources).toIncludeSameMembers([
      Source.craigslist,
      Source.facebook,
    ]);
    searchDetails = search.craigslistSearchDetails;
    expect(searchDetails).toBeObject();
    expect(searchDetails).toContainAllKeys([
      'searchTerms',
      'regions',
      'craigslistSubcategories',
    ]);
    expect(searchDetails?.searchTerms).toBeArrayOfSize(2);
    expect(searchDetails?.regions).toIncludeSameMembers([
      CraigslistRegion.sfBayArea,
      CraigslistRegion.inlandEmpire,
    ]);
    expect(searchDetails?.craigslistSubcategories).toIncludeSameMembers([
      CraigslistSubcategory.motorcycles,
      CraigslistSubcategory.tools,
    ]);
    searchDetails = search.facebookSearchDetails;
    expect(searchDetails).toBeObject();
    expect(searchDetails).toContainAllKeys(['searchTerms', 'regionalDetails']);
    expect(searchDetails?.searchTerms).toBeArrayOfSize(2);
    expect(searchDetails?.regionalDetails).toBeArrayOfSize(2);
    expect(searchDetails?.regionalDetails).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ region: FacebookRegion.reno }),
        expect.objectContaining({ region: FacebookRegion.telluride }),
      ]),
    );
  });

  test('sid missing', () => {
    doNegativeTest(
      dbSearchesTestData.sidMissing as unknown as Searches,
      'has no element',
    );
  });

  test('sid wrong type', () => {
    doNegativeTest(
      dbSearchesTestData.sidWrongType as unknown as Searches,
      'not of type',
    );
  });

  test('sid has no value', () => {
    doNegativeTest(
      dbSearchesTestData.sidHasNoValue as unknown as Searches,
      'no value',
    );
  });

  test('alias missing', () => {
    doNegativeTest(
      dbSearchesTestData.aliasMissing as unknown as Searches,
      'has no element',
    );
  });

  test('alias wrong type', () => {
    doNegativeTest(
      dbSearchesTestData.aliasWrongType as unknown as Searches,
      'not of type',
    );
  });

  test('alias has no value', () => {
    doNegativeTest(
      dbSearchesTestData.aliasHasNoValue as unknown as Searches,
      'no value',
    );
  });

  test('alias missing', () => {
    doNegativeTest(
      dbSearchesTestData.aliasMissing as unknown as Searches,
      'has no element',
    );
  });

  test('alias wrong type', () => {
    doNegativeTest(
      dbSearchesTestData.aliasWrongType as unknown as Searches,
      'not of type',
    );
  });

  test('alias has no value', () => {
    doNegativeTest(
      dbSearchesTestData.aliasHasNoValue as unknown as Searches,
      'no value',
    );
  });

  test('isEnabled missing', () => {
    doNegativeTest(
      dbSearchesTestData.isEnabledMissing as unknown as Searches,
      'has no element',
    );
  });

  test('isEnabled wrong type', () => {
    doNegativeTest(
      dbSearchesTestData.isEnabledWrongType as unknown as Searches,
      'not of type',
    );
  });
});

describe('dbSearches test suite', () => {
  beforeEach(() => {
    initializeJest();
  });

  test('fetch enabled searches', () => {
    searchesDb.setCacheDir(JSON.stringify(dbSearchesTestData.enabledSearches));

    const result = dbSearches.init(searchesDb);
    result.mapErr((errorMessages) =>
      errorMessages.forEach((msg) => logger.debug(msg)),
    );
    const searches = dbSearches.getValidEnabledSearches();
    expect(searches).toBeArrayOfSize(2);
    // Correct order:
    expect(searches[0]).toEqual(expect.objectContaining({ sid: '61' }));
    expect(searches[1]).toEqual(expect.objectContaining({ sid: '60' }));
  });

  test('fetch search by sid', () => {
    searchesDb.setCacheDir(JSON.stringify(dbSearchesTestData.valid));

    dbSearches.init(searchesDb);
    const search = dbSearches.getSearchBySid('5');
    // This if is only here to satisfy typescript
    if (!search) {
      expect(search).toBeDefined();
      return;
    }
    expect(search).toContainKeys(['sid', 'alias', 'isEnabled']);
    expect(search.sid).toBe('5');
  });

  test('not fetch search by invalid sid', () => {
    searchesDb.setCacheDir(JSON.stringify(dbSearchesTestData.valid));

    dbSearches.init(searchesDb);
    const search = dbSearches.getSearchBySid('-9');
    expect(search).toBeUndefined();
  });
});
