import { logger } from './utils/logger/logger';
import { dotenvExists } from './utils/common/checkDotEnv';

if (!dotenvExists('.env')) {
  logger.error('exiting');
  process.exit(1);
}

export const port = process.env.PORT;
export const static_home = process.env.STATIC_HOME;
export const publicDir = `${static_home}/public`;

export const dbDir = `${process.cwd()}/.db`;

console.log(`process.cwd()=${process.cwd()}`);
