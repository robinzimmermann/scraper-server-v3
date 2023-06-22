import { jest } from '@jest/globals';
import 'jest-extended';

import JsonDb from '../../src/api/jsonDb/lowdbDriver';
import {
  CraigslistRegion,
  CraigslistSubcategory,
  Search,
  Searches,
  Source,
} from '../../src/database/models/dbSearches';

import * as dbSearches from '../../src/database/dbSearches';
// import * as dbSearchesTestData from './testData/dbSearchesTestData';
import { SpiedFunction } from 'jest-mock';

jest.mock('../../src/api/jsonDb/lowdbDriver');

let searchesDb = JsonDb<Searches>();
let writeSpy: SpiedFunction<() => void>;

const initializeEmptyJest = (): void => {
  jest.clearAllMocks();
  searchesDb = JsonDb<Searches>();
  searchesDb.setCacheDir('');
  dbSearches.init(searchesDb);
  writeSpy = jest.spyOn(searchesDb, 'write');
};

const initializeJest = (): void => {
  jest.clearAllMocks();
  searchesDb = JsonDb<Searches>();

  const baseSearches = <Searches>{
    '401': {
      sid: '401',
      alias: 'demo hammer',
      isEnabled: true,
      rank: 50,
      sources: ['craigslist', 'facebook'],
      craigslistSearchDetails: {
        searchTerms: ['demo hammer', 'jackhammer'],
        regions: ['sf bayarea', 'reno'],
        subcategories: ['tools'],
      },
      facebookSearchDetails: {
        searchTerms: ['demo hammer'],
        regionalDetails: [
          {
            region: 'walnut creek',
            distance: '20 miles',
          },
        ],
      },
    },
  };

  searchesDb.setCacheDir(JSON.stringify(baseSearches));
  dbSearches.init(searchesDb);
  writeSpy = jest.spyOn(searchesDb, 'write');
};

describe('dbSearches regular stuff, with empty db', () => {
  beforeEach(() => {
    initializeEmptyJest();
  });

  test('adding a search works', () => {
    const result = dbSearches.add(<Search>{
      alias: 'search-1',
      isEnabled: true,
      rank: 50,
      sources: [Source.craigslist],
      craigslistSearchDetails: {
        searchTerms: ['demo hammer'],
        regions: [CraigslistRegion.merced],
        subcategories: [CraigslistSubcategory.tools],
      },
      log: ['first'],
    });

    expect(result.isOk()).toBeTrue();
    expect(writeSpy).toHaveBeenCalledTimes(1);

    if (result.isOk()) {
      // Check the return value
      const search = result.value;
      expect(search).toBeObject();
      expect(search).toContainAllKeys([
        'sid',
        'alias',
        'isEnabled',
        'rank',
        'sources',
        'craigslistSearchDetails',
        'log',
      ]);
      expect(search).toContainEntries([
        ['sid', '1'],
        ['alias', 'search-1'],
        ['isEnabled', true],
        ['sources', ['craigslist']],
        ['log', ['first']],
      ]);
      expect(search.craigslistSearchDetails).toContainAllEntries([
        ['searchTerms', ['demo hammer']],
        ['regions', ['merced']],
        ['subcategories', ['tools']],
      ]);
    }

    // Independently check the search was created
    const search = dbSearches.getSearchBySid('1');
    expect(search).toBeObject();
    expect(search).toContainEntries([['sid', '1']]);
  });

  test('adding a second search works', () => {
    dbSearches.add(<Search>{
      alias: 'search-1',
      isEnabled: true,
      rank: 50,
      sources: [Source.craigslist],
      craigslistSearchDetails: {
        searchTerms: ['demo hammer'],
        regions: [CraigslistRegion.merced],
        subcategories: [CraigslistSubcategory.tools],
      },
      log: ['first'],
    });

    const result = dbSearches.add(<Search>{
      alias: 'search-2',
      isEnabled: true,
      rank: 60,
      sources: [Source.craigslist],
      craigslistSearchDetails: {
        searchTerms: ['pc desk'],
        regions: [CraigslistRegion.reno],
        subcategories: [CraigslistSubcategory.computers],
      },
      log: ['first'],
    });

    expect(result.isOk()).toBeTrue();
    expect(writeSpy).toHaveBeenCalledTimes(2);

    if (result.isOk()) {
      // Check the return value
      const search = result.value;
      expect(search).toBeObject();
      expect(search).toContainAllKeys([
        'sid',
        'alias',
        'isEnabled',
        'rank',
        'sources',
        'craigslistSearchDetails',
        'log',
      ]);
      expect(search).toContainEntries([
        ['sid', '2'],
        ['alias', 'search-2'],
        ['isEnabled', true],
        ['sources', ['craigslist']],
        ['log', ['first']],
      ]);
      expect(search.craigslistSearchDetails).toContainAllEntries([
        ['searchTerms', ['pc desk']],
        ['regions', ['reno']],
        ['subcategories', ['computers']],
      ]);
    }

    // Independently check the search was created
    let search = dbSearches.getSearchBySid('1');
    expect(search).toBeObject();
    expect(search).toContainEntries([['sid', '1']]);

    search = dbSearches.getSearchBySid('2');
    expect(search).toBeObject();
    expect(search).toContainEntries([['sid', '2']]);
  });

  test('adding a search with a sid fails', () => {
    const result = dbSearches.add(<Search>{
      sid: '222',
      alias: 'search-1',
      isEnabled: true,
      rank: 50,
      sources: [Source.craigslist],
      craigslistSearchDetails: {
        searchTerms: ['demo hammer'],
        regions: [CraigslistRegion.merced],
        subcategories: [CraigslistSubcategory.tools],
      },
      log: ['first'],
    });

    expect(result.isErr()).toBeTrue();
    expect(writeSpy).toHaveBeenCalledTimes(0);

    if (result.isErr()) {
      // Check the return value

      expect(result.error).toIncludeMultiple(['contains', 'sid']);
    }

    // Independently check the search was created
    const search = dbSearches.getSearchBySid('2');
    expect(search).toBeUndefined();
  });

  test('upserting a search works', () => {
    const search = <Search>{
      alias: 'search-1',
      isEnabled: true,
      rank: 50,
      sources: [Source.craigslist],
      craigslistSearchDetails: {
        searchTerms: ['demo hammer'],
        regions: [CraigslistRegion.merced],
        subcategories: [CraigslistSubcategory.tools],
      },
      log: ['first'],
    };
    const result = dbSearches.add(search);

    search.alias = 'search-1b';
    search.isEnabled = false;
    search.rank = 51;
    search.log = ['first', 'second'];
    dbSearches.upsertSearch(search);

    expect(result.isOk()).toBeTrue();
    expect(writeSpy).toHaveBeenCalledTimes(2);

    if (result.isOk()) {
      // Check the return value
      const search = result.value;
      expect(search).toBeObject();
      expect(search).toContainAllKeys([
        'sid',
        'alias',
        'isEnabled',
        'rank',
        'sources',
        'craigslistSearchDetails',
        'log',
      ]);
      expect(search).toContainEntries([
        ['sid', '1'],
        ['alias', 'search-1b'],
        ['isEnabled', false],
        ['sources', ['craigslist']],
        ['log', ['first', 'second']],
      ]);
      expect(search.craigslistSearchDetails).toContainAllEntries([
        ['searchTerms', ['demo hammer']],
        ['regions', ['merced']],
        ['subcategories', ['tools']],
      ]);
    }
  });

  test("upserting a search with a blank searchTerm X's", () => {
    const search = <Search>{
      sid: '17',
      alias: 'search-1',
      isEnabled: true,
      rank: 50,
      sources: [Source.craigslist],
      craigslistSearchDetails: {
        searchTerms: [''],
        regions: [CraigslistRegion.merced],
        subcategories: [CraigslistSubcategory.tools],
      },
      log: ['first'],
    };
    const result = dbSearches.upsertSearch(search);

    if (result.isOk()) {
      expect(result.isOk()).toBeTrue();
    } else {
      expect(result.isOk()).toBeTrue();
    }
  });
});

