import { jest } from '@jest/globals';
import 'jest-extended';
import { SpiedFunction } from 'jest-mock';

import JsonDb from '../../src/api/jsonDb/lowdbDriver';
import { Searches } from '../../src/database/models/dbSearches';
import * as dbUserPrefs from '../../src/database/dbUserPrefs';
import * as dbSearches from '../../src/database/dbSearches';
import { UserPrefs } from '../../src/database/models/dbUserPrefs';

// TODO Add a test the fails if you reference a missing search

jest.mock('../../src/api/jsonDb/lowdbDriver');

let userPrefsDb = JsonDb<UserPrefs>();
let writeSpy: SpiedFunction<() => void>;

const searchesDb = JsonDb<Searches>();
const searchesDbData = {
  '1': {
    sid: '1',
    alias: 'KTM dirt bikes',
    isEnabled: true,
    rank: 85,
    sources: ['craigslist'],
    craigslistSearchDetails: {
      searchTerms: ['search1', 'search2'],
      regions: ['sf bayarea', 'inland empire'],
      subcategories: ['tools', 'motorcycles'],
    },
  },
};

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

    expect(dbUserPrefs.getUserPrefs()).toContainAllEntries([
      ['displayMinimalPostcards', false],
      ['isUndoing', false],
      ['searchPrefs', {}],
    ]);
    expect(writeSpy).toHaveBeenCalledTimes(1);
  });

  test('initializes database when file has no objects', () => {
    userPrefsDb.setCacheDir('{}');
    dbUserPrefs.init(userPrefsDb);

    expect(dbUserPrefs.getUserPrefs()).toContainAllEntries([
      ['displayMinimalPostcards', false],
      ['isUndoing', false],
      ['searchPrefs', {}],
    ]);
    expect(writeSpy).toHaveBeenCalledTimes(1);
  });

  test('valid userPref post should succeed', () => {
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
    };

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
      // isUndoing: false,
      displayMinimalPostcards: false,
      searchPrefs: {
        '1': {
          sid: '1',
          showInHeader: true,
          isSelected: true,
        },
      },
    };
    userPrefsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbUserPrefs.init(userPrefsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'userPrefs',
        'missing property',
        'isUndoing',
        'should be',
        'boolean',
      ]);
    }
  });

  test('userPrefs with incorrect type for isUndoing fails', () => {
    const initialFile = {
      isUndoing: -33,
      displayMinimalPostcards: false,
      searchPrefs: {
        '1': {
          sid: '1',
          showInHeader: true,
          isSelected: true,
        },
      },
    };
    userPrefsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbUserPrefs.init(userPrefsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'userPrefs',
        'property',
        'isUndoing',
        'incorrect type',
        'should be',
        'boolean',
      ]);
    }
  });

  test('userPrefs with missing displayMinimalPostcards fails', () => {
    const initialFile = {
      isUndoing: false,
      // displayMinimalPostcards: false,
      searchPrefs: {
        '1': {
          sid: '1',
          showInHeader: true,
          isSelected: true,
        },
      },
    };
    userPrefsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbUserPrefs.init(userPrefsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'userPrefs',
        'missing property',
        'displayMinimalPostcards',
        'should be',
        'boolean',
      ]);
    }
  });

  test('userPrefs with incorrect type for displayMinimalPostcards fails', () => {
    const initialFile = {
      isUndoing: false,
      displayMinimalPostcards: -33,
      searchPrefs: {
        '1': {
          sid: '1',
          showInHeader: true,
          isSelected: true,
        },
      },
    };
    userPrefsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbUserPrefs.init(userPrefsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'userPrefs',
        'property',
        'displayMinimalPostcards',
        '-33',
        'incorrect type',
        'should be',
        'boolean',
      ]);
    }
  });

  test('userPrefs with missing searchPrefs fails', () => {
    const initialFile = {
      isUndoing: false,
      displayMinimalPostcards: false,
      // searchPrefs: {
      //   '1': {
      //     sid: '1',
      //     showInHeader: true,
      //     isSelected: true,
      //   },
      // },
    };
    userPrefsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbUserPrefs.init(userPrefsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'userPrefs',
        'missing property',
        'searchPrefs',
        'should be',
        'object',
        'SearchPref',
      ]);
    }
  });

  test('userPrefs with incorrect type for searchPrefs fails', () => {
    const initialFile = {
      isUndoing: false,
      displayMinimalPostcards: false,
      searchPrefs: -33,
    };
    userPrefsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbUserPrefs.init(userPrefsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'userPrefs',
        'property',
        'searchPrefs',
        '-33',
        'incorrect type',
        'should be',
        'object',
        'SearchPref',
      ]);
    }
  });

  test('userPrefs searchPrefs with sid not matching its key fails', () => {
    const initialFile = {
      isUndoing: false,
      displayMinimalPostcards: false,
      searchPrefs: {
        '888': {
          sid: '444',
          showInHeader: true,
          isSelected: true,
        },
      },
    };
    userPrefsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbUserPrefs.init(userPrefsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'userPrefs.searchPrefs',
        'with key',
        '888',
        'does not match its sid',
        '444',
      ]);
    }
  });

  test('userPrefs with missing sid fails', () => {
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
    };
    userPrefsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbUserPrefs.init(userPrefsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'userPrefs.searchPrefs',
        'with key',
        '1',
        'not match',
        'blank',
      ]);
    }
  });

  test('userPrefs with incorrect type for sid fails', () => {
    const initialFile = {
      isUndoing: false,
      displayMinimalPostcards: false,
      searchPrefs: {
        '1': {
          sid: -33,
          showInHeader: true,
          isSelected: true,
        },
      },
    };
    userPrefsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbUserPrefs.init(userPrefsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'userPrefs.searchPrefs',
        'with key',
        '1',
        'not match',
        '-33',
      ]);
    }
  });

  test('userPrefs with empty string sid fails', () => {
    const initialFile = {
      isUndoing: false,
      displayMinimalPostcards: false,
      searchPrefs: {
        '1': {
          sid: '',
          showInHeader: true,
          isSelected: true,
        },
      },
    };
    userPrefsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbUserPrefs.init(userPrefsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'userPrefs.searchPrefs',
        'with key',
        '1',
        'not match',
        "''",
      ]);
    }
  });

  test('searchPrefs with missing showInHeader fails', () => {
    const initialFile = {
      isUndoing: false,
      displayMinimalPostcards: false,
      searchPrefs: {
        '1': {
          sid: '1',
          // showInHeader: true,
          isSelected: true,
        },
      },
    };
    userPrefsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbUserPrefs.init(userPrefsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        "userPrefs.searchPrefs['1']",
        'missing property',
        'showInHeader',
        'should be',
        'boolean',
      ]);
    }
  });

  test('searchPrefs with incorrect type for showInHeader fails', () => {
    const initialFile = {
      isUndoing: false,
      displayMinimalPostcards: false,
      searchPrefs: {
        '1': {
          sid: '1',
          showInHeader: -33,
          isSelected: true,
        },
      },
    };
    userPrefsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbUserPrefs.init(userPrefsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        "userPrefs.searchPrefs['1']",
        'property',
        'showInHeader',
        'incorrect type',
        'should be',
        'boolean',
      ]);
    }
  });

  test('searchPrefs with missing isSelected fails', () => {
    const initialFile = {
      isUndoing: false,
      displayMinimalPostcards: false,
      searchPrefs: {
        '1': {
          sid: '1',
          showInHeader: true,
          // isSelected: true,
        },
      },
    };
    userPrefsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbUserPrefs.init(userPrefsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        "userPrefs.searchPrefs['1']",
        'missing property',
        'isSelected',
        'should be',
        'boolean',
      ]);
    }
  });

  test('searchPrefs with incorrect type for isSelected fails', () => {
    const initialFile = {
      isUndoing: false,
      displayMinimalPostcards: false,
      searchPrefs: {
        '1': {
          sid: '1',
          showInHeader: true,
          isSelected: -33,
        },
      },
    };
    userPrefsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbUserPrefs.init(userPrefsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        "userPrefs.searchPrefs['1']",
        'property',
        'isSelected',
        'incorrect type',
        'should be',
        'boolean',
      ]);
    }
  });

  test("searchPrefs referencing search which doesn't exist fails", () => {
    const initialFile = {
      isUndoing: false,
      displayMinimalPostcards: false,
      searchPrefs: {
        '55': {
          sid: '55',
          showInHeader: true,
          isSelected: true,
        },
      },
    };
    userPrefsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbUserPrefs.init(userPrefsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        "userPrefs.searchPrefs['55']",
        'references',
        'search sid',
        "doesn't exist",
        '55',
      ]);
    }
  });
});
