// import fs from 'fs';

import { Cache } from './cache';
import { logger } from '../../utils/logger/logger';

export default (saveLocation: string): Cache => {
  logger.silly(`the save location is ${saveLocation}`);
  const doesCacheExist = (): boolean => {
    logger.silly(`checking if ${saveLocation} exists`);
    return true;
  };

  return {
    doesCacheExist,
  };
};
