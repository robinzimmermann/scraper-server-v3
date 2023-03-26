import { jest } from '@jest/globals';
import 'jest-extended';

jest.mock('../../src/api/jsonDb/lowdbDriver');

import * as dbSearches from '../../src/database/dbSearches';
import {
  CraigslistSubcategory,
  Search,
} from '../../src/database/models/dbSearches';
import { logger } from '../../src/utils/logger/logger';

// Some handy Jest spies.
const saveDataSpy = jest.spyOn(dbSearches, 'saveData');

const initializeJest = (): void => {
  jest.clearAllMocks();
};

describe('dbSearches test suite', () => {
  beforeEach(() => {
    initializeJest();
  });

  const doNegativeTest = (sid: string, phraseInError: string): void => {
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

  test.skip('initializes when no database file is present', () => {
    dbSearches.init('no-such-file');

    expect(dbSearches.getValidEnabledSearches()).toBeEmpty();
    expect(saveDataSpy).toHaveBeenCalledTimes(0);
  });

  test('valid search', () => {
    const errors: string[] = [];

    dbSearches.init('searchesDbValid');
    const sid = '5';

    const result = dbSearches.isSearchValid(sid);
    expect(result.isOk()).toBeTruthy();
    result.mapErr((errorMessages) =>
      errorMessages.forEach((msg) => errors.push(msg)),
    );
    errors.forEach((error) => logger.info(error));
    expect(errors).toHaveLength(0);
  });

  test('search is missing sid element', () => {
    const errors: string[] = [];

    dbSearches.init('searchesDbMissingSidElement');
    const sid = '21';

    const result = dbSearches.isSearchValid(sid);
    expect(result.isErr()).toBeTruthy();
    result.mapErr((errorMessages) =>
      errorMessages.forEach((msg) => errors.push(msg)),
    );
    errors.forEach((error) => logger.info(error));
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('exist');
  });

  test('search has empty sid', () => {
    const errors: string[] = [];

    dbSearches.init('searchesDbEmptySid');
    const sid = '22';

    const result = dbSearches.isSearchValid(sid);
    expect(result.isErr()).toBeTruthy();
    result.mapErr((errorMessages) =>
      errorMessages.forEach((msg) => errors.push(msg)),
    );
    errors.forEach((error) => logger.info(error));
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('containing');
  });

  test("search has sid element that doesn't match parent", () => {
    dbSearches.init('searchesDbSidElementDoesntMatch');
    doNegativeTest('23', 'match');
  });

  test('search element missing alias', () => {
    dbSearches.init('searchesDbMissingAlias');
    doNegativeTest('25', 'alias');
  });

  test('search element has empty alias', () => {
    dbSearches.init('searchesDbEmptyAlias');
    doNegativeTest('26', 'alias');
  });

  test('search element wrong type alias', () => {
    dbSearches.init('searchesDWrongTypeAlias');
    doNegativeTest('27', 'type');
  });
});
