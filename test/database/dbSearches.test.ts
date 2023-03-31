import { jest } from '@jest/globals';
import 'jest-extended';
// import os from 'os';

jest.mock('../../src/api/jsonDb/lowdbDriver');

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
import * as dbSearchesTestData from './dataDbSearches/dbSearchesTestData';

// Some handy Jest spies.
const saveDataSpy = jest.spyOn(dbSearches, 'saveData');

const initializeJest = (): void => {
  jest.clearAllMocks();
};

describe('dbSearches initialization', () => {
  beforeEach(() => {
    initializeJest();
  });

  const doNegativeTest = (element: unknown, phraseInError: string): void => {
    const result = dbSearches.init(JSON.stringify(element));
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

  test.skip('initializes when no database file is present', () => {
    dbSearches.init('');

    expect(dbSearches.getValidEnabledSearches()).toBeEmpty();
    expect(saveDataSpy).toHaveBeenCalledTimes(0);
  });

  test('valid search', () => {
    const result = dbSearches.init(JSON.stringify(dbSearchesTestData.valid));
    expect(result.isOk()).toBeTrue();

    let search = dbSearches.getSearchBySid('5');
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
    doNegativeTest(dbSearchesTestData.sidMissing, 'has no element');
  });

  test('sid wrong type', () => {
    doNegativeTest(dbSearchesTestData.sidWrongType, 'not of type');
  });

  test('sid has no value', () => {
    doNegativeTest(dbSearchesTestData.sidHasNoValue, 'no value');
  });

  test('alias missing', () => {
    doNegativeTest(dbSearchesTestData.aliasMissing, 'has no element');
  });

  test('alias wrong type', () => {
    doNegativeTest(dbSearchesTestData.aliasWrongType, 'not of type');
  });

  test('alias has no value', () => {
    doNegativeTest(dbSearchesTestData.aliasHasNoValue, 'no value');
  });

  test('alias missing', () => {
    doNegativeTest(dbSearchesTestData.aliasMissing, 'has no element');
  });

  test('alias wrong type', () => {
    doNegativeTest(dbSearchesTestData.aliasWrongType, 'not of type');
  });

  test('alias has no value', () => {
    doNegativeTest(dbSearchesTestData.aliasHasNoValue, 'no value');
  });

  test('isEnabled missing', () => {
    doNegativeTest(dbSearchesTestData.isEnabledMissing, 'has no element');
  });

  test('isEnabled wrong type', () => {
    doNegativeTest(dbSearchesTestData.isEnabledWrongType, 'not of type');
  });
});

describe('dbSearches test suite', () => {
  beforeEach(() => {
    initializeJest();
  });

  test('fetch enabled searches', () => {
    const result = dbSearches.init(
      JSON.stringify(dbSearchesTestData.enabledSearches),
    );
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
    dbSearches.init(JSON.stringify(dbSearchesTestData.valid));
    const search = dbSearches.getSearchBySid('5');
    expect(search).toContainKeys(['sid', 'alias', 'isEnabled']);
    expect(search.sid).toBe('5');
  });

  test('not fetch search by invalid sid', () => {
    dbSearches.init(JSON.stringify(dbSearchesTestData.valid));
    const search = dbSearches.getSearchBySid('-9');
    expect(search).toBeUndefined();
  });
});
