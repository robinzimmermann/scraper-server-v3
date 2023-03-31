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
      regions: ['sf bayarea', 'inland empire'],
      craigslistSubcategories: ['tools', 'motorcycles'],
    },
  },
};

/*
export const searchesDbInvalid = {
  // valid configuration
  '5': {
    sid: '5',
    alias: 'KTM dirt bikes',
    isEnabled: true,
    rank: 85,
    sources: ['craigslist'],
    craigslistSearchDetails: {
      searchTerms: ['search1', 'search2'],
      regions: ['sf bayarea', 'inland empire'],
      craigslistSubcategories: ['tools', 'motorcycles'],
    },
  },

  // sid doesn't match parent property
  '9': {
    sid: '99',
    alias: 'KTM dirt bikes',
    isEnabled: true,
    rank: 85,
    sources: ['craigslist'],
    craigslistSearchDetails: {
      searchTerms: ['search1', 'search2'],
      regions: ['sf bayarea', 'inland empire'],
      craigslistSubcategories: ['tools', 'motorcycles'],
    },
  },

  // missing: sid
  '10': {
    alias: 'KTM dirt bikes',
    isEnabled: true,
    rank: 85,
    sources: ['craigslist'],
    craigslistSearchDetails: {
      searchTerms: ['search1', 'search2'],
      regions: ['sf bayarea', 'inland empire'],
      craigslistSubcategories: ['tools', 'motorcycles'],
    },
  },

  // empty: sid
  '12': {
    sid: '',
    alias: 'KTM dirt bikes',
    isEnabled: true,
    rank: 85,
    sources: ['craigslist'],
    craigslistSearchDetails: {
      searchTerms: ['search1', 'search2'],
      regions: ['sf bayarea', 'inland empire'],
      craigslistSubcategories: ['tools', 'motorcycles'],
    },
  },

  // no alias
  '15': {
    sid: '15',
    isEnabled: true,
    rank: 85,
    sources: ['craigslist'],
    craigslistSearchDetails: {
      searchTerms: ['search1', 'search2'],
      regions: ['sf bayarea', 'inland empire'],
      craigslistSubcategories: ['tools', 'motorcycles'],
    },
  },

  // empty alias
  '20': {
    sid: '20',
    alias: '',
    isEnabled: true,
    rank: 85,
    sources: ['craigslist'],
    craigslistSearchDetails: {
      searchTerms: ['search1', 'search2'],
      regions: ['sf bayarea', 'inland empire'],
      craigslistSubcategories: ['tools', 'motorcycles'],
    },
  },
};
*/

export const searchesDbValid = {
  '5': {
    sid: '5',
    alias: 'KTM dirt bikes',
    isEnabled: true,
    rank: 85,
    sources: ['craigslist'],
    craigslistSearchDetails: {
      searchTerms: ['search1', 'search2'],
      regions: ['sf bayarea', 'inland empire'],
      craigslistSubcategories: ['tools', 'motorcycles'],
    },
  },
};

export const searchesDbSidElementDoesntMatch = {
  '9': {
    sid: '99',
    alias: 'KTM dirt bikes',
    isEnabled: true,
    rank: 85,
    sources: ['craigslist'],
    craigslistSearchDetails: {
      searchTerms: ['search1', 'search2'],
      regions: ['sf bayarea', 'inland empire'],
      craigslistSubcategories: ['tools', 'motorcycles'],
    },
  },
};

export const searchesDbMissingSid = {
  '21': {
    alias: 'KTM dirt bikes',
    isEnabled: true,
    rank: 85,
    sources: ['craigslist'],
    craigslistSearchDetails: {
      searchTerms: ['search1', 'search2'],
      regions: ['sf bayarea', 'inland empire'],
      craigslistSubcategories: ['tools', 'motorcycles'],
    },
  },
};

export const searchesDbMissingAlias = {
  '25': {
    sid: '25',
    isEnabled: true,
    rank: 85,
    sources: ['craigslist'],
    craigslistSearchDetails: {
      searchTerms: ['search1', 'search2'],
      regions: ['sf bayarea', 'inland empire'],
      craigslistSubcategories: ['tools', 'motorcycles'],
    },
  },
};

export const searchesDbWrongTypeAlias = {
  '26': {
    sid: '26',
    alias: 1234,
    isEnabled: true,
    rank: 85,
    sources: ['craigslist'],
    craigslistSearchDetails: {
      searchTerms: ['search1', 'search2'],
      regions: ['sf bayarea', 'inland empire'],
      craigslistSubcategories: ['tools', 'motorcycles'],
    },
  },
};

export const searchesDbEmptyAlias = {
  '27': {
    sid: '27',
    alias: '',
    isEnabled: true,
    rank: 85,
    sources: ['craigslist'],
    craigslistSearchDetails: {
      searchTerms: ['search1', 'search2'],
      regions: ['sf bayarea', 'inland empire'],
      craigslistSubcategories: ['tools', 'motorcycles'],
    },
  },
};

export const searchesDbMissingIsEnabled = {
  '30': {
    sid: '30',
    alias: 'KTM dirt bikes',
    rank: 85,
    sources: ['craigslist'],
    craigslistSearchDetails: {
      searchTerms: ['search1', 'search2'],
      regions: ['sf bayarea', 'inland empire'],
      craigslistSubcategories: ['tools', 'motorcycles'],
    },
  },
};

export const searchesDbWrongTypeIsEnabled = {
  '31': {
    sid: '31',
    alias: 'KTM dirt bikes',
    isEnabled: 1234,
    rank: 85,
    sources: ['craigslist'],
    craigslistSearchDetails: {
      searchTerms: ['search1', 'search2'],
      regions: ['sf bayarea', 'inland empire'],
      craigslistSubcategories: ['tools', 'motorcycles'],
    },
  },
};

export const searchesDbMissingRank = {
  '35': {
    sid: '35',
    alias: 'KTM dirt bikes',
    isEnabled: true,
    sources: ['craigslist'],
    craigslistSearchDetails: {
      searchTerms: ['search1', 'search2'],
      regions: ['sf bayarea', 'inland empire'],
      craigslistSubcategories: ['tools', 'motorcycles'],
    },
  },
};

export const searchesDbWrongTypeRank = {
  '36': {
    sid: '36',
    alias: 'KTM dirt bikes',
    isEnabled: true,
    rank: '1234',
    sources: ['craigslist'],
    craigslistSearchDetails: {
      searchTerms: ['search1', 'search2'],
      regions: ['sf bayarea', 'inland empire'],
      craigslistSubcategories: ['tools', 'motorcycles'],
    },
  },
};

export const searchesDbMissingSources = {
  '40': {
    sid: '40',
    alias: 'KTM dirt bikes',
    isEnabled: true,
    rank: 85,
    craigslistSearchDetails: {
      searchTerms: ['search1', 'search2'],
      regions: ['sf bayarea', 'inland empire'],
      craigslistSubcategories: ['tools', 'motorcycles'],
    },
  },
};

export const searchesDbInvalidSources = {
  '41': {
    sid: '41',
    alias: 'KTM dirt bikes',
    isEnabled: true,
    rank: 85,
    sources: ['poop'],
    craigslistSearchDetails: {
      searchTerms: ['search1', 'search2'],
      regions: ['sf bayarea', 'inland empire'],
      craigslistSubcategories: ['tools', 'motorcycles'],
    },
  },
};