describe('dbSearches regular stuff, with populated db', () => {
  beforeEach(() => {
    initializeJest();
  });

  test('getting valid enabled searches works', () => {
    const initialFile = {
      '1': {
        sid: '1',
        alias: 'search-1',
        isEnabled: true,
        rank: 50,
        sources: ['craigslist'],
        craigslistSearchDetails: {
          searchTerms: ['demo hammer'],
          regions: ['merced'],
          subcategories: ['tools'],
        },
      },
      '2': {
        sid: '2',
        alias: 'search-2',
        isEnabled: true,
        rank: 60,
        sources: ['craigslist'],
        craigslistSearchDetails: {
          searchTerms: ['chisel'],
          regions: ['merced'],
          subcategories: ['tools'],
        },
      },
      '3': {
        sid: '3',
        alias: 'search-3',
        isEnabled: false,
        rank: 70,
        sources: ['craigslist'],
        craigslistSearchDetails: {
          searchTerms: ['saw'],
          regions: ['merced'],
          subcategories: ['tools'],
        },
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isOk()).toBeTrue();
    if (result.isOk()) {
      const searches = dbSearches.getValidEnabledSearches();
      expect(searches).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ sid: '1' }),
          expect.objectContaining({ sid: '2' }),
        ]),
      );
    }
  });

  test('upserting a search with a blank searchTerms is allowed', () => {
    const search = dbSearches.getSearchBySid('401');
    if (search && search.craigslistSearchDetails) {
      search.craigslistSearchDetails.searchTerms.push('');
      const result = dbSearches.upsertSearch(search);
      if (result.isOk()) {
        expect(result.isOk()).toBeTrue();
      } else {
        expect(result.isOk()).toBeTrue();
      }
    } else {
      expect(search).toContainKey('401');
    }
  });

  test('add log with write works', () => {
    const initialFile = {
      '1': {
        sid: '1',
        alias: 'search-1',
        isEnabled: true,
        rank: 50,
        sources: ['craigslist'],
        craigslistSearchDetails: {
          searchTerms: ['demo hammer'],
          regions: ['merced'],
          subcategories: ['tools'],
        },
        log: ['first'],
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    dbSearches.init(searchesDb);
    dbSearches.addLogWithWrite('1', 'woot');
    const search = dbSearches.getSearchBySid('1');
    if (search) {
      if (search.log) {
        expect(search.log[0]).toInclude('first');
        expect(search.log[1]).toInclude('woot');
      } else {
        expect(search.log).toBeDefined();
      }
    } else {
      expect(search).toBeDefined();
    }
  });
});
