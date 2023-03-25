// import {
// } from '../../../../database/models/dbSearches';

export const searchesDb1 = {
  '101': {
    sid: '101',
    alias: 'KTM dirt bikes',
    isEnabled: true,
    rank: 85,
    sources: ['craigslist'],
    craigslistSearchDetails: {
      searchTerms: ['search1', 'search2'],
      craigslistSubcategories: ['tools', 'motorcycles'],
      regions: ['sf bayarea', 'inland empire'],
    },
  },
};

export const searchesDbBad = {
  '101': {
    alias: 'KTM dirt bikes',
    isEnabled: true,
    rank: 85,
    sources: ['craigslist'],
    craigslistSearchDetails: {
      searchTerms: ['search1', 'search2'],
      craigslistSubcategories: ['tools', 'motorcycles'],
      regions: ['sf bayarea', 'inland empire'],
    },
  },
};
