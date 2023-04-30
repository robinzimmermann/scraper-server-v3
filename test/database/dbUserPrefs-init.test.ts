import { jest } from '@jest/globals';
import 'jest-extended';
import { SpiedFunction } from 'jest-mock';

import JsonDb from '../../src/api/jsonDb/lowdbDriver';
import { Searches } from '../../src/database/models/dbSearches';
import * as dbUserPrefs from '../../src/database/dbUserPrefs';
import * as dbUserPrefsTestData from './testData/dbPostsTestData';
import * as dbSearches from '../../src/database/dbSearches';
import { UserPrefs } from '../../src/database/models/dbUserPrefs';

jest.mock('../../src/api/jsonDb/lowdbDriver');

let userPrefsDb = JsonDb<UserPrefs>();
let writeSpy: SpiedFunction<() => void>;

const searchesDb = JsonDb<Searches>();
const searchesDbData = dbUserPrefsTestData.initialSearches;

const initializeJest = (): void => {
  jest.clearAllMocks();
  userPrefsDb = JsonDb<UserPrefs>();
  writeSpy = jest.spyOn(userPrefsDb, 'write');
};

describe('dbUserPrefs initialization', () => {
  beforeAll(() => {
    searchesDb.setCacheDir(JSON.stringify(searchesDbData));
    const result = dbSearches.init(searchesDb);
    expect(result.isOk()).toBeTrue();
  });

  beforeEach(() => {
    initializeJest();
  });

  test('initializes when no database file is present', () => {
    userPrefsDb.setCacheDir('');
    dbUserPrefs.init(userPrefsDb);

    expect(dbUserPrefs.getUserPrefs()).toBeEmpty();
    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('initializes database when file has no objects', () => {
    userPrefsDb.setCacheDir('{}');
    dbUserPrefs.init(userPrefsDb);

    expect(dbUserPrefs.getUserPrefs()).toBeEmpty();
    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('valid userPref post should work', () => {
    const initialFile = {
      isUndoing: false,
      displayMinimalPostcards: false,
      searchPrefs: {
        '1': {
          sid: '1',
          showInHeader: true,
          isSelected: true,
        },
      },
    } as unknown as UserPrefs;

    userPrefsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbUserPrefs.init(userPrefsDb);

    expect(result.isOk()).toBeTrue();

    expect(writeSpy).toHaveBeenCalledTimes(0);

    const userPrefs = dbUserPrefs.getUserPrefs();

    expect(userPrefs).toBeObject();
    expect(userPrefs).toContainAllKeys(['isUndoing', 'displayMinimalPostcards', 'searchPrefs']);

    expect(userPrefs.displayMinimalPostcards).toBe(false);

    const searchPrefs = userPrefs['searchPrefs'];

    expect(searchPrefs).toBeObject();
    expect(searchPrefs).toContainAllKeys(['1']);

    const searchPref = searchPrefs['1'];

    expect(searchPref).toBeObject();
    expect(searchPref).toContainAllKeys(['sid', 'showInHeader', 'isSelected']);

    expect(searchPref['sid']).toBe('1');
    expect(searchPref['showInHeader']).toBe(true);
    expect(searchPref['isSelected']).toBe(true);
  });

  test('userPrefs with missing isUndoing fails', () => {
    const initialFile = {
      displayMinimalPostcards: false,
      searchPrefs: {
        '1': {
          sid: '1',
          showInHeader: true,
          isSelected: true,
        },
      },
    } as unknown as UserPrefs;

    userPrefsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbUserPrefs.init(userPrefsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple(['userPrefs', 'has no element', 'isUndoing']);
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('userPrefs with incorrect type for isUndoing fails', () => {
    const initialFile = {
      isUndoing: 'wrong',
      displayMinimalPostcards: false,
      searchPrefs: {
        '1': {
          sid: '1',
          showInHeader: true,
          isSelected: true,
        },
      },
    } as unknown as UserPrefs;

    userPrefsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbUserPrefs.init(userPrefsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'userPrefs',
        'element that is not',
        'isUndoing',
        'boolean',
      ]);
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('userPrefs with missing displayMinimalPostcards fails', () => {
    const initialFile = {
      isUndoing: false,
      searchPrefs: {
        '1': {
          sid: '1',
          showInHeader: true,
          isSelected: true,
        },
      },
    } as unknown as UserPrefs;

    userPrefsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbUserPrefs.init(userPrefsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'userPrefs',
        'has no element',
        'displayMinimalPostcards',
      ]);
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('userPrefs with incorrect type for displayMinimalPostcards fails', () => {
    const initialFile = {
      isUndoing: false,
      displayMinimalPostcards: 'bad',
      searchPrefs: {
        '1': {
          sid: '1',
          showInHeader: true,
          isSelected: true,
        },
      },
    } as unknown as UserPrefs;

    userPrefsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbUserPrefs.init(userPrefsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'userPrefs',
        'element that is not',
        'displayMinimalPostcards',
        'boolean',
      ]);
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('userPrefs with empty searchPrefs works', () => {
    const initialFile = {
      isUndoing: false,
      displayMinimalPostcards: false,
      searchPrefs: {},
    } as unknown as UserPrefs;

    userPrefsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbUserPrefs.init(userPrefsDb);

    expect(result.isOk()).toBeTrue();

    expect(writeSpy).toHaveBeenCalledTimes(0);

    const userPrefs = dbUserPrefs.getUserPrefs();

    const searchPrefs = userPrefs['searchPrefs'];

    expect(searchPrefs).toBeEmptyObject();
  });

  test('userPrefs with missing searchPrefs fails', () => {
    const initialFile = {
      isUndoing: false,
      displayMinimalPostcards: false,
    } as unknown as UserPrefs;

    userPrefsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbUserPrefs.init(userPrefsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple(['userPrefs', 'has no element', 'searchPrefs']);
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('userPrefs with incorrect type for searchPrefs fails', () => {
    const initialFile = {
      isUndoing: false,
      displayMinimalPostcards: false,
      searchPrefs: 'dummy',
    } as unknown as UserPrefs;

    userPrefsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbUserPrefs.init(userPrefsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'userPrefs',
        'element that is not',
        'searchPrefs',
        'object',
      ]);
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('userPrefs with missing searchPrefs.sid fails', () => {
    const initialFile = {
      isUndoing: false,
      displayMinimalPostcards: false,
      searchPrefs: {
        '1': {
          // sid: '1',
          showInHeader: true,
          isSelected: true,
        },
      },
    } as unknown as UserPrefs;

    userPrefsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbUserPrefs.init(userPrefsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'userPrefs.searchPrefs.1',
        'has no element',
        'sid',
      ]);
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });
});
