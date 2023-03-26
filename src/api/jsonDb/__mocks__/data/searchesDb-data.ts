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
      craigslistSubcategories: ['tools', 'motorcycles'],
      regions: ['sf bayarea', 'inland empire'],
    },
  },

  // no sid
  '10': {
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

  // sid is empty
  '11': {
    sid: '',
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

  // sid doesn't match parent property
  '12': {
    sid: '99',
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

  // no alias
  '15': {
    sid: '15',
    isEnabled: true,
    rank: 85,
    sources: ['craigslist'],
    craigslistSearchDetails: {
      searchTerms: ['search1', 'search2'],
      craigslistSubcategories: ['tools', 'motorcycles'],
      regions: ['sf bayarea', 'inland empire'],
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
      craigslistSubcategories: ['tools', 'motorcycles'],
      regions: ['sf bayarea', 'inland empire'],
    },
  },
};

export const searchesDbValid = {
  // valid configuration
  '5': {
    sid: '5',
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

export const searchesDbMissingSidElement = {
  // no sid
  '21': {
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

export const searchesDbEmptySid = {
  // sid is empty
  '22': {
    sid: '',
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

export const searchesDbSidElementDoesntMatch = {
  // sid doesn't match parent property
  '23': {
    sid: '99',
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

export const searchesDbMissingAlias = {
  // sid doesn't match parent property
  '25': {
    sid: '25',
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

export const searchesDbEmptyAlias = {
  // sid doesn't match parent property
  '26': {
    sid: '26',
    alias: '',
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

export const searchesDWrongTypeAlias = {
  // sid doesn't match parent property
  '27': {
    sid: '27',
    alias: 1234,
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
