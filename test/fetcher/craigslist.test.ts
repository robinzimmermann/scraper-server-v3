import { CraigslistJobDetails } from '../../src/fetcher/fetcher';
import * as CraigslistFetcher from '../../src/fetcher/craigslist';
import {
  CraigslistRegion,
  CraigslistSearchDetails,
  CraigslistSubcategory,
} from '../../src/database/models/dbSearches';

describe('fetchers test suite', () => {
  test('simple mix', () => {
    const searchDetails: CraigslistSearchDetails = {
      searchTerms: ['search1'],
      regions: [CraigslistRegion.losAngeles],
      craigslistSubcategories: [CraigslistSubcategory.tools],
    };
    const callbackArr: CraigslistJobDetails[] = [];
    const callback = (jobDetails: CraigslistJobDetails): void => {
      callbackArr.push(jobDetails);
    };
    CraigslistFetcher.getJobs(searchDetails, callback);

    expect(true).toBe(true);
    expect(callbackArr).toHaveLength(1);
    // expect(callbackArr[0]).
  });

  test('complex mix', () => {
    const searchDetails: CraigslistSearchDetails = {
      searchTerms: ['search1', 'search2'],
      regions: [
        CraigslistRegion.losAngeles,
        CraigslistRegion.modesto,
        CraigslistRegion.reno,
      ],
      craigslistSubcategories: [
        CraigslistSubcategory.tools,
        CraigslistSubcategory.antiques,
        CraigslistSubcategory.carsAndTrucks,
      ],
    };
    const callbackArr: CraigslistJobDetails[] = [];

    const callback = (jobDetails: CraigslistJobDetails): void => {
      callbackArr.push(jobDetails);
    };
    CraigslistFetcher.getJobs(searchDetails, callback);

    expect(true).toBe(true);
    expect(callbackArr).toHaveLength(18);

    expect(
      callbackArr.filter((entry) => entry.searchTerm === 'search1').length,
    ).toBe(9);
    expect(
      callbackArr.filter((entry) => entry.searchTerm === 'search2').length,
    ).toBe(9);

    expect(
      callbackArr.filter(
        (entry) => entry.region === CraigslistRegion.losAngeles,
      ).length,
    ).toBe(6);
    expect(
      callbackArr.filter((entry) => entry.region === CraigslistRegion.modesto)
        .length,
    ).toBe(6);
    expect(
      callbackArr.filter((entry) => entry.region === CraigslistRegion.reno)
        .length,
    ).toBe(6);

    expect(
      callbackArr.filter(
        (entry) => entry.craigslistSubcategory === CraigslistSubcategory.tools,
      ).length,
    ).toBe(6);
    expect(
      callbackArr.filter(
        (entry) =>
          entry.craigslistSubcategory === CraigslistSubcategory.antiques,
      ).length,
    ).toBe(6);
    expect(
      callbackArr.filter(
        (entry) =>
          entry.craigslistSubcategory === CraigslistSubcategory.carsAndTrucks,
      ).length,
    ).toBe(6);
  });
});

/*
export type CraigslistSearchDetails = {
  searchTerms: string[];
  craigslistSubcategories: CraigslistSubcategory[];
  regions: CraigslistRegion[];
};


  searchTerm: string;
  region: CraigslistRegion;
  craigslistSubcategory: CraigslistSubcategory;
*/
