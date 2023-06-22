import { jest } from '@jest/globals';
import 'jest-extended';
import { SpiedFunction } from 'jest-mock';

import JsonDb from '../../src/api/jsonDb/lowdbDriver';
import { CraiglistFields, Post, PostStatus, Posts } from '../../src/database/models/dbPosts';
import * as dbPosts from '../../src/database/dbPosts';
import * as dbSearches from '../../src/database/dbSearches';
import { CraigslistRegion, Searches, Source } from '../../src/database/models/dbSearches';
import { FacebookRegion } from '../../src/database/models/dbSearches';
import * as globals from '../../src/globals';

jest.mock('../../src/api/jsonDb/lowdbDriver');

let postsDb = JsonDb<Posts>();
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
  postsDb = JsonDb<Posts>();
  writeSpy = jest.spyOn(postsDb, 'write');

  searchesDb.setCacheDir(JSON.stringify(searchesDbData));
  const result = dbSearches.init(searchesDb);
  expect(result.isOk()).toBeTrue();
};

describe('dbPosts test suite', () => {
  beforeEach(() => {
    initializeJest();
  });

  test('adding a craigslist post works', () => {
    const post = <Post>{
      pid: '123',
      sid: '1',
      source: Source.craigslist,
      regions: [CraigslistRegion.modesto],
      searchTerms: ['search1'],
      url: 'http://somewhere.com/123',
      status: 'new',
      title: 'An amazing thing',
      postDate: '2023-02-17',
      price: 20,
      priceStr: '$20',
      hood: 'modesto',
      thumbnailUrl: 'https://somewhere.com/imageABC',
      extras: { subcategories: ['tools'] },
    };

    postsDb.setCacheDir('');
    dbPosts.init(postsDb);

    const result = dbPosts.upsertPost(<Post>{
      pid: post.pid,
      sid: post.sid,
      source: post.source,
      regions: post.regions,
      searchTerms: post.searchTerms,
      url: post.url,
      status: post.status,
      title: post.title,
      postDate: post.postDate,
      price: post.price,
      hood: post.hood,
      thumbnailUrl: post.thumbnailUrl,
      rank: globals.highestRank,
      extras: post.extras,
    });

    expect(result.isOk()).toBeTrue();
    expect(dbPosts.getPosts()).toContainAllKeys(['123']);
    expect(dbPosts.hasPost('123')).toBeTrue();

    const postResult = dbPosts.getPost('123');
    expect(postResult.status).toEqual(PostStatus.new);
    expect(writeSpy).toHaveBeenCalledTimes(1);
  });

  test('adding a craigslist post with an empty postDate should error', () => {
    const post = <Post>{
      pid: '123',
      sid: '1',
      source: Source.craigslist,
      regions: [CraigslistRegion.modesto],
      searchTerms: ['search1'],
      url: 'http://somewhere.com/123',
      status: 'new',
      title: 'An amazing thing',
      postDate: '',
      price: 20,
      priceStr: '$20',
      hood: 'modesto',
      thumbnailUrl: 'https://somewhere.com/imageABC',
      extras: { subcategories: ['tools'] },
    };

    postsDb.setCacheDir('');
    dbPosts.init(postsDb);

    const result = dbPosts.upsertPost(<Post>{
      pid: post.pid,
      sid: post.sid,
      source: post.source,
      regions: post.regions,
      searchTerms: post.searchTerms,
      url: post.url,
      status: post.status,
      title: post.title,
      postDate: post.postDate,
      price: post.price,
      hood: post.hood,
      thumbnailUrl: post.thumbnailUrl,
      rank: globals.highestRank,
      extras: post.extras,
    });

    expect(result.isErr()).toBeTrue();
    // Javascript guard is needed to the contents of result
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'post 123',
        'property',
        'postDate',
        'empty string',
      ]);
    }
    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('adding a facebook post with an empty postDate should work', () => {
    const post = <Post>{
      pid: '888',
      sid: '1',
      source: Source.facebook,
      regions: [FacebookRegion.reno],
      searchTerms: ['search1'],
      url: 'http://somewhere.com/888',
      status: 'new',
      title: 'An amazing thing',
      postDate: '2023-02-17',
      price: 20,
      priceStr: '$20',
      hood: 'reno-ish',
      thumbnailUrl: 'https://somewhere.com/imageXYZ',
    };

    postsDb.setCacheDir('');
    dbPosts.init(postsDb);

    const result = dbPosts.upsertPost(<Post>{
      pid: post.pid,
      sid: post.sid,
      source: post.source,
      regions: post.regions,
      searchTerms: post.searchTerms,
      url: post.url,
      status: post.status,
      title: post.title,
      postDate: post.postDate,
      price: post.price,
      hood: post.hood,
      thumbnailUrl: post.thumbnailUrl,
      rank: globals.highestRank,
      extras: post.extras,
    });

    expect(result.isOk()).toBeTrue();
    expect(writeSpy).toHaveBeenCalledTimes(1);
  });

  test('adding a craigslist post without extras should not work', () => {
    const post = <Post>{
      pid: '123',
      sid: '1',
      source: Source.craigslist,
      regions: [CraigslistRegion.modesto],
      searchTerms: ['search1'],
      title: 'An amazing thing',
      postDate: '2023-02-17',
      price: 20,
      priceStr: '$20',
      hood: 'modesto',
      thumbnailUrl: 'https://somewhere.com/imageABC',
    };

    postsDb.setCacheDir('');
    dbPosts.init(postsDb);

    const result = dbPosts.upsertPost(<Post>{
      pid: post.pid,
      sid: post.sid,
      source: post.source,
      regions: post.regions,
      searchTerms: post.searchTerms,
      title: post.title,
      postDate: post.postDate,
      price: post.price,
      hood: post.hood,
      thumbnailUrl: post.thumbnailUrl,
      rank: globals.highestRank,
      extras: post.extras,
    });

    expect(result.isErr()).toBeTrue();
    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('adding a craigslist post with empty extras fails', () => {
    const post = <Post>{
      pid: '123',
      sid: '1',
      source: Source.craigslist,
      regions: [CraigslistRegion.modesto],
      searchTerms: ['search1'],
      title: 'An amazing thing',
      postDate: '2023-02-17',
      price: 20,
      priceStr: '$20',
      hood: 'modesto',
      thumbnailUrl: 'https://somewhere.com/imageABC',
      extras: {},
    };

    postsDb.setCacheDir('');
    dbPosts.init(postsDb);

    const result = dbPosts.upsertPost(<Post>{
      pid: post.pid,
      sid: post.sid,
      source: post.source,
      regions: post.regions,
      searchTerms: post.searchTerms,
      title: post.title,
      postDate: post.postDate,
      price: post.price,
      hood: post.hood,
      thumbnailUrl: post.thumbnailUrl,
      rank: globals.highestRank,
      extras: post.extras,
    });

    expect(result.isErr()).toBeTrue();
    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('adding a facebook post works', () => {
    const post = <Post>{
      pid: '888',
      sid: '1',
      source: Source.facebook,
      regions: [FacebookRegion.reno],
      searchTerms: ['search1'],
      url: 'http://somewhere.com/888',
      status: 'new',
      title: 'An amazing thing',
      postDate: '2023-02-17',
      price: 20,
      priceStr: '$20',
      hood: 'reno-ish',
      thumbnailUrl: 'https://somewhere.com/imageXYZ',
    };

    postsDb.setCacheDir('');
    dbPosts.init(postsDb);

    dbPosts.upsertPost(<Post>{
      pid: post.pid,
      sid: post.sid,
      source: post.source,
      regions: post.regions,
      searchTerms: post.searchTerms,
      url: post.url,
      status: post.status,
      title: post.title,
      postDate: post.postDate,
      price: post.price,
      hood: post.hood,
      thumbnailUrl: post.thumbnailUrl,
      rank: globals.highestRank,
      extras: post.extras,
    });

    expect(dbPosts.getPosts()).toContainAllKeys(['888']);
    expect(writeSpy).toHaveBeenCalledTimes(1);
  });

  test('adding a craigslist post with overlapping fields works', () => {
    const post = <Post>{
      pid: '123',
      sid: '1',
      source: 'craigslist',
      regions: ['reno', 'modesto'],
      searchTerms: ['search2', 'search1'],
      status: 'new',
      url: 'http://somewhere.com/123',
      title: 'An amazing thing',
      postDate: '2023-02-17',
      price: 20,
      priceStr: '$20',
      hood: 'modesto',
      thumbnailUrl: 'https://somewhere.com/imageABC',
      extras: { subcategories: ['tools', 'motorcycles'] },
    };

    postsDb.setCacheDir('');
    dbPosts.init(postsDb);

    dbPosts.upsertPost(<Post>{
      pid: post.pid,
      sid: post.sid,
      source: post.source,
      regions: post.regions,
      searchTerms: post.searchTerms,
      url: post.url,
      status: post.status,
      title: post.title,
      postDate: post.postDate,
      price: post.price,
      hood: post.hood,
      thumbnailUrl: post.thumbnailUrl,
      rank: globals.highestRank,
      extras: <CraiglistFields>{
        subcategories: [post.extras?.subcategories[0]],
      },
    });

    dbPosts.upsertPost(<Post>{
      pid: post.pid,
      sid: post.sid,
      source: post.source,
      regions: post.regions,
      searchTerms: post.searchTerms,
      url: post.url,
      status: post.status,
      title: post.title,
      postDate: post.postDate,
      price: post.price,
      hood: post.hood,
      thumbnailUrl: post.thumbnailUrl,
      rank: globals.highestRank,
      extras: <CraiglistFields>{
        subcategories: [post.extras?.subcategories[1]],
      },
    });

    expect(writeSpy).toHaveBeenCalledTimes(2);

    const newPost = dbPosts.getPost('123');

    // Should be sorted
    expect(newPost.regions).toHaveLength(2);
    expect(newPost.regions[0]).toBe('modesto');
    expect(newPost.regions[1]).toBe('reno');

    expect(newPost.searchTerms).toHaveLength(2);
    // Should be sorted
    expect(newPost.searchTerms[0]).toBe('search1');
    expect(newPost.searchTerms[1]).toBe('search2');

    expect(newPost).toHaveProperty('extras');
    expect(newPost.extras).toHaveProperty('subcategories');
    expect(newPost.extras?.subcategories).toHaveLength(2);
    // Should be sorted
    expect(newPost.extras?.subcategories[0]).toBe('motorcycles');
    expect(newPost.extras?.subcategories[1]).toBe('tools');
  });

  test('adding a facebook post with overlapping fields works', () => {
    const post = <Post>{
      pid: '888',
      sid: '1',
      source: 'facebook',
      regions: ['reno', 'telluride'],
      searchTerms: ['search2', 'search1'],
      status: 'new',
      url: 'http://somewhere.com/888',
      title: 'An amazing thing',
      postDate: '2023-02-17',
      price: 20,
      priceStr: '$20',
      hood: 'reno-ish',
      thumbnailUrl: 'https://somewhere.com/imageXYZ',
    };

    postsDb.setCacheDir('');
    dbPosts.init(postsDb);

    dbPosts.upsertPost(<Post>{
      pid: post.pid,
      sid: post.sid,
      source: post.source,
      regions: post.regions,
      searchTerms: post.searchTerms,
      url: post.url,
      status: post.status,
      title: post.title,
      postDate: post.postDate,
      price: post.price,
      hood: post.hood,
      thumbnailUrl: post.thumbnailUrl,
      rank: globals.highestRank,
    });

    dbPosts.upsertPost(<Post>{
      pid: post.pid,
      sid: post.sid,
      source: post.source,
      regions: post.regions,
      searchTerms: post.searchTerms,
      url: post.url,
      status: post.status,
      title: post.title,
      postDate: post.postDate,
      price: post.price,
      hood: post.hood,
      thumbnailUrl: post.thumbnailUrl,
      rank: globals.highestRank,
    });

    expect(writeSpy).toHaveBeenCalledTimes(2);

    const newPost = dbPosts.getPost('888');

    // Should be sorted
    expect(newPost.regions).toHaveLength(2);
    expect(newPost.regions[0]).toBe('reno');
    expect(newPost.regions[1]).toBe('telluride');

    expect(newPost.searchTerms).toHaveLength(2);
    // Should be sorted
    expect(newPost.searchTerms[0]).toBe('search1');
    expect(newPost.searchTerms[1]).toBe('search2');
  });

  test('adding multiple craigslist posts works', () => {
    const post1 = <Post>{
      pid: '123',
      sid: '1',
      source: Source.craigslist,
      regions: [CraigslistRegion.modesto],
      searchTerms: ['search1'],
      url: 'http://somewhere.com/123',
      status: 'new',
      title: 'An amazing thing',
      postDate: '2023-02-17',
      price: 20,
      priceStr: '$20',
      hood: 'modesto',
      thumbnailUrl: 'https://somewhere.com/imageABC',
      extras: { subcategories: ['tools'] },
    };

    const post2 = <Post>{
      pid: '124',
      sid: '1',
      source: Source.craigslist,
      regions: [CraigslistRegion.reno],
      searchTerms: ['search2'],
      url: 'http://somewhere.com/124',
      status: 'new',
      title: 'Something different',
      postDate: '2023-02-18',
      price: 33,
      priceStr: '$33',
      hood: 'Fallon',
      thumbnailUrl: 'https://somewhere.com/imageXYZ',
      extras: { subcategories: ['motorcycles'] },
    };

    postsDb.setCacheDir('');
    dbPosts.init(postsDb);

    dbPosts.upsertPost(<Post>{
      pid: post1.pid,
      sid: post1.sid,
      source: post1.source,
      regions: post1.regions,
      searchTerms: post1.searchTerms,
      url: post1.url,
      status: post1.status,
      title: post1.title,
      postDate: post1.postDate,
      price: post1.price,
      priceStr: post1.priceStr,
      hood: post1.hood,
      thumbnailUrl: post1.thumbnailUrl,
      rank: globals.highestRank,
      extras: post1.extras,
    });

    dbPosts.upsertPost(<Post>{
      pid: post2.pid,
      sid: post2.sid,
      source: post2.source,
      regions: post2.regions,
      searchTerms: post2.searchTerms,
      url: post2.url,
      status: post2.status,
      title: post2.title,
      postDate: post2.postDate,
      price: post2.price,
      priceStr: post2.priceStr,
      hood: post2.hood,
      thumbnailUrl: post2.thumbnailUrl,
      rank: globals.highestRank,
      extras: post2.extras,
    });

    expect(dbPosts.getPosts()).toContainAllKeys(['123', '124']);
    expect(writeSpy).toHaveBeenCalledTimes(2);
  });
});
