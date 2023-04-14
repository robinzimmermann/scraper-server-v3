import fs from 'fs';
import { ok, err, Result } from 'neverthrow';
import chalk from 'chalk';

import JsonDb from '../api/jsonDb/lowdbDriver';
import * as dbPosts from '../database/dbPosts';
import * as dbSearches from '../database/dbSearches';
import { dbDir } from '../globals';
import { logger } from '../../src/utils/logger/logger';
import { Posts } from './models/dbPosts';
import { Searches } from './models/dbSearches';

export type ErrorWarnings = {
  errors?: string[];
  warnings?: string[];
};

export const initAllDbs = (): Result<boolean, string[]> => {
  logger.debug('initiating all the dbs!');
  if (!fs.existsSync(dbDir)) {
    logger.warn(
      `database directory doesn't exist, creating it: ${chalk.bold(dbDir)}`,
    );
    fs.mkdirSync(dbDir, { recursive: true });
  }
  const errors = [] as string[];

  const searchesDb = JsonDb<Searches>();
  searchesDb.setCacheDir(`${dbDir}/dbSearches.json`);
  const searchesResult = dbSearches.init(searchesDb);

  const postsDb = JsonDb<Posts>();
  postsDb.setCacheDir(`${dbDir}/dbPosts.json`);
  const postsResult = dbPosts.init(postsDb);

  if (searchesResult.isErr()) {
    searchesResult.mapErr((messages: string[]) =>
      messages.forEach((msg) => errors.push(msg)),
    );
  }

  if (postsResult.isErr()) {
    postsResult.mapErr((messages: string[]) =>
      messages.forEach((msg) => errors.push(msg)),
    );
  }

  if (errors.length > 0) {
    return err(errors);
  } else {
    return ok(true);
  }
};
