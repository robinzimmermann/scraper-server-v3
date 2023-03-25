// import fs from 'fs';

import { Cache } from './cache';
import { logger } from '../../utils/logger/logger';

export default (saveLocation: string): Cache => {
  logger.debug(`the cache directory is ${saveLocation}`);
  const doesCacheExist = (): boolean => {
    logger.debug(`checking if ${saveLocation} exists`);
    return true;
  };

  return {
    doesCacheExist,
  };
};
