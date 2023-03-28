export const valid = {
  '5': {
    sid: '5',
    alias: 'KTM dirt bikes ',
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

export const sidMissing = {
  '5': {
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

export const sidWrongType = {
  '5': {
    sid: 1234,
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

export const sidHasNoValue = {
  '5': {
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

export const aliasMissing = {
  '5': {
    sid: '5',
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

export const aliasWrongType = {
  '5': {
    sid: '5',
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

export const aliasHasNoValue = {
  '5': {
    sid: '5',
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
