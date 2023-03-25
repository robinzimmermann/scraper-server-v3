import { jest } from '@jest/globals';
import 'jest-extended';

jest.mock('../../src/api/jsonDb/lowdbDriver');

import * as dbPosts from '../../src/database/dbPosts';

// Some handy Jest spies.
const saveDataSpy = jest.spyOn(dbPosts, 'saveData');

const initializeJest = (): void => {
  jest.clearAllMocks();
};

describe('dbPosts test suite', () => {
  beforeEach(() => {
    initializeJest();
  });

  test.skip('initializes when no database file is present', () => {
    dbPosts.init('no-such-file');

    expect(dbPosts.getPosts()).toBeEmpty();
    expect(saveDataSpy).toHaveBeenCalledTimes(0);
  });

  test('updating title works', () => {
    dbPosts.init('postsDb-1');

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
