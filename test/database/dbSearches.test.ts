import { jest } from '@jest/globals';
import 'jest-extended';

jest.mock('../../src/api/jsonDb/lowdbDriver');

import * as dbSearches from '../../src/database/dbSearches';

// Some handy Jest spies.
const saveDataSpy = jest.spyOn(dbSearches, 'saveData');

const initializeJest = (): void => {
  jest.clearAllMocks();
};

describe('dbSearches test suite', () => {
  beforeEach(() => {
    initializeJest();
  });

  test.skip('initializes when no database file is present', () => {
    dbSearches.init('no-such-file');

    expect(dbSearches.getSearches()).toBeEmpty();
    expect(saveDataSpy).toHaveBeenCalledTimes(0);
  });

  test('check basic search type', () => {
    dbSearches.init('searchesDb-1');

    expect(dbSearches.getSearches()).toContainKey('101');
    expect(saveDataSpy).toHaveBeenCalledTimes(0);
  });
});
