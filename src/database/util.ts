import chalk from 'chalk';

import { logger } from '../utils/logger/logger';

export const dbInfoColor = chalk.grey;

export const DbLogger = (
  prefix: string,
): {
  info: (message: string) => void;
  debug: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
  silly: (message: string) => void;
} => {
  const log = (level: typeof logger.info, message: string): void => {
    level(dbInfoColor(`${prefix} ${message}`));
  };

  const info = (message: string): void => {
    log(logger.info, message);
  };

  const debug = (message: string): void => {
    log(logger.debug, message);
  };

  const warn = (message: string): void => {
    log(logger.warn, message);
  };

  const error = (message: string): void => {
    log(logger.error, message);
  };

  const silly = (message: string): void => {
    log(logger.silly, message);
  };

  return { info, debug, warn, error, silly };
};

export const isValueInEnum = <T extends { [name: string]: unknown }>(
  value: string,
  theEnum: T,
): boolean => {
  return Object.values(theEnum).includes(value);
};
