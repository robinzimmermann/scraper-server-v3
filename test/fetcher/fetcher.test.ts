import { Searches } from '../../src/database/models/dbSearches';
import * as fetcher from '../../src/fetcher/fetcher';
import JsonDb from '../../src/api/jsonDb/lowdbDriver';
import * as dbSearches from '../../src/database/dbSearches';
import HBrowserInstance from '../../src/api/hbrowser/puppeteerDriver';

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

  test('create multiple craigslist jobs', () => {
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
          craigslistSubcategories: ['tools', 'electronics'],
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

  test('create multiple facebook jobs', () => {
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
            { region: 'walnut creek', distance: 5 },
            { region: 'los angeles', distance: 5 },
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

  test('create multiple craigslist and facebook jobs', () => {
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
          craigslistSubcategories: ['tools', 'electronics'],
        },
        facebookSearchDetails: {
          searchTerms: ['demo hammer', 'grinder', 'shovel hammer'],
          regionalDetails: [
            { region: 'walnut creek', distance: 5 },
            { region: 'los angeles', distance: 5 },
          ],
        },
      },
    } as unknown as Searches;

    const jsonDb = JsonDb<Searches>();
    jsonDb.setCacheDir(JSON.stringify(searches));
    dbSearches.init(jsonDb);

    fetcher.buildJobs();
    const jobs = fetcher.getJobs();
    expect(jobs).toHaveLength(18);
  });

  test('create job with invalid source', () => {
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
          craigslistSubcategories: ['tools'],
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

  test('create craiglist job with invalid region', () => {
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
          craigslistSubcategories: ['tools'],
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

  test('create craiglist job with invalid category', () => {
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
          craigslistSubcategories: ['toolsX'],
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

  test('create facebook job with invalid region', () => {
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
});
