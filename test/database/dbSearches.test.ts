import { jest } from '@jest/globals';
import 'jest-extended';

jest.mock('../../src/api/jsonDb/lowdbDriver');

import * as dbSearches from '../../src/database/dbSearches';
import { logger } from '../../src/utils/logger/logger';
import * as searchersDbMock from '../../src/api/jsonDb/__mocks__/data/searchesDb-data';

// Some handy Jest spies.
const saveDataSpy = jest.spyOn(dbSearches, 'saveData');

const initializeJest = (): void => {
  jest.clearAllMocks();
};

describe('dbSearches test suite', () => {
  beforeEach(() => {
    initializeJest();
  });

  const doNegativeTest = (
    element: unknown,
    sid: string,
    phraseInError: string,
  ): void => {
    dbSearches.init(JSON.stringify(element));
    const result = dbSearches.isSearchValid(sid);
    const negErrors: string[] = [];
    expect(result.isErr()).toBeTruthy();
    result.mapErr((errorMessages) =>
      errorMessages.forEach((msg) => negErrors.push(msg)),
    );
    negErrors.forEach((error) => logger.info(error));
    expect(negErrors).toHaveLength(1);
    expect(negErrors[0]).toContain(phraseInError);
  };

  test('initializes when no database file is present', () => {
    dbSearches.init('');

    expect(dbSearches.getValidEnabledSearches()).toBeEmpty();
    expect(saveDataSpy).toHaveBeenCalledTimes(0);
  });

  test('valid search', () => {
    const errors: string[] = [];

    dbSearches.init(JSON.stringify(searchersDbMock.searchesDbValid));
    const sid = '5';

    const result = dbSearches.isSearchValid(sid);
    expect(result.isOk()).toBeTruthy();
    result.mapErr((errorMessages) =>
      errorMessages.forEach((msg) => errors.push(msg)),
    );
    errors.forEach((error) => logger.info(error));
    expect(errors).toHaveLength(0);
  });

  test("search has sid element that doesn't match parent", () => {
    doNegativeTest(
      searchersDbMock.searchesDbSidElementDoesntMatch,
      '9',
      'match',
    );
  });

  test('search is missing sid', () => {
    doNegativeTest(searchersDbMock.searchesDbMissingSid, '21', 'exist');
  });

  test('search missing alias', () => {
    doNegativeTest(searchersDbMock.searchesDbMissingAlias, '25', 'has no');
  });

  test('search element wrong type alias', () => {
    doNegativeTest(searchersDbMock.searchesDbWrongTypeAlias, '26', 'type');
  });

  test('search has empty alias', () => {
    doNegativeTest(searchersDbMock.searchesDbEmptyAlias, '27', 'has no');
  });

  test('search missing isEnabled', () => {
    doNegativeTest(searchersDbMock.searchesDbMissingIsEnabled, '30', 'has no');
  });

  test('search element wrong type isEnabled', () => {
    doNegativeTest(searchersDbMock.searchesDbWrongTypeIsEnabled, '31', 'type');
  });

  test('search missing rank', () => {
    doNegativeTest(searchersDbMock.searchesDbMissingRank, '35', 'has no');
  });

  test('search element wrong type rank', () => {
    doNegativeTest(searchersDbMock.searchesDbWrongTypeRank, '36', 'type');
  });

  // test('search missing sources', () => {
  //   doNegativeTest(searchersDbMock.searchesDbMissingSources, '40', 'has no');
  // });

  // test('search invalid sources', () => {
  //   doNegativeTest(searchersDbMock.searchesDbInvalidSources, '41', 'has no');
  // });

  // Missing source
  // Each source should be valid
  // Should be an array of strings
  // Should not be empty
  // For each source, there should be a details

  // Should not have a details section if there is no corresponding source for it
});
