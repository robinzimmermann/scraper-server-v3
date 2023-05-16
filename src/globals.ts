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

export const cacheDir = `${process.cwd()}/.cache`;

export const craigslistCacheDir = 'craigslist-results';
export const facebookCacheDir = 'facebook-results';

export const restColorGet = '#61affe';
export const restColorPost = '#49cc90';
export const restColorPut = '#fca130';
export const restColorDelete = '#f93e3e';
