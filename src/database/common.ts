import fs from 'fs';
import { ok, Result } from 'neverthrow';
import chalk from 'chalk';

// import lowdb from '../api/jsonDb/lowdbDriver';
import * as dbPosts from '../database/dbPosts';
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

  // const errors = [] as string[];
  const warnings = [] as string[];

  return ok(warnings);
};
