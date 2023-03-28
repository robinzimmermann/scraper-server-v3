import { jest } from '@jest/globals';
import 'jest-extended';
// import os from 'os';

jest.mock('../../src/api/jsonDb/lowdbDriver');

import * as dbSearches from '../../src/database/dbSearches';
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

  test('valid search', () => {
    const result = dbSearches.init(JSON.stringify(dbSearchesTestData.valid));
    expect(result.isOk()).toBeTrue();
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
});

describe('dbSearches test suite', () => {
  beforeEach(() => {
    initializeJest();
  });

  test.skip('initializes when no database file is present', () => {
    dbSearches.init('');

    expect(dbSearches.getValidEnabledSearches()).toBeEmpty();
    expect(saveDataSpy).toHaveBeenCalledTimes(0);
  });

  test('fetch enabled searches', () => {
    const result = dbSearches.init(
      JSON.stringify(dbSearchesTestData.enabledSearches),
    );
    result.mapErr((errorMessages) =>
      errorMessages.forEach((msg) => logger.debug(msg)),
    );
    const searches = dbSearches.getValidEnabledSearches();
    logger.debug(`the result: ${Object.keys(searches).join(', ')}`);
    expect(searches).toContainAllKeys(['60', '61']);
  });
});
