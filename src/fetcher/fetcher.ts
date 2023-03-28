import { logger } from '../utils/logger/logger';
import * as dbSearches from '../database/dbSearches';

export type Job = {
  jid: number;
  sid: string;
};

const jobs = <Job[]>[];
let jobIdCounter = 1;

/**
 * Initiate a search
 */
export const doSearch = async (): Promise<void> => {
  // Initialize all variables that need it
  jobs.length = 0;

  const validSearches = dbSearches.getValidEnabledSearches();
  Object.values(validSearches).forEach((search) => {
    const job = { jid: jobIdCounter++, sid: search.sid } as Job;
    jobs.push(job);
  });
};

/**
 * Perform one-time initialization when the server starts.
 */
export const init = (): void => {
  logger.debug('initializing fetcher, because I have nothing else to do');
  logger.silly('initializing fetcher, because I have nothing else to do');
};
