import { jest } from '@jest/globals';

import { JsonDb } from '../../src/api/jsonDb/JsonDb';

let db: JsonDb<dbPosts.Database>;

import MyLowdb from '../../src/api/jsonDb/lowdbDriver';

import * as dbPosts from '../../src/database/dbPosts';

describe.skip('dbPosts init', () => {
  test('basics', () => {
    expect(true).toBe(true);
  });

  test('initializes when no database file is present', () => {
    db = MyLowdb<dbPosts.Database>('no-such-file');
    const writeSpy = jest.spyOn(db, 'write');
    dbPosts.init('no-such-file');

    // expect(dbPosts.getPosts()).toBeEmpty();

    expect(writeSpy).toHaveBeenCalledTimes(1);
  });
});
