// import { jest } from '@jest/globals';
import 'jest-extended';

import * as searchesData from './testData/searchesTestData';
import { rankComparator } from '../../../src/utils/sorters/searches';
import { Search } from '../../../src/database/models/dbSearches';

describe('search sorting', () => {
  it('should sort by rank asc', () => {
    const searches = <Search[]>searchesData.unordered;
    const result = searches.sort(rankComparator);
    expect(result).toBeArrayOfSize(3);
    expect(result[0]).toEqual(expect.objectContaining({ sid: '1' }));
    expect(result[1]).toEqual(expect.objectContaining({ sid: '2' }));
    expect(result[2]).toEqual(expect.objectContaining({ sid: '3' }));
  });

  it('should sort by rank desc', () => {
    const searches = <Search[]>searchesData.unordered;
    const result = searches.sort((a: Search, b: Search) =>
      rankComparator(a, b, false),
    );
    expect(result).toBeArrayOfSize(3);
    expect(result[0]).toEqual(expect.objectContaining({ sid: '3' }));
    expect(result[1]).toEqual(expect.objectContaining({ sid: '2' }));
    expect(result[2]).toEqual(expect.objectContaining({ sid: '1' }));
  });
});
