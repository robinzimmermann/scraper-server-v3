import { jest } from '@jest/globals';

import { Searches } from '../../src/database/models/dbSearches';
import * as fetcher from '../../src/fetcher/fetcher';
import JsonDb from '../../src/api/jsonDb/lowdbDriver';
import * as dbSearches from '../../src/database/dbSearches';
import HBrowserInstance from '../../src/api/hbrowser/puppeteerDriver';
import { logger } from '../../src/utils/logger/logger';

jest.mock('../../src/api/jsonDb/lowdbDriver');
jest.mock('../../src/api/hbrowser/puppeteerDriver');

const hbrowser = HBrowserInstance();

const initializeJest = (): void => {
  fetcher.init(hbrowser);
  jest.clearAllMocks();
};

describe('fetchers test suite', () => {
  beforeEach(() => {
    initializeJest();
  });

  test('create multiple craigslist jobs works', () => {
    const searches = {
      '101': {
        sid: '101',
        alias: 'demolition hammer',
        isEnabled: true,
        rank: 85,
        sources: ['craigslist'],
        craigslistSearchDetails: {
          searchTerms: ['demo hammer', 'grinder', 'shovel hammer'],
          regions: ['sf bayarea', 'reno'],
          subcategories: ['tools', 'electronics'],
        },
      },
    } as unknown as Searches;

    const jsonDb = JsonDb<Searches>();
    jsonDb.setCacheDir(JSON.stringify(searches));
    dbSearches.init(jsonDb);
    fetcher.buildJobs();
    const jobs = fetcher.getJobs();
    expect(jobs).toHaveLength(12);
  });

  test('create multiple facebook jobs works', () => {
    const searches = {
      '102': {
        sid: '102',
        alias: 'demolition hammer',
        isEnabled: true,
        rank: 85,
        sources: ['facebook'],
        facebookSearchDetails: {
          searchTerms: ['demo hammer', 'grinder', 'shovel hammer'],
          regionalDetails: [
            { region: 'walnut creek', distance: '5 miles' },
            { region: 'los angeles', distance: '5 miles' },
          ],
        },
      },
    } as unknown as Searches;

    const jsonDb = JsonDb<Searches>();
    jsonDb.setCacheDir(JSON.stringify(searches));
    dbSearches.init(jsonDb);

    fetcher.buildJobs();
    const jobs = fetcher.getJobs();
    expect(jobs).toHaveLength(6);
  });

  test('create multiple craigslist and facebook jobs works', () => {
    const searches = {
      '101': {
        sid: '101',
        alias: 'demolition hammer',
        isEnabled: true,
        rank: 85,
        sources: ['craigslist', 'facebook'],
        craigslistSearchDetails: {
          searchTerms: ['demo hammer', 'grinder', 'shovel hammer'],
          regions: ['sf bayarea', 'reno'],
          subcategories: ['tools', 'electronics'],
        },
        facebookSearchDetails: {
          searchTerms: ['demo hammer', 'grinder', 'shovel hammer'],
          regionalDetails: [
            { region: 'walnut creek', distance: '5 miles' },
            { region: 'los angeles', distance: '5 miles' },
          ],
        },
      },
    } as unknown as Searches;

    const jsonDb = JsonDb<Searches>();
    jsonDb.setCacheDir(JSON.stringify(searches));
    dbSearches.init(jsonDb);

    fetcher.buildJobs();
    const jobs = fetcher.getJobs();
    expect(jobs).toHaveLength(12);
  });

  test('create job with invalid source fails', () => {
    const searches = {
      '101': {
        sid: '101',
        alias: 'demolition hammer',
        isEnabled: true,
        rank: 85,
        sources: ['craigslistX'],
        craigslistSearchDetails: {
          searchTerms: ['demo hammer'],
          regions: ['sf bayarea'],
          subcategories: ['tools'],
        },
      },
    } as unknown as Searches;

    const jsonDb = JsonDb<Searches>();
    jsonDb.setCacheDir(JSON.stringify(searches));
    dbSearches.init(jsonDb);
    fetcher.buildJobs();
    const jobs = fetcher.getJobs();
    expect(jobs).toHaveLength(0);
  });

  test('create craiglist job with invalid region fails', () => {
    const searches = {
      '101': {
        sid: '101',
        alias: 'demolition hammer',
        isEnabled: true,
        rank: 85,
        sources: ['craigslist'],
        craigslistSearchDetails: {
          searchTerms: ['demo hammer'],
          regions: ['sf bayareaX'],
          subcategories: ['tools'],
        },
      },
    } as unknown as Searches;

    const jsonDb = JsonDb<Searches>();
    jsonDb.setCacheDir(JSON.stringify(searches));
    dbSearches.init(jsonDb);
    fetcher.buildJobs();
    const jobs = fetcher.getJobs();
    expect(jobs).toHaveLength(0);
  });

  test('create craiglist job with invalid category fails', () => {
    const searches = {
      '101': {
        sid: '101',
        alias: 'demolition hammer',
        isEnabled: true,
        rank: 85,
        sources: ['craigslist'],
        craigslistSearchDetails: {
          searchTerms: ['demo hammer'],
          regions: ['sf bayarea'],
          subcategories: ['toolsX'],
        },
      },
    } as unknown as Searches;

    const jsonDb = JsonDb<Searches>();
    jsonDb.setCacheDir(JSON.stringify(searches));
    dbSearches.init(jsonDb);
    fetcher.buildJobs();
    const jobs = fetcher.getJobs();
    expect(jobs).toHaveLength(0);
  });

  test('create facebook job with invalid region fails', () => {
    const searches = {
      '101': {
        sid: '101',
        alias: 'demolition hammer',
        isEnabled: true,
        rank: 85,
        sources: ['facebook'],
        acebookSearchDetails: {
          searchTerms: ['demo hammer'],
          regionalDetails: [{ region: 'walnut creekX', distance: 5 }],
        },
      },
    } as unknown as Searches;

    const jsonDb = JsonDb<Searches>();
    jsonDb.setCacheDir(JSON.stringify(searches));
    dbSearches.init(jsonDb);
    fetcher.buildJobs();
    const jobs = fetcher.getJobs();
    expect(jobs).toHaveLength(0);
  });

  test('adding an additional job works', () => {
    // This is to test a bug that was originally in the code.
    const searches = {
      '101': {
        sid: '101',
        alias: 'demolition hammer',
        isEnabled: true,
        rank: 85,
        sources: ['craigslist', 'facebook'],
        craigslistSearchDetails: {
          searchTerms: ['demo hammer', 'grinder', 'shovel hammer'],
          regions: ['sf bayarea', 'reno'],
          subcategories: ['tools', 'electronics'],
        },
        facebookSearchDetails: {
          searchTerms: ['demo hammer', 'grinder', 'shovel hammer'],
          regionalDetails: [
            { region: 'walnut creek', distance: '5 miles' },
            { region: 'los angeles', distance: '5 miles' },
          ],
        },
      },
    } as unknown as Searches;

    const jsonDb = JsonDb<Searches>();
    jsonDb.setCacheDir(JSON.stringify(searches));
    const result = dbSearches.init(jsonDb);

    expect(result.isOk()).toBeTrue();

    fetcher.buildJobs();
    const jobs = fetcher.getJobs();

    jobs.forEach((job) => {
      fetcher.printJob(job);
    });
    logger.verbose(`jobs: ${JSON.stringify(jobs)}`);

    const originalJid0 = jobs[0].jid;
    const originalJid1 = jobs[1].jid;
    const originalJid2 = jobs[2].jid;
    const originalJid3 = jobs[3].jid;
    const originalJid4 = jobs[4].jid;

    fetcher.addAnotherPageToJob(jobs[3]);

    // jobs.forEach((job) => {
    //   fetcher.printJob(job);
    // });

    expect(jobs[0].jid).toBe(originalJid0);
    expect(jobs[1].jid).toBe(originalJid1);
    expect(jobs[2].jid).toBe(originalJid2);
    expect(jobs[3].jid).toBe(originalJid3);
    expect(jobs[5].jid).toBe(originalJid4);
  });
});
