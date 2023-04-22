import { FacebookJobDetails } from '../../src/fetcher/fetcher';
import * as Facebook from '../../src/fetcher/facebook';
import {
  FacebookRegion,
  FacebookRadius,
  Search,
} from '../../src/database/models/dbSearches';

describe('fetchers test suite', () => {
  test('simple mix works', () => {
    const search = <Search>{
      sid: '101',
      alias: 'demolition hammer',
      isEnabled: true,
      rank: 85,
      sources: ['craigslist'],
      facebookSearchDetails: {
        searchTerms: ['search1'],
        regionalDetails: [
          {
            region: FacebookRegion.walnutCreek,
            distance: FacebookRadius.dist3,
          },
        ],
      },
    };
    const callbackArr: FacebookJobDetails[] = [];
    const callback = (jobDetails: FacebookJobDetails): void => {
      callbackArr.push(jobDetails);
    };
    Facebook.getJobs(search, callback);

    expect(true).toBe(true);
    expect(callbackArr).toHaveLength(1);
  });

  test('complex mix works', () => {
    const search = <Search>{
      sid: '101',
      alias: 'demolition hammer',
      isEnabled: true,
      rank: 85,
      sources: ['craigslist'],
      facebookSearchDetails: {
        searchTerms: ['search1', 'search2'],
        regionalDetails: [
          {
            region: FacebookRegion.losAngeles,
            distance: FacebookRadius.dist1,
          },
          { region: FacebookRegion.reno, distance: FacebookRadius.dist2 },
          {
            region: FacebookRegion.telluride,
            distance: FacebookRadius.dist100,
          },
        ],
      },
    };
    const callbackArr: FacebookJobDetails[] = [];

    const callback = (jobDetails: FacebookJobDetails): void => {
      callbackArr.push(jobDetails);
    };
    Facebook.getJobs(search, callback);

    expect(true).toBe(true);
    expect(callbackArr).toHaveLength(6);

    expect(
      callbackArr.filter((entry) => entry.searchTerm === 'search1').length,
    ).toBe(3);
    expect(
      callbackArr.filter((entry) => entry.searchTerm === 'search2').length,
    ).toBe(3);
  });
});

/*
export type FacebookSearchDetails = {
  searchTerms: string[];
  craigslistSubcategories: CraigslistSubcategory[];
  regions: CraigslistRegion[];
};


  searchTerm: string;
  region: CraigslistRegion;
  craigslistSubcategory: CraigslistSubcategory;
*/
