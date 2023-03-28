import { logger } from '../utils/logger/logger';

const anotherFunc = (): void => {
  logger.silly('ouch');
};

export const init = (): void => {
  logger.silly("I'm doing it, says craigslist!");
  anotherFunc();
};
