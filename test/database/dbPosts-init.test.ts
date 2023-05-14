import { jest } from '@jest/globals';
import 'jest-extended';
import { SpiedFunction } from 'jest-mock';

import JsonDb from '../../src/api/jsonDb/lowdbDriver';
// import { Posts } from '../../src/database/models/dbPosts';
import { Posts } from '../../src/database/models/dbPosts';
import * as dbPosts from '../../src/database/dbPosts';
import { CraigslistRegion, Searches, Source } from '../../src/database/models/dbSearches';
import { FacebookRegion } from '../../src/database/models/dbSearches';
import * as postsDbData from './testData/dbPostsTestData';
import * as dbSearches from '../../src/database/dbSearches';
import { logger } from '../../src/utils/logger/logger';

jest.mock('../../src/api/jsonDb/lowdbDriver');

let postsDb = JsonDb<Posts>();
let writeSpy: SpiedFunction<() => void>;

const searchesDb = JsonDb<Searches>();
const searchesDbData = postsDbData.initialSearches;

const initializeJest = (): void => {
  jest.clearAllMocks();
  postsDb = JsonDb<Posts>();
  writeSpy = jest.spyOn(postsDb, 'write');
};

describe('dbPosts initialization', () => {
  beforeAll(() => {
    searchesDb.setCacheDir(JSON.stringify(searchesDbData));
    const result = dbSearches.init(searchesDb);
    expect(result.isOk()).toBeTrue();
  });

  beforeEach(() => {
    initializeJest();
  });

  test('initializes when no database file is present', () => {
    postsDb.setCacheDir('');
    dbPosts.init(postsDb);

    expect(dbPosts.getPosts()).toBeEmpty();
    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('initializes database when file has no objects', () => {
    postsDb.setCacheDir('{}');
    dbPosts.init(postsDb);

    expect(dbPosts.getPosts()).toBeEmpty();
    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('valid craigslist post succeeds', () => {
    const initialFile = {
      '123': {
        pid: '123',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto', 'inland empire'],
        searchTerms: ['search1', 'search2'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'modesto',
        thumbnailUrl: 'https://somewhere.com/imageABC',
        extras: { subcategories: ['tools'] },
      },
    };

    postsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbPosts.init(postsDb);

    if (result.isErr()) {
      expect(result.error).toHaveLength(0);
    }
    expect(result.isOk()).toBeTrue();

    expect(writeSpy).toHaveBeenCalledTimes(0);

    const post = dbPosts.getPost('123');

    expect(post.pid).toBe('123');
    expect(post.sid).toBe('1');
    expect(post.source).toBe(Source.craigslist);
    expect(post.regions).toBeArrayOfSize(2);
    expect(post.regions).toIncludeSameMembers([
      CraigslistRegion.modesto,
      CraigslistRegion.inlandEmpire,
    ]);
    expect(post.searchTerms).toBeArrayOfSize(2);
    expect(post.searchTerms).toIncludeSameMembers(['search1', 'search2']);
    expect(post.title).toBe('An amazing thing');
    expect(post.postDate).toBe('2023-02-17');
    expect(post.price).toBe(20);
    expect(post.priceStr).toBe('$20');
    expect(post.hood).toBe('modesto');
    expect(post.thumbnailUrl).toBe('https://somewhere.com/imageABC');
  });

  test('valid facebook post should work', () => {
    const initialFile = {
      '888': {
        pid: '888',
        sid: '1',
        source: 'facebook',
        regions: ['walnut creek', 'telluride'],
        searchTerms: ['search1', 'search2'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'reno-ish',
        thumbnailUrl: 'https://somewhere.com/imageXYZ',
      },
    };

    postsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbPosts.init(postsDb);

    expect(result.isOk()).toBeTrue();

    expect(writeSpy).toHaveBeenCalledTimes(0);

    const post = dbPosts.getPost('888');

    expect(post.pid).toBe('888');
    expect(post.sid).toBe('1');
    expect(post.source).toBe(Source.facebook);
    expect(post.regions).toBeArrayOfSize(2);
    expect(post.regions).toIncludeSameMembers([
      FacebookRegion.walnutCreek,
      FacebookRegion.telluride,
    ]);
    expect(post.searchTerms).toBeArrayOfSize(2);
    expect(post.searchTerms).toIncludeSameMembers(['search1', 'search2']);
    expect(post.title).toBe('An amazing thing');
    expect(post.postDate).toBe('2023-02-17');
    expect(post.price).toBe(20);
    expect(post.priceStr).toBe('$20');
    expect(post.hood).toBe('reno-ish');
    expect(post.thumbnailUrl).toBe('https://somewhere.com/imageXYZ');
  });

  test('post with pid not matching its key fails', () => {
    const initialFile = {
      '888': {
        pid: '444',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto', 'inland empire'],
        searchTerms: ['search1', 'search2'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'reno-ish',
        thumbnailUrl: 'https://somewhere.com/imageXYZ',
      },
    };
    postsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbPosts.init(postsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'post',
        'with key',
        '888',
        'does not match its sid',
        '444',
      ]);
    }
  });

  test('post with missing pid fails', () => {
    const initialFile = {
      '444': {
        // pid: '444',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto', 'inland empire'],
        searchTerms: ['search1', 'search2'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'reno-ish',
        thumbnailUrl: 'https://somewhere.com/imageXYZ',
      },
    };
    postsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbPosts.init(postsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'post',
        'missing property',
        'pid',
        'should be',
        'string',
      ]);
    }
  });

  test('post with incorrect type for pid fails', () => {
    const initialFile = {
      '444': {
        pid: -33,
        sid: '1',
        source: 'craigslist',
        regions: ['modesto', 'inland empire'],
        searchTerms: ['search1', 'search2'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'reno-ish',
        thumbnailUrl: 'https://somewhere.com/imageXYZ',
      },
    };
    postsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbPosts.init(postsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'post',
        'pid',
        'incorrect type',
        'should be',
        'string',
      ]);
    }
  });

  test('post with empty string pid fails', () => {
    const initialFile = {
      '444': {
        pid: '',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto', 'inland empire'],
        searchTerms: ['search1', 'search2'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'reno-ish',
        thumbnailUrl: 'https://somewhere.com/imageXYZ',
      },
    };
    postsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbPosts.init(postsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple(['post', 'property', 'pid', 'empty string']);
    }
  });

  test('post with missing sid fails', () => {
    const initialFile = {
      '444': {
        pid: '444',
        // sid: '1',
        source: 'craigslist',
        regions: ['modesto', 'inland empire'],
        searchTerms: ['search1', 'search2'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'reno-ish',
        thumbnailUrl: 'https://somewhere.com/imageXYZ',
      },
    };
    postsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbPosts.init(postsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'post 444',
        'missing property',
        'sid',
        'should be',
        'string',
      ]);
    }
  });

  test('post with incorrect type for sid fails', () => {
    const initialFile = {
      '444': {
        pid: '444',
        sid: -33,
        source: 'craigslist',
        regions: ['modesto', 'inland empire'],
        searchTerms: ['search1', 'search2'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'reno-ish',
        thumbnailUrl: 'https://somewhere.com/imageXYZ',
      },
    };
    postsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbPosts.init(postsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'post 444',
        'sid',
        'incorrect type',
        'should be',
        'string',
      ]);
    }
  });

  test('post with empty string sid fails', () => {
    const initialFile = {
      '444': {
        pid: '444',
        sid: '',
        source: 'craigslist',
        regions: ['modesto', 'inland empire'],
        searchTerms: ['search1', 'search2'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'reno-ish',
        thumbnailUrl: 'https://somewhere.com/imageXYZ',
      },
    };
    postsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbPosts.init(postsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple(['post', 'property', 'sid', 'empty string']);
    }
  });

  test('post with missing source fails', () => {
    const initialFile = {
      '444': {
        pid: '444',
        sid: '1',
        // source: 'craigslist',
        regions: ['modesto', 'inland empire'],
        searchTerms: ['search1', 'search2'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'reno-ish',
        thumbnailUrl: 'https://somewhere.com/imageXYZ',
      },
    };
    postsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbPosts.init(postsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'post 444',
        'missing property',
        'source',
        'should be',
        'enum',
      ]);
    }
  });

  test('post with incorrect type for source fails', () => {
    const initialFile = {
      '444': {
        pid: '444',
        sid: '1',
        source: -33,
        regions: ['modesto', 'inland empire'],
        searchTerms: ['search1', 'search2'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'reno-ish',
        thumbnailUrl: 'https://somewhere.com/imageXYZ',
      },
    };
    postsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbPosts.init(postsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'post 444',
        'incorrect type',
        'source',
        '-33',
        'should be',
        'Source',
        'enum',
      ]);
    }
  });

  test('post with empty string source fails', () => {
    const initialFile = {
      '444': {
        pid: '444',
        sid: '1',
        source: '',
        regions: ['modesto', 'inland empire'],
        searchTerms: ['search1', 'search2'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'reno-ish',
        thumbnailUrl: 'https://somewhere.com/imageXYZ',
      },
    };
    postsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbPosts.init(postsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'post 444',
        'incorrect type',
        'source',
        "''",
        'should be',
        'Source',
        'enum',
      ]);
    }
  });

  test('post with missing regions fails', () => {
    const initialFile = {
      '444': {
        pid: '444',
        sid: '1',
        source: 'craigslist',
        // regions: ['modesto', 'inland empire'],
        searchTerms: ['search1', 'search2'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'reno-ish',
        thumbnailUrl: 'https://somewhere.com/imageXYZ',
      },
    };
    postsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbPosts.init(postsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'post 444',
        'missing property',
        'regions',
        'should be',
        'array',
        'of',
        'Region',
      ]);
    }
  });

  test('post with incorrect type for regions fails', () => {
    const initialFile = {
      '444': {
        pid: '444',
        sid: '1',
        source: 'craigslist',
        regions: -33,
        searchTerms: ['search1', 'search2'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'reno-ish',
        thumbnailUrl: 'https://somewhere.com/imageXYZ',
      },
    };
    postsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbPosts.init(postsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'post 444',
        'property',
        'regions',
        '-33',
        'incorrect type',
        'should be',
        'array',
        'of',
        'Region',
      ]);
    }
  });

  test('post with empty array regions fails', () => {
    const initialFile = {
      '444': {
        pid: '444',
        sid: '1',
        source: 'craigslist',
        regions: [],
        searchTerms: ['search1', 'search2'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'reno-ish',
        thumbnailUrl: 'https://somewhere.com/imageXYZ',
      },
    };
    postsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbPosts.init(postsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'post 444',
        'property',
        'regions',
        'empty',
        'array',
      ]);
    }
  });

  test('post with invalid array elements for regions fails', () => {
    const initialFile = {
      '444': {
        pid: '444',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto', -33, true, '', { also: 'wrong' }],
        searchTerms: ['search1', 'search2'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'reno-ish',
        thumbnailUrl: 'https://somewhere.com/imageXYZ',
      },
    };
    postsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbPosts.init(postsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'post 444',
        'property',
        'regions',
        'invalid values',
        'Region',
        'enum',
        '-33',
        'true',
        "''",
        'wrong',
      ]);
    }
  });

  test('post with missing searchTerms fails', () => {
    const initialFile = {
      '444': {
        pid: '444',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto', 'inland empire'],
        // searchTerms: ['search1', 'search2'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'reno-ish',
        thumbnailUrl: 'https://somewhere.com/imageXYZ',
      },
    };
    postsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbPosts.init(postsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'post 444',
        'missing property',
        'searchTerms',
        'should be',
        'array',
        'of',
        'string',
      ]);
    }
  });

  test('post with incorrect type for searchTerms fails', () => {
    const initialFile = {
      '444': {
        pid: '444',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto', 'inland empire'],
        searchTerms: -33,
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'reno-ish',
        thumbnailUrl: 'https://somewhere.com/imageXYZ',
      },
    };
    postsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbPosts.init(postsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'post 444',
        'searchTerms',
        'incorrect type',
        'should be',
        'array',
        'string',
      ]);
    }
  });

  test('post with empty array searchTerms fails', () => {
    const initialFile = {
      '444': {
        pid: '444',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto', 'inland empire'],
        searchTerms: [],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'reno-ish',
        thumbnailUrl: 'https://somewhere.com/imageXYZ',
      },
    };
    postsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbPosts.init(postsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'post 444',
        'property',
        'searchTerms',
        'empty',
        'array',
        'should be',
        'string',
      ]);
    }
  });

  test('post with invalid array elements for searchTerms fails', () => {
    const initialFile = {
      '444': {
        pid: '444',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto', 'inland empire'],
        searchTerms: ['search1', -33, true, '', { also: 'wrong' }],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'reno-ish',
        thumbnailUrl: 'https://somewhere.com/imageXYZ',
      },
    };
    postsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbPosts.init(postsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'post 444',
        'property',
        'searchTerms',
        'invalid values',
        'array',
        'string',
        '-33',
        'true',
        '',
        'wrong',
      ]);
    }
  });

  test('post with missing title fails', () => {
    const initialFile = {
      '444': {
        pid: '444',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto', 'inland empire'],
        searchTerms: ['search1', 'search2'],
        // title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'reno-ish',
        thumbnailUrl: 'https://somewhere.com/imageXYZ',
      },
    };
    postsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbPosts.init(postsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'post 444',
        'missing property',
        'title',
        'should be',
        'string',
      ]);
    }
  });

  test('post with incorrect type for title fails', () => {
    const initialFile = {
      '444': {
        pid: '444',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto', 'inland empire'],
        searchTerms: ['search1', 'search2'],
        title: -33,
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'reno-ish',
        thumbnailUrl: 'https://somewhere.com/imageXYZ',
      },
    };
    postsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbPosts.init(postsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'post 444',
        'title',
        'incorrect type',
        'should be',
        'string',
      ]);
    }
  });

  test('post with empty string title fails', () => {
    const initialFile = {
      '444': {
        pid: '444',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto', 'inland empire'],
        searchTerms: ['search1', 'search2'],
        title: '',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'reno-ish',
        thumbnailUrl: 'https://somewhere.com/imageXYZ',
      },
    };
    postsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbPosts.init(postsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple(['post 444', 'property', 'title', 'empty string']);
    }
  });

  test('post with missing postDate fails', () => {
    const initialFile = {
      '444': {
        pid: '444',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto', 'inland empire'],
        searchTerms: ['search1', 'search2'],
        title: 'An amazing thing',
        // postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'reno-ish',
        thumbnailUrl: 'https://somewhere.com/imageXYZ',
      },
    };
    postsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbPosts.init(postsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'post 444',
        'missing property',
        'postDate',
        'should be',
        'string',
      ]);
    }
  });

  test('post with incorrect type for postDate fails', () => {
    const initialFile = {
      '444': {
        pid: '444',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto', 'inland empire'],
        searchTerms: ['search1', 'search2'],
        title: 'An amazing thing',
        postDate: -33,
        price: 20,
        priceStr: '$20',
        hood: 'reno-ish',
        thumbnailUrl: 'https://somewhere.com/imageXYZ',
      },
    };
    postsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbPosts.init(postsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'post 444',
        'postDate',
        'incorrect type',
        'should be',
        'string',
      ]);
    }
  });

  test('post with empty string postDate fails', () => {
    const initialFile = {
      '444': {
        pid: '444',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto', 'inland empire'],
        searchTerms: ['search1', 'search2'],
        title: 'An amazing thing',
        postDate: '',
        price: 20,
        priceStr: '$20',
        hood: 'reno-ish',
        thumbnailUrl: 'https://somewhere.com/imageXYZ',
      },
    };
    postsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbPosts.init(postsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'post 444',
        'property',
        'postDate',
        'empty string',
      ]);
    }
  });

  test('post with bad format for postDate fails', () => {
    const initialFile = {
      '444': {
        pid: '444',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto', 'inland empire'],
        searchTerms: ['search1', 'search2'],
        title: 'An amazing thing',
        postDate: '23-17-01',
        price: 20,
        priceStr: '$20',
        hood: 'reno-ish',
        thumbnailUrl: 'https://somewhere.com/imageXYZ',
      },
    };
    postsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbPosts.init(postsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'post 444',
        'property',
        'postDate',
        'invalid format',
        '23-17-01',
        'MM-DD-YYYY',
      ]);
    }
  });

  test('post with bad format for priceStr fails', () => {
    const initialFile = {
      '444': {
        pid: '444',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto', 'inland empire'],
        searchTerms: ['search1', 'search2'],
        title: 'An amazing thing',
        postDate: '2023-10-01',
        price: 20,
        priceStr: '20',
        hood: 'reno-ish',
        thumbnailUrl: 'https://somewhere.com/imageXYZ',
      },
    };
    postsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbPosts.init(postsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'post 444',
        'property',
        'priceStr',
        'invalid format',
        '20',
        '$0,000',
      ]);
    }
  });

  test('post with missing price fails', () => {
    const initialFile = {
      '444': {
        pid: '444',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto', 'inland empire'],
        searchTerms: ['search1', 'search2'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        // price: 20,
        priceStr: '$20',
        hood: 'reno-ish',
        thumbnailUrl: 'https://somewhere.com/imageXYZ',
      },
    };
    postsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbPosts.init(postsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'post 444',
        'missing property',
        'price',
        'should be',
        'number',
      ]);
    }
  });

  test('post with incorrect type for price fails', () => {
    const initialFile = {
      '444': {
        pid: '444',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto', 'inland empire'],
        searchTerms: ['search1', 'search2'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 'wrong',
        priceStr: '$20',
        hood: 'reno-ish',
        thumbnailUrl: 'https://somewhere.com/imageXYZ',
      },
    };
    postsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbPosts.init(postsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'post 444',
        'price',
        'incorrect type',
        'should be',
        'number',
      ]);
    }
  });

  test('post with missing priceStr fails', () => {
    const initialFile = {
      '444': {
        pid: '444',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto', 'inland empire'],
        searchTerms: ['search1', 'search2'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        // priceStr: '$20',
        hood: 'reno-ish',
        thumbnailUrl: 'https://somewhere.com/imageXYZ',
      },
    };
    postsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbPosts.init(postsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'post 444',
        'missing property',
        'priceStr',
        'should be',
        'string',
      ]);
    }
  });

  test('post with incorrect type for priceStr fails', () => {
    const initialFile = {
      '444': {
        pid: '444',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto', 'inland empire'],
        searchTerms: ['search1', 'search2'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: -33,
        hood: 'reno-ish',
        thumbnailUrl: 'https://somewhere.com/imageXYZ',
      },
    };
    postsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbPosts.init(postsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'post 444',
        'priceStr',
        'incorrect type',
        'should be',
        'string',
      ]);
    }
  });

  test('post with empty string priceStr fails', () => {
    const initialFile = {
      '444': {
        pid: '444',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto', 'inland empire'],
        searchTerms: ['search1', 'search2'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '',
        hood: 'reno-ish',
        thumbnailUrl: 'https://somewhere.com/imageXYZ',
      },
    };
    postsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbPosts.init(postsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'post 444',
        'property',
        'priceStr',
        'empty string',
      ]);
    }
  });

  test('post with missing hood fails', () => {
    const initialFile = {
      '444': {
        pid: '444',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto', 'inland empire'],
        searchTerms: ['search1', 'search2'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        // hood: 'reno-ish',
        thumbnailUrl: 'https://somewhere.com/imageXYZ',
      },
    };
    postsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbPosts.init(postsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'post 444',
        'missing property',
        'hood',
        'should be',
        'string',
      ]);
    }
  });

  test('post with incorrect type for hood fails', () => {
    const initialFile = {
      '444': {
        pid: '444',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto', 'inland empire'],
        searchTerms: ['search1', 'search2'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: -33,
        thumbnailUrl: 'https://somewhere.com/imageXYZ',
      },
    };
    postsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbPosts.init(postsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'post 444',
        'property',
        'hood',
        '-33',
        'incorrect type',
        'should be',
        'string',
      ]);
    }
  });

  test('post with empty string hood fails', () => {
    const initialFile = {
      '444': {
        pid: '444',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto', 'inland empire'],
        searchTerms: ['search1', 'search2'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: '',
        thumbnailUrl: 'https://somewhere.com/imageXYZ',
      },
    };
    postsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbPosts.init(postsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple(['post 444', 'property', 'hood', 'empty string']);
    }
  });

  test('post with missing thumbnailUrl fails', () => {
    const initialFile = {
      '444': {
        pid: '444',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto', 'inland empire'],
        searchTerms: ['search1', 'search2'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'reno-ish',
        // thumbnailUrl: 'https://somewhere.com/imageXYZ',
      },
    };
    postsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbPosts.init(postsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'post 444',
        'missing property',
        'thumbnailUrl',
        'should be',
        'string',
      ]);
    }
  });

  test('post with incorrect type for thumbnailUrl fails', () => {
    const initialFile = {
      '444': {
        pid: '444',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto', 'inland empire'],
        searchTerms: ['search1', 'search2'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'reno-ish',
        thumbnailUrl: -33,
      },
    };
    postsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbPosts.init(postsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'post 444',
        'property',
        'thumbnailUrl',
        '-33',
        'incorrect type',
        'should be',
        'string',
      ]);
    }
  });

  test('post with empty string thumbnailUrl fails', () => {
    const initialFile = {
      '444': {
        pid: '444',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto', 'inland empire'],
        searchTerms: ['search1', 'search2'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'reno-ish',
        thumbnailUrl: '',
      },
    };
    postsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbPosts.init(postsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'post 444',
        'property',
        'thumbnailUrl',
        'empty string',
      ]);
    }
  });

  test('post with incorrect type for extras fails', () => {
    const initialFile = {
      '444': {
        pid: '444',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto', 'inland empire'],
        searchTerms: ['search1', 'search2'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'reno-ish',
        thumbnailUrl: 'https://somewhere.com/imageXYZ',
        extras: -33,
      },
    };
    postsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbPosts.init(postsDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'post 444',
        'property',
        'extras',
        '-33',
        'incorrect type',
        'should be',
        'object',
        'CraiglistFields',
      ]);
    }
  });

  test('post with optional extras succeeds', () => {
    const initialFile = {
      '444': {
        pid: '444',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto', 'inland empire'],
        searchTerms: ['search1', 'search2'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'reno-ish',
        thumbnailUrl: 'https://somewhere.com/imageXYZ',
        extras: {
          subcategories: ['tools'],
        },
      },
    };
    postsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbPosts.init(postsDb);

    if (result.isErr()) {
      expect(result.error).toHaveLength(0);
    }

    expect(result.isOk()).toBeTrue();
  });
});
