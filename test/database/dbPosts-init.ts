import { jest } from '@jest/globals';
import 'jest-extended';
import { SpiedFunction } from 'jest-mock';

import JsonDb from '../../src/api/jsonDb/lowdbDriver';
// import { Posts } from '../../src/database/models/dbPosts';
import { Posts } from '../../src/database/models/dbPosts';
import * as dbPosts from '../../src/database/dbPosts';
import {
  CraigslistRegion,
  Searches,
  Source,
} from '../../src/database/models/dbSearches';
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

  test('valid craigslist post should work', () => {
    const initialFile = {
      '123': {
        pid: '123',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto'],
        searchTerms: ['search1'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'modesto',
        thumbnailUrl: 'https://somewhere.com/imageABC',
        extras: { subcategories: ['tools'] },
      },
    } as unknown as Posts;

    postsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbPosts.init(postsDb);

    expect(result.isOk()).toBeTrue();

    expect(writeSpy).toHaveBeenCalledTimes(0);

    const post = dbPosts.getPost('123');

    expect(post.pid).toBe('123');
    expect(post.sid).toBe('1');
    expect(post.source).toBe(Source.craigslist);
    expect(post.regions).toBeArrayOfSize(1);
    expect(post.regions).toIncludeSameMembers([CraigslistRegion.modesto]);
    expect(post.searchTerms).toBeArrayOfSize(1);
    expect(post.searchTerms).toIncludeSameMembers(['search1']);
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
        regions: ['reno'],
        searchTerms: ['search1'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'reno-ish',
        thumbnailUrl: 'https://somewhere.com/imageXYZ',
      },
    } as unknown as Posts;

    postsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbPosts.init(postsDb);

    if (result.isErr()) {
      result.mapErr((messages: string[]) =>
        messages.forEach((msg) => logger.error(`poop: ${msg}`)),
      );
    }

    expect(result.isOk()).toBeTrue();

    expect(writeSpy).toHaveBeenCalledTimes(0);

    const post = dbPosts.getPost('888');

    expect(post.pid).toBe('888');
    expect(post.sid).toBe('1');
    expect(post.source).toBe(Source.facebook);
    expect(post.regions).toBeArrayOfSize(1);
    expect(post.regions).toIncludeSameMembers([FacebookRegion.reno]);
    expect(post.searchTerms).toBeArrayOfSize(1);
    expect(post.searchTerms).toIncludeSameMembers(['search1']);
    expect(post.title).toBe('An amazing thing');
    expect(post.postDate).toBe('2023-02-17');
    expect(post.price).toBe(20);
    expect(post.priceStr).toBe('$20');
    expect(post.hood).toBe('reno-ish');
    expect(post.thumbnailUrl).toBe('https://somewhere.com/imageXYZ');
  });

  test('invalid craigslist post with no pid fails', () => {
    const initialFile = {
      '123': {
        // pid: '123',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto'],
        searchTerms: ['search1'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'modesto',
        thumbnailUrl: 'https://somewhere.com/imageABC',
        extras: { subcategories: ['tools'] },
      },
    } as unknown as Posts;

    postsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbPosts.init(postsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      const errors = <string[]>[];
      result.mapErr((resultErrors) => {
        resultErrors.forEach((msg) => {
          errors.push(msg);
        });
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('pid');
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('invalid craigslist post with pid wrong type fails', () => {
    const initialFile = {
      '123': {
        pid: 123,
        sid: '1',
        source: 'craigslist',
        regions: ['modesto'],
        searchTerms: ['search1'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'modesto',
        thumbnailUrl: 'https://somewhere.com/imageABC',
        extras: { subcategories: ['tools'] },
      },
    } as unknown as Posts;

    postsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbPosts.init(postsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      const errors = <string[]>[];
      result.mapErr((resultErrors) => {
        resultErrors.forEach((msg) => {
          errors.push(msg);
        });
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('pid');
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('invalid craigslist post with pid with blank string fails', () => {
    const initialFile = {
      '123': {
        pid: '',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto'],
        searchTerms: ['search1'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'modesto',
        thumbnailUrl: 'https://somewhere.com/imageABC',
        extras: { subcategories: ['tools'] },
      },
    } as unknown as Posts;

    postsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbPosts.init(postsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      const errors = <string[]>[];
      result.mapErr((resultErrors) => {
        resultErrors.forEach((msg) => {
          errors.push(msg);
        });
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('pid');
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('invalid multiple craigslist posts each return an error', () => {
    const initialFile = {
      '123': {
        pid: '',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto'],
        searchTerms: ['search1'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'modesto',
        thumbnailUrl: 'https://somewhere.com/imageABC',
        extras: { subcategories: ['tools'] },
      },
      '321': {
        pid: '',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto'],
        searchTerms: ['search1'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'modesto',
        thumbnailUrl: 'https://somewhere.com/imageABC',
        extras: { subcategories: ['tools'] },
      },
    } as unknown as Posts;

    postsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbPosts.init(postsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      const errors = <string[]>[];
      result.mapErr((resultErrors) => {
        resultErrors.forEach((msg) => {
          errors.push(msg);
        });
      });
      expect(errors).toHaveLength(2);
      expect(errors[0]).toContain('pid');
      expect(errors[1]).toContain('pid');
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test("valid craigslist post that does not match it's key fails", () => {
    const initialFile = {
      abc: {
        pid: '123',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto'],
        searchTerms: ['search1'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'modesto',
        thumbnailUrl: 'https://somewhere.com/imageABC',
        extras: { subcategories: ['tools'] },
      },
    } as unknown as Posts;

    postsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbPosts.init(postsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      const errors = <string[]>[];
      result.mapErr((resultErrors) => {
        resultErrors.forEach((msg) => {
          errors.push(msg);
        });
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('key');
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('post mising sid fails', () => {
    const initialFile = {
      '123': {
        pid: '123',
        // sid: '1',
        source: 'craigslist',
        regions: ['modesto'],
        searchTerms: ['search1'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'modesto',
        thumbnailUrl: 'https://somewhere.com/imageABC',
        extras: { subcategories: ['tools'] },
      },
    } as unknown as Posts;

    postsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbPosts.init(postsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      const errors = <string[]>[];
      result.mapErr((resultErrors) => {
        resultErrors.forEach((msg) => {
          errors.push(msg);
        });
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('sid');
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('post invalid type for sid fails', () => {
    const initialFile = {
      '123': {
        pid: '123',
        sid: 1,
        source: 'craigslist',
        regions: ['modesto'],
        searchTerms: ['search1'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'modesto',
        thumbnailUrl: 'https://somewhere.com/imageABC',
        extras: { subcategories: ['tools'] },
      },
    } as unknown as Posts;

    postsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbPosts.init(postsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      const errors = <string[]>[];
      result.mapErr((resultErrors) => {
        resultErrors.forEach((msg) => {
          errors.push(msg);
        });
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('sid');
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test("post sid doesn't exist fails", () => {
    const initialFile = {
      '123': {
        pid: '123',
        sid: '999',
        source: 'craigslist',
        regions: ['modesto'],
        searchTerms: ['search1'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'modesto',
        thumbnailUrl: 'https://somewhere.com/imageABC',
        extras: { subcategories: ['tools'] },
      },
    } as unknown as Posts;

    postsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbPosts.init(postsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      const errors = <string[]>[];
      result.mapErr((resultErrors) => {
        resultErrors.forEach((msg) => {
          errors.push(msg);
        });
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('search');
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('post mising source fails', () => {
    const initialFile = {
      '123': {
        pid: '123',
        sid: '1',
        // source: 'craigslist',
        regions: ['modesto'],
        searchTerms: ['search1'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'modesto',
        thumbnailUrl: 'https://somewhere.com/imageABC',
        extras: { subcategories: ['tools'] },
      },
    } as unknown as Posts;

    postsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbPosts.init(postsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      const errors = <string[]>[];
      result.mapErr((resultErrors) => {
        resultErrors.forEach((msg) => {
          errors.push(msg);
        });
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('source');
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('post with invalid source fails', () => {
    const initialFile = {
      '123': {
        pid: '123',
        sid: '1',
        source: 'dummy',
        regions: ['modesto'],
        searchTerms: ['search1'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'modesto',
        thumbnailUrl: 'https://somewhere.com/imageABC',
        extras: { subcategories: ['tools'] },
      },
    } as unknown as Posts;

    postsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbPosts.init(postsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      const errors = <string[]>[];
      result.mapErr((resultErrors) => {
        resultErrors.forEach((msg) => {
          errors.push(msg);
        });
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('source');
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('post with no regions element fails', () => {
    const initialFile = {
      '123': {
        pid: '123',
        sid: '1',
        source: 'craigslist',
        // regions: ['modesto'],
        searchTerms: ['search1'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'modesto',
        thumbnailUrl: 'https://somewhere.com/imageABC',
        extras: { subcategories: ['tools'] },
      },
    } as unknown as Posts;

    postsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbPosts.init(postsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      const errors = <string[]>[];
      result.mapErr((resultErrors) => {
        resultErrors.forEach((msg) => {
          errors.push(msg);
        });
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('regions');
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('post with invalid type of regions fails', () => {
    const initialFile = {
      '123': {
        pid: '123',
        sid: '1',
        source: 'craigslist',
        regions: 'poop',
        searchTerms: ['search1'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'modesto',
        thumbnailUrl: 'https://somewhere.com/imageABC',
        extras: { subcategories: ['tools'] },
      },
    } as unknown as Posts;

    postsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbPosts.init(postsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      const errors = <string[]>[];
      result.mapErr((resultErrors) => {
        resultErrors.forEach((msg) => {
          errors.push(msg);
        });
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('regions');
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('post with an empty regions element fails', () => {
    const initialFile = {
      '123': {
        pid: '123',
        sid: '1',
        source: 'craigslist',
        regions: [],
        searchTerms: ['search1'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'modesto',
        thumbnailUrl: 'https://somewhere.com/imageABC',
        extras: { subcategories: ['tools'] },
      },
    } as unknown as Posts;

    postsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbPosts.init(postsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      const errors = <string[]>[];
      result.mapErr((resultErrors) => {
        resultErrors.forEach((msg) => {
          errors.push(msg);
        });
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('no elements');
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('post with an invalid regions value fails', () => {
    const initialFile = {
      '123': {
        pid: '123',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto', 'mars'],
        searchTerms: ['search1'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'modesto',
        thumbnailUrl: 'https://somewhere.com/imageABC',
        extras: { subcategories: ['tools'] },
      },
    } as unknown as Posts;

    postsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbPosts.init(postsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      const errors = <string[]>[];
      result.mapErr((resultErrors) => {
        resultErrors.forEach((msg) => {
          errors.push(msg);
        });
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('regions');
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('post with no searchTerms element fails', () => {
    const initialFile = {
      '123': {
        pid: '123',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto'],
        // searchTerms: ['search1'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'modesto',
        thumbnailUrl: 'https://somewhere.com/imageABC',
        extras: { subcategories: ['tools'] },
      },
    } as unknown as Posts;

    postsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbPosts.init(postsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      const errors = <string[]>[];
      result.mapErr((resultErrors) => {
        resultErrors.forEach((msg) => {
          errors.push(msg);
        });
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('searchTerms');
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('post with invalid type of searchTerms fails', () => {
    const initialFile = {
      '123': {
        pid: '123',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto'],
        searchTerms: 'search1',
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'modesto',
        thumbnailUrl: 'https://somewhere.com/imageABC',
        extras: { subcategories: ['tools'] },
      },
    } as unknown as Posts;

    postsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbPosts.init(postsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      const errors = <string[]>[];
      result.mapErr((resultErrors) => {
        resultErrors.forEach((msg) => {
          errors.push(msg);
        });
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('searchTerms');
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('post with an empty searchTerms element fails', () => {
    const initialFile = {
      '123': {
        pid: '123',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto'],
        searchTerms: [],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'modesto',
        thumbnailUrl: 'https://somewhere.com/imageABC',
        extras: { subcategories: ['tools'] },
      },
    } as unknown as Posts;

    postsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbPosts.init(postsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      const errors = <string[]>[];
      result.mapErr((resultErrors) => {
        resultErrors.forEach((msg) => {
          errors.push(msg);
        });
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('no elements');
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('post with no title element fails', () => {
    const initialFile = {
      '123': {
        pid: '123',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto'],
        searchTerms: ['search1'],
        // title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'modesto',
        thumbnailUrl: 'https://somewhere.com/imageABC',
        extras: { subcategories: ['tools'] },
      },
    } as unknown as Posts;

    postsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbPosts.init(postsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      const errors = <string[]>[];
      result.mapErr((resultErrors) => {
        resultErrors.forEach((msg) => {
          errors.push(msg);
        });
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('title');
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('post with invalid type of title fails', () => {
    const initialFile = {
      '123': {
        pid: '123',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto'],
        searchTerms: ['search1'],
        title: 999,
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'modesto',
        thumbnailUrl: 'https://somewhere.com/imageABC',
        extras: { subcategories: ['tools'] },
      },
    } as unknown as Posts;

    postsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbPosts.init(postsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      const errors = <string[]>[];
      result.mapErr((resultErrors) => {
        resultErrors.forEach((msg) => {
          errors.push(msg);
        });
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('title');
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('post with an empty title element fails', () => {
    const initialFile = {
      '123': {
        pid: '123',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto'],
        searchTerms: ['search1'],
        title: '',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'modesto',
        thumbnailUrl: 'https://somewhere.com/imageABC',
        extras: { subcategories: ['tools'] },
      },
    } as unknown as Posts;

    postsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbPosts.init(postsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      const errors = <string[]>[];
      result.mapErr((resultErrors) => {
        resultErrors.forEach((msg) => {
          errors.push(msg);
        });
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('title');
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('post with no postDate element fails', () => {
    const initialFile = {
      '123': {
        pid: '123',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto'],
        searchTerms: ['search1'],
        title: 'An amazing thing',
        // postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'modesto',
        thumbnailUrl: 'https://somewhere.com/imageABC',
        extras: { subcategories: ['tools'] },
      },
    } as unknown as Posts;

    postsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbPosts.init(postsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      const errors = <string[]>[];
      result.mapErr((resultErrors) => {
        resultErrors.forEach((msg) => {
          errors.push(msg);
        });
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('postDate');
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('post with invalid type of postDate fails', () => {
    const initialFile = {
      '123': {
        pid: '123',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto'],
        searchTerms: ['search1'],
        title: 'An amazing thing',
        postDate: 999,
        price: 20,
        priceStr: '$20',
        hood: 'modesto',
        thumbnailUrl: 'https://somewhere.com/imageABC',
        extras: { subcategories: ['tools'] },
      },
    } as unknown as Posts;

    postsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbPosts.init(postsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      const errors = <string[]>[];
      result.mapErr((resultErrors) => {
        resultErrors.forEach((msg) => {
          errors.push(msg);
        });
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('postDate');
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('post with an empty postDate element fails', () => {
    const initialFile = {
      '123': {
        pid: '123',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto'],
        searchTerms: ['search1'],
        title: 'An amazing thing',
        postDate: '',
        price: 20,
        priceStr: '$20',
        hood: 'modesto',
        thumbnailUrl: 'https://somewhere.com/imageABC',
        extras: { subcategories: ['tools'] },
      },
    } as unknown as Posts;

    postsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbPosts.init(postsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      const errors = <string[]>[];
      result.mapErr((resultErrors) => {
        resultErrors.forEach((msg) => {
          errors.push(msg);
        });
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('postDate');
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('postDate has invalid format fails', () => {
    const initialFile = {
      '123': {
        pid: '123',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto'],
        searchTerms: ['search1'],
        title: 'An amazing thing',
        postDate: '9999-99-99',
        price: 20,
        priceStr: '$20',
        hood: 'modesto',
        thumbnailUrl: 'https://somewhere.com/imageABC',
        extras: { subcategories: ['tools'] },
      },
    } as unknown as Posts;

    postsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbPosts.init(postsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      const errors = <string[]>[];
      result.mapErr((resultErrors) => {
        resultErrors.forEach((msg) => {
          errors.push(msg);
        });
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('format');
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('post with no price element fails', () => {
    const initialFile = {
      '123': {
        pid: '123',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto'],
        searchTerms: ['search1'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        // price: 20,
        priceStr: '$20',
        hood: 'modesto',
        thumbnailUrl: 'https://somewhere.com/imageABC',
        extras: { subcategories: ['tools'] },
      },
    } as unknown as Posts;

    postsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbPosts.init(postsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      const errors = <string[]>[];
      result.mapErr((resultErrors) => {
        resultErrors.forEach((msg) => {
          errors.push(msg);
        });
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('price');
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('post with invalid type of price fails', () => {
    const initialFile = {
      '123': {
        pid: '123',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto'],
        searchTerms: ['search1'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: '20',
        priceStr: '$20',
        hood: 'modesto',
        thumbnailUrl: 'https://somewhere.com/imageABC',
        extras: { subcategories: ['tools'] },
      },
    } as unknown as Posts;

    postsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbPosts.init(postsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      const errors = <string[]>[];
      result.mapErr((resultErrors) => {
        resultErrors.forEach((msg) => {
          errors.push(msg);
        });
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('price');
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('post with no priceStr element fails', () => {
    const initialFile = {
      '123': {
        pid: '123',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto'],
        searchTerms: ['search1'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        // priceStr: '$20',
        hood: 'modesto',
        thumbnailUrl: 'https://somewhere.com/imageABC',
        extras: { subcategories: ['tools'] },
      },
    } as unknown as Posts;

    postsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbPosts.init(postsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      const errors = <string[]>[];
      result.mapErr((resultErrors) => {
        resultErrors.forEach((msg) => {
          errors.push(msg);
        });
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('priceStr');
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('post with invalid type of priceStr fails', () => {
    const initialFile = {
      '123': {
        pid: '123',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto'],
        searchTerms: ['search1'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: 20,
        hood: 'modesto',
        thumbnailUrl: 'https://somewhere.com/imageABC',
        extras: { subcategories: ['tools'] },
      },
    } as unknown as Posts;

    postsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbPosts.init(postsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      const errors = <string[]>[];
      result.mapErr((resultErrors) => {
        resultErrors.forEach((msg) => {
          errors.push(msg);
        });
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('priceStr');
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('post with an empty priceStr element fails', () => {
    const initialFile = {
      '123': {
        pid: '123',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto'],
        searchTerms: ['search1'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '',
        hood: 'modesto',
        thumbnailUrl: 'https://somewhere.com/imageABC',
        extras: { subcategories: ['tools'] },
      },
    } as unknown as Posts;

    postsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbPosts.init(postsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      const errors = <string[]>[];
      result.mapErr((resultErrors) => {
        resultErrors.forEach((msg) => {
          errors.push(msg);
        });
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('priceStr');
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('priceStr has invalid format fails', () => {
    const initialFile = {
      '123': {
        pid: '123',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto'],
        searchTerms: ['search1'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$XX',
        hood: 'modesto',
        thumbnailUrl: 'https://somewhere.com/imageABC',
        extras: { subcategories: ['tools'] },
      },
    } as unknown as Posts;

    postsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbPosts.init(postsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      const errors = <string[]>[];
      result.mapErr((resultErrors) => {
        resultErrors.forEach((msg) => {
          errors.push(msg);
        });
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('format');
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('post with no hood element fails', () => {
    const initialFile = {
      '123': {
        pid: '123',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto'],
        searchTerms: ['search1'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        // hood: 'modesto',
        thumbnailUrl: 'https://somewhere.com/imageABC',
        extras: { subcategories: ['tools'] },
      },
    } as unknown as Posts;

    postsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbPosts.init(postsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      const errors = <string[]>[];
      result.mapErr((resultErrors) => {
        resultErrors.forEach((msg) => {
          errors.push(msg);
        });
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('hood');
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('post with invalid type of hood fails', () => {
    const initialFile = {
      '123': {
        pid: '123',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto'],
        searchTerms: ['search1'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 999,
        thumbnailUrl: 'https://somewhere.com/imageABC',
        extras: { subcategories: ['tools'] },
      },
    } as unknown as Posts;

    postsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbPosts.init(postsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      const errors = <string[]>[];
      result.mapErr((resultErrors) => {
        resultErrors.forEach((msg) => {
          errors.push(msg);
        });
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('hood');
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('craiglist post with an empty hood element should work', () => {
    const initialFile = {
      '123': {
        pid: '123',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto'],
        searchTerms: ['search1'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: '',
        thumbnailUrl: 'https://somewhere.com/imageABC',
        extras: { subcategories: ['tools'] },
      },
    } as unknown as Posts;

    postsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbPosts.init(postsDb);

    expect(result.isOk()).toBeTrue();

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('post with no thumbnailUrl element fails', () => {
    const initialFile = {
      '123': {
        pid: '123',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto'],
        searchTerms: ['search1'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'modesto',
        // thumbnailUrl: 'https://somewhere.com/imageABC',
        extras: { subcategories: ['tools'] },
      },
    } as unknown as Posts;

    postsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbPosts.init(postsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      const errors = <string[]>[];
      result.mapErr((resultErrors) => {
        resultErrors.forEach((msg) => {
          errors.push(msg);
        });
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('thumbnailUrl');
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('post with invalid type of thumbnailUrl fails', () => {
    const initialFile = {
      '123': {
        pid: '123',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto'],
        searchTerms: ['search1'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'modesto',
        thumbnailUrl: 999,
        extras: { subcategories: ['tools'] },
      },
    } as unknown as Posts;

    postsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbPosts.init(postsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      const errors = <string[]>[];
      result.mapErr((resultErrors) => {
        resultErrors.forEach((msg) => {
          errors.push(msg);
        });
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('thumbnailUrl');
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('post with an empty thumbnailUrl element fails', () => {
    const initialFile = {
      '123': {
        pid: '123',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto'],
        searchTerms: ['search1'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'modesto',
        thumbnailUrl: '',
        extras: { subcategories: ['tools'] },
      },
    } as unknown as Posts;

    postsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbPosts.init(postsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      const errors = <string[]>[];
      result.mapErr((resultErrors) => {
        resultErrors.forEach((msg) => {
          errors.push(msg);
        });
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('thumbnailUrl');
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('facebook post with extras element fails', () => {
    const initialFile = {
      '123': {
        pid: '123',
        sid: '1',
        source: 'facebook',
        regions: ['telluride'],
        searchTerms: ['search1'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'modesto',
        thumbnailUrl: 'https://somewhere.com/imageABC',
        extras: { subcategories: ['tools'] },
      },
    } as unknown as Posts;

    postsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbPosts.init(postsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      const errors = <string[]>[];
      result.mapErr((resultErrors) => {
        resultErrors.forEach((msg) => {
          errors.push(msg);
        });
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('extras');
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('craigslit post with no extras element fails', () => {
    const initialFile = {
      '123': {
        pid: '123',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto'],
        searchTerms: ['search1'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'modesto',
        thumbnailUrl: 'https://somewhere.com/imageABC',
        // extras: { subcategories: ['tools'] },
      },
    } as unknown as Posts;

    postsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbPosts.init(postsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      const errors = <string[]>[];
      result.mapErr((resultErrors) => {
        resultErrors.forEach((msg) => {
          errors.push(msg);
        });
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('extras');
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('craigslit post with no extras.subcategories element fails', () => {
    const initialFile = {
      '123': {
        pid: '123',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto'],
        searchTerms: ['search1'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'modesto',
        thumbnailUrl: 'https://somewhere.com/imageABC',
        extras: {},
      },
    } as unknown as Posts;

    postsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbPosts.init(postsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      const errors = <string[]>[];
      result.mapErr((resultErrors) => {
        resultErrors.forEach((msg) => {
          errors.push(msg);
        });
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('subcategories');
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('craigslit post with extras.subcategories of wrong type fails', () => {
    const initialFile = {
      '123': {
        pid: '123',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto'],
        searchTerms: ['search1'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'modesto',
        thumbnailUrl: 'https://somewhere.com/imageABC',
        extras: { subcategories: 999 },
      },
    } as unknown as Posts;

    postsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbPosts.init(postsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      const errors = <string[]>[];
      result.mapErr((resultErrors) => {
        resultErrors.forEach((msg) => {
          errors.push(msg);
        });
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('subcategories');
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('craigslit post with extras.subcategories that is empty fails', () => {
    const initialFile = {
      '123': {
        pid: '123',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto'],
        searchTerms: ['search1'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'modesto',
        thumbnailUrl: 'https://somewhere.com/imageABC',
        extras: { subcategories: [] },
      },
    } as unknown as Posts;

    postsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbPosts.init(postsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      const errors = <string[]>[];
      result.mapErr((resultErrors) => {
        resultErrors.forEach((msg) => {
          errors.push(msg);
        });
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('subcategories');
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('craigslit post with extras.subcategories with invalid type fails', () => {
    const initialFile = {
      '123': {
        pid: '123',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto'],
        searchTerms: ['search1'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'modesto',
        thumbnailUrl: 'https://somewhere.com/imageABC',
        extras: { subcategories: [999] },
      },
    } as unknown as Posts;

    postsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbPosts.init(postsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      const errors = <string[]>[];
      result.mapErr((resultErrors) => {
        resultErrors.forEach((msg) => {
          errors.push(msg);
        });
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('subcategories');
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('craigslit post with extras.subcategories with invalid value fails', () => {
    const initialFile = {
      '123': {
        pid: '123',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto'],
        searchTerms: ['search1'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'modesto',
        thumbnailUrl: 'https://somewhere.com/imageABC',
        extras: { subcategories: ['no-such-subcategory'] },
      },
    } as unknown as Posts;

    postsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbPosts.init(postsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      const errors = <string[]>[];
      result.mapErr((resultErrors) => {
        resultErrors.forEach((msg) => {
          errors.push(msg);
        });
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('subcategories');
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test("craigslit post with element in extras that doesn't exist fails", () => {
    const initialFile = {
      '123': {
        pid: '123',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto'],
        searchTerms: ['search1'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'modesto',
        thumbnailUrl: 'https://somewhere.com/imageABC',
        extras: { subcategories: ['tools'], dummy: true },
      },
    } as unknown as Posts;

    postsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbPosts.init(postsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      const errors = <string[]>[];
      result.mapErr((resultErrors) => {
        resultErrors.forEach((msg) => {
          errors.push(msg);
        });
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('dummy');
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test("post with element doesn't exist fails", () => {
    const initialFile = {
      '123': {
        pid: '123',
        sid: '1',
        source: 'craigslist',
        regions: ['modesto'],
        searchTerms: ['search1'],
        title: 'An amazing thing',
        postDate: '2023-02-17',
        price: 20,
        priceStr: '$20',
        hood: 'modesto',
        thumbnailUrl: 'https://somewhere.com/imageABC',
        extras: { subcategories: ['tools'] },
        dummy: true,
      },
    } as unknown as Posts;

    postsDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbPosts.init(postsDb);

    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      const errors = <string[]>[];
      result.mapErr((resultErrors) => {
        resultErrors.forEach((msg) => {
          errors.push(msg);
        });
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('dummy');
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });
});
