import fs from 'fs';
import { ok, err, Result } from 'neverthrow';
import chalk from 'chalk';

// import lowdb from '../api/jsonDb/lowdbDriver';
import * as dbPosts from '../database/dbPosts';
import * as dbSearches from '../database/dbSearches';
import { dbDir } from '../globals';
import { logger } from '../../src/utils/logger/logger';

export type ErrorWarnings = {
  errors?: string[];
  warnings?: string[];
};

export const initAllDbs = (): Result<string[], string[]> => {
  if (!fs.existsSync(dbDir)) {
    logger.warn(
      `database directory doesn't exist, creating it: ${chalk.bold(dbDir)}`,
    );
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const filePosts = `${dbDir}/dbPosts.json`;
  dbPosts.init(filePosts);

  const fileSearches = `${dbDir}/dbSearches.json`;
  const searchesResult = dbSearches.init(fileSearches);

  const errors = [] as string[];
  const warnings = [] as string[];

  if (searchesResult.isErr()) {
    searchesResult.mapErr((messages) =>
      messages.forEach((msg) => errors.push(msg)),
    );
    searchesResult.map((messages) =>
      messages.forEach((msg) => warnings.push(msg)),
    );
    if (errors.length > 0) {
      return err(errors);
    }
  }
  if (searchesResult.isOk()) {
    searchesResult.map((messages) =>
      messages.forEach((msg) => warnings.push(msg)),
    );
  }

  return ok(warnings);
};
