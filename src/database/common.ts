import fs from 'fs';
import { ok, err, Result } from 'neverthrow';
import chalk from 'chalk';

import JsonDb from '../api/jsonDb/lowdbDriver';
import * as dbPosts from '../database/dbPosts';
import * as dbSearches from '../database/dbSearches';
import * as dbUserPrefs from '../database/dbUserPrefs';
import { dbDir } from '../globals';
import { logger } from '../../src/utils/logger/logger';
import { Posts } from './models/dbPosts';
import { Searches } from './models/dbSearches';
import { UserPrefs } from './models/dbUserPrefs';

export type ErrorWarnings = {
  errors?: string[];
  warnings?: string[];
};

export const initAllDbs = (): Result<boolean, string[]> => {
  if (!fs.existsSync(dbDir)) {
    logger.warn(`database directory doesn't exist, creating it: ${chalk.bold(dbDir)}`);
    fs.mkdirSync(dbDir, { recursive: true });
  }
  const errors = [] as string[];

  const searchesDb = JsonDb<Searches>();
  searchesDb.setCacheDir(`${dbDir}/dbSearches.json`);
  const searchesResult = dbSearches.init(searchesDb);

  if (searchesResult.isErr()) {
    logger.error(`one or more errors in ${dbDir}/dbSearches.json`);
    searchesResult.mapErr((messages: string[]) =>
      messages.forEach((msg) => logger.error(chalk.red(msg))),
    );
  }

  const postsDb = JsonDb<Posts>();
  postsDb.setCacheDir(`${dbDir}/dbPosts.json`);
  const postsResult = dbPosts.init(postsDb);

  if (postsResult.isErr()) {
    logger.error(`one or more errors in ${dbDir}/dbPosts.json`);
    postsResult.mapErr((messages: string[]) =>
      messages.forEach((msg) => logger.error(chalk.red(msg))),
    );
  }

  const userPrefsDb = JsonDb<UserPrefs>();
  userPrefsDb.setCacheDir(`${dbDir}/dbUserPrefs.json`);
  const userPrefsResult = dbUserPrefs.init(userPrefsDb);

  if (userPrefsResult.isErr()) {
    logger.error(`one or more errors in ${dbDir}/dbUserPrefs.json`);
    userPrefsResult.mapErr((messages: string[]) =>
      messages.forEach((msg) => logger.error(chalk.red(msg))),
    );
  }

  if (searchesResult.isErr() || postsResult.isErr() || userPrefsResult.isErr()) {
    return err(errors);
  } else {
    return ok(true);
  }
};
