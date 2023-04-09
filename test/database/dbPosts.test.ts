import { jest } from '@jest/globals';
import 'jest-extended';

import JsonDb from '../../src/api/jsonDb/lowdbDriver';
import { Posts } from '../../src/database/models/dbPosts';
import * as dbPosts from '../../src/database/dbPosts';

import * as dbPostsTestData from './testData/dbPostsTestData';

jest.mock('../../src/api/jsonDb/lowdbDriver');

// type Database = Posts;

// Some handy Jest spies.
const saveDataSpy = jest.spyOn(dbPosts, 'saveData');

const initializeJest = (): void => {
  jest.clearAllMocks();
};

describe('dbPosts test suite', () => {
  beforeEach(() => {
    initializeJest();
  });

  test('initializes when no database file is present', () => {
    // const jsonDb = JsonDb<Database>();
    // jsonDb.setCacheDir('no-such-file');
    // dbPosts.init(jsonDb);

    // expect(dbPosts.getPosts()).toBeEmpty();
    // expect(saveDataSpy).toHaveBeenCalledTimes(0);

    const jsonDb = JsonDb<Posts>();
    jsonDb.setCacheDir('');
    dbPosts.init(jsonDb);

    // expect(dbPosts.hasPost('123')).toBeFalse();
    expect(dbPosts.getPosts()).toBeEmptyObject();
    expect(saveDataSpy).toHaveBeenCalledTimes(0);
  });

  test('updating title works', () => {
    const jsonDb = JsonDb<Posts>();
    jsonDb.setCacheDir(JSON.stringify(dbPostsTestData.postsDb1));
    dbPosts.init(jsonDb);

    expect(dbPosts.getPosts()).toContainKey('101');
    dbPosts.updateTitle('101', 'Awesome new title');
    expect(saveDataSpy).toHaveBeenCalledTimes(1);
  });

  // test('initializes when no posts are present', () => {
  //   db = MyLowdb<dbPosts.Database>('postsDb-empty');
  //   const writeSpy = jest.spyOn(db, 'write');
  //   dbPosts.init(db);

  //   expect(dbPosts.getPosts()).toBeEmpty();

  //   expect(writeSpy).toHaveBeenCalledTimes(0);
  // });
});
