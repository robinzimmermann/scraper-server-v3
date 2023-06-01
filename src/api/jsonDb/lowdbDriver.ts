import { LowSync } from 'lowdb';
import { JSONFileSync } from 'lowdb/node';
import fs from 'fs';
import chalk from 'chalk';

import { JsonDb } from './JsonDb';
import { logger } from '../../../src/utils/logger/logger';

// export default <T>(file: string): JsonDb<T> => {
export default <T>(): JsonDb<T> => {
  let file: string;

  let database: LowSync<T>;

  const setCacheDir = (cacheDir: string): void => {
    file = cacheDir;
    if (!fs.existsSync(file)) {
      logger.warn(`database file doesn't exist, creating it: ${chalk.bold(file)}`);
      fs.writeFileSync(file, '{}\n');
    }
  };

  const read = (): T => {
    const adapter = new JSONFileSync<T>(file);
    database = new LowSync<T>(adapter, <T>{});
    let doWrite = false;

    try {
      database.read();
    } catch (err: unknown) {
      if (err instanceof Error) {
        const e = err;
        if (e instanceof SyntaxError) {
          logger.warn(`syntax error in db file, initializing data to {}: ${file}`);
        } else {
          logger.error(e);
        }
      } else {
        logger.error(err);
      }
      doWrite = true;
    }
    database.data ||= <T>{}; // In case the file doesn't exist
    if (doWrite) {
      database.write();
    }

    return database.data;
  };

  const write = (): void => {
    database.write();
  };

  return <JsonDb<T>>{ setCacheDir, read, write };
};
