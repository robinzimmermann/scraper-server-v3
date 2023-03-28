import fs from 'fs';

import { Cache } from './cache';
import { logger } from '../../utils/logger/logger';

export default (parentDir: string, cacheName: string): Cache => {
  const cacheDir = `${parentDir}/${cacheName}`;

  const getParentDir = (): string => {
    return parentDir;
  };

  const getCacheName = (): string => {
    return cacheName;
  };

  const getCacheDir = (): string => {
    return cacheDir;
  };

  const createIfNotExists = (): void => {
    if (!fs.existsSync(cacheDir)) {
      logger.warn(`cache directory doesn't exist, creating it: ${cacheDir}`);
      fs.mkdirSync(cacheDir);
    }
  };

  return { getParentDir, getCacheName, getCacheDir, createIfNotExists };
};
