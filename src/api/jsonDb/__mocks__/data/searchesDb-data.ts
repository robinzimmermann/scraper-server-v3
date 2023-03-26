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
      craigslistSubcategories: ['tools', 'motorcycles'],
      regions: ['sf bayarea', 'inland empire'],
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
      craigslistSubcategories: ['tools', 'motorcycles'],
      regions: ['sf bayarea', 'inland empire'],
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
      craigslistSubcategories: ['tools', 'motorcycles'],
      regions: ['sf bayarea', 'inland empire'],
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
*/

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

export const searchesDbSidElementDoesntMatch = {
  // sid doesn't match parent property
  '9': {
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

export const searchesDbMissingSid = {
  // missing: sid
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

// export const searchesDbWrongTypeSid = {
//   // wrong type: sid
//   '22': {
//     sid: 22,
//     alias: 'KTM dirt bikes',
//     isEnabled: true,
//     rank: 85,
//     sources: ['craigslist'],
//     craigslistSearchDetails: {
//       searchTerms: ['search1', 'search2'],
//       craigslistSubcategories: ['tools', 'motorcycles'],
//       regions: ['sf bayarea', 'inland empire'],
//     },
//   },
// };

// export const searchesDbEmptySid = {
//   // sid is empty
//   '23': {
//     sid: '',
//     alias: 'KTM dirt bikes',
//     isEnabled: true,
//     rank: 85,
//     sources: ['craigslist'],
//     craigslistSearchDetails: {
//       searchTerms: ['search1', 'search2'],
//       craigslistSubcategories: ['tools', 'motorcycles'],
//       regions: ['sf bayarea', 'inland empire'],
//     },
//   },
// };

export const searchesDbMissingAlias = {
  // missing alias
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

export const searchesDbWrongTypeAlias = {
  // alias is the wrong type
  '26': {
    sid: '26',
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
export const searchesDbEmptyAlias = {
  // sid doesn't match parent property
  '27': {
    sid: '27',
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

export const searchesDbMissingIsEnabled = {
  // missing isEnabled
  '30': {
    sid: '30',
    alias: 'KTM dirt bikes',
    rank: 85,
    sources: ['craigslist'],
    craigslistSearchDetails: {
      searchTerms: ['search1', 'search2'],
      craigslistSubcategories: ['tools', 'motorcycles'],
      regions: ['sf bayarea', 'inland empire'],
    },
  },
};

export const searchesDbWrongTypeIsEnabled = {
  // sid doesn't match parent property
  '31': {
    sid: '31',
    alias: 'KTM dirt bikes',
    isEnabled: 1234,
    rank: 85,
    sources: ['craigslist'],
    craigslistSearchDetails: {
      searchTerms: ['search1', 'search2'],
      craigslistSubcategories: ['tools', 'motorcycles'],
      regions: ['sf bayarea', 'inland empire'],
    },
  },
};
