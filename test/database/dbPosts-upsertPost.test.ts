import { jest } from '@jest/globals';
import 'jest-extended';
import { SpiedFunction } from 'jest-mock';

import JsonDb from '../../src/api/jsonDb/lowdbDriver';
// import { Posts } from '../../src/database/models/dbPosts';
import {
  CraiglistFields,
  Post,
  Posts,
} from '../../src/database/models/dbPosts';
import * as dbPosts from '../../src/database/dbPosts';
import * as dbSearches from '../../src/database/dbSearches';
import {
  CraigslistRegion,
  Searches,
  Source,
} from '../../src/database/models/dbSearches';
import * as postsDbData from './testData/dbPostsTestData';
import { FacebookRegion } from '../../src/database/models/dbSearches';
import { logger } from '../../src/utils/logger/logger';
import { Result } from 'neverthrow';

jest.mock('../../src/api/jsonDb/lowdbDriver');

let postsDb = JsonDb<Posts>();
let writeSpy: SpiedFunction<() => void>;

const searchesDb = JsonDb<Searches>();
const searchesDbData = postsDbData.initialSearches;

const printResultErrors = (
  result: Result<Post, string[]>,
  lg = logger.error,
): void => {
  result.mapErr((messages: string[]) => messages.forEach((msg) => lg(msg)));
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

    const result = dbPosts.upsertPost(
      post.pid,
      post.sid,
      post.source,
      post.regions[0],
      post.searchTerms[0],
      post.title,
      post.postDate,
      post.price,
      post.hood,
      post.thumbnailUrl,
      post.extras,
    );

    expect(result.isOk()).toBeTrue();
    expect(dbPosts.getPosts()).toContainAllKeys(['123']);
    expect(writeSpy).toHaveBeenCalledTimes(1);
  });

  test('adding a craigslist post with an empty postDate should error', () => {
    const post = <Post>{
      pid: '123',
      sid: '1',
      source: Source.craigslist,
      regions: [CraigslistRegion.modesto],
      searchTerms: ['search1'],
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

    const result = dbPosts.upsertPost(
      post.pid,
      post.sid,
      post.source,
      post.regions[0],
      post.searchTerms[0],
      post.title,
      post.postDate,
      post.price,
      post.hood,
      post.thumbnailUrl,
      post.extras,
    );

    expect(result.isErr()).toBeTrue();
    // Javascript guard is needed to the contents of result
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      // printResultErrors(result, logger.info);
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
      title: 'An amazing thing',
      postDate: '',
      price: 20,
      priceStr: '$20',
      hood: 'reno-ish',
      thumbnailUrl: 'https://somewhere.com/imageXYZ',
    };

    postsDb.setCacheDir('');
    dbPosts.init(postsDb);

    const result = dbPosts.upsertPost(
      post.pid,
      post.sid,
      post.source,
      post.regions[0],
      post.searchTerms[0],
      post.title,
      post.postDate,
      post.price,
      post.hood,
      post.thumbnailUrl,
    );

    // Javascript guard is needed to the contents of result
    if (result.isErr()) {
      printResultErrors(result);
    }
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

    const result = dbPosts.upsertPost(
      post.pid,
      post.sid,
      post.source,
      post.regions[0],
      post.searchTerms[0],
      post.title,
      post.postDate,
      post.price,
      post.hood,
      post.thumbnailUrl,
    );

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

    const result = dbPosts.upsertPost(
      post.pid,
      post.sid,
      post.source,
      post.regions[0],
      post.searchTerms[0],
      post.title,
      post.postDate,
      post.price,
      post.hood,
      post.thumbnailUrl,
      post.extras,
    );

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
      title: 'An amazing thing',
      postDate: '2023-02-17',
      price: 20,
      priceStr: '$20',
      hood: 'reno-ish',
      thumbnailUrl: 'https://somewhere.com/imageXYZ',
    };

    postsDb.setCacheDir('');
    dbPosts.init(postsDb);

    dbPosts.upsertPost(
      post.pid,
      post.sid,
      post.source,
      post.regions[0],
      post.searchTerms[0],
      post.title,
      post.postDate,
      post.price,
      post.hood,
      post.thumbnailUrl,
    );

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

    dbPosts.upsertPost(
      post.pid,
      post.sid,
      post.source,
      post.regions[0],
      post.searchTerms[0],
      post.title,
      post.postDate,
      post.price,
      post.hood,
      post.thumbnailUrl,
      <CraiglistFields>{
        subcategories: [post.extras?.subcategories[0]],
      },
    );

    dbPosts.upsertPost(
      post.pid,
      post.sid,
      post.source,
      post.regions[1],
      post.searchTerms[1],
      post.title,
      post.postDate,
      post.price,
      post.hood,
      post.thumbnailUrl,
      <CraiglistFields>{
        subcategories: [post.extras?.subcategories[1]],
      },
    );

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
      title: 'An amazing thing',
      postDate: '2023-02-17',
      price: 20,
      priceStr: '$20',
      hood: 'reno-ish',
      thumbnailUrl: 'https://somewhere.com/imageXYZ',
    };

    postsDb.setCacheDir('');
    dbPosts.init(postsDb);

    dbPosts.upsertPost(
      post.pid,
      post.sid,
      post.source,
      post.regions[0],
      post.searchTerms[0],
      post.title,
      post.postDate,
      post.price,
      post.hood,
      post.thumbnailUrl,
    );

    dbPosts.upsertPost(
      post.pid,
      post.sid,
      post.source,
      post.regions[1],
      post.searchTerms[1],
      post.title,
      post.postDate,
      post.price,
      post.hood,
      post.thumbnailUrl,
    );

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

    dbPosts.upsertPost(
      post1.pid,
      post1.sid,
      post1.source,
      post1.regions[0],
      post1.searchTerms[0],
      post1.title,
      post1.postDate,
      post1.price,
      post1.hood,
      post1.thumbnailUrl,
      post1.extras,
    );

    dbPosts.upsertPost(
      post2.pid,
      post2.sid,
      post2.source,
      post2.regions[0],
      post2.searchTerms[0],
      post2.title,
      post2.postDate,
      post2.price,
      post2.hood,
      post2.thumbnailUrl,
      post2.extras,
    );

    expect(dbPosts.getPosts()).toContainAllKeys(['123', '124']);
    expect(writeSpy).toHaveBeenCalledTimes(2);
  });
});
