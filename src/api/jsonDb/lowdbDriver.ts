import { LowSync, JSONFileSync } from 'lowdb';
import fs from 'fs';

import { JsonDb } from './JsonDb';

export default <T>(file: string): JsonDb<T> => {
  if (!fs.existsSync(file)) {
    console.log(`database file doesn't exist, creating it: ${file}`);
    fs.writeFileSync(file, '{}\n');
  }

  let database: LowSync<T>;

  const read = (): T => {
    const adapter = new JSONFileSync<T>(file);
    database = new LowSync<T>(adapter);
    let doWrite = false;

    try {
      database.read();
    } catch (err: unknown) {
      if (err instanceof Error) {
        const e = err as Error;
        if (e instanceof SyntaxError) {
          console.log(
            `syntax error in db file, initializing data to {}: ${file}`,
          );
        } else {
          console.log(e);
        }
      } else {
        console.log(err);
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

  return <JsonDb<T>>{ read, write };
};
