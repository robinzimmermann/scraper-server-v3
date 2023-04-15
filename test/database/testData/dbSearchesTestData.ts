export const valid = {
  '5': {
    sid: '5',
    alias: 'KTM dirt bikes',
    isEnabled: true,
    rank: 85,
    sources: ['craigslist'],
    craigslistSearchDetails: {
      searchTerms: ['search1', 'search2'],
      regions: ['sf bayarea', 'inland empire'],
      subcategories: ['tools', 'motorcycles'],
    },
  },
  '6': {
    sid: '6',
    alias: 'demolition hammer',
    isEnabled: true,
    rank: 95,
    sources: ['facebook'],
    facebookSearchDetails: {
      searchTerms: ['search1', 'search2'],
      regionalDetails: [
        { region: 'reno', distance: 15 },
        { region: 'telluride', distance: 5 },
      ],
    },
  },
  '7': {
    sid: '7',
    alias: 'poloris',
    isEnabled: true,
    rank: 95,
    sources: ['craigslist', 'facebook'],
    craigslistSearchDetails: {
      searchTerms: ['search1', 'search2'],
      regions: ['sf bayarea', 'inland empire'],
      subcategories: ['tools', 'motorcycles'],
    },
    facebookSearchDetails: {
      searchTerms: ['search1', 'search2'],
      regionalDetails: [
        { region: 'reno', distance: 15 },
        { region: 'telluride', distance: 5 },
      ],
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
      regions: ['sf bayarea', 'inland empire'],
      subcategories: ['tools', 'motorcycles'],
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
      regions: ['sf bayarea', 'inland empire'],
      subcategories: ['tools', 'motorcycles'],
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
      regions: ['sf bayarea', 'inland empire'],
      subcategories: ['tools', 'motorcycles'],
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
      regions: ['sf bayarea', 'inland empire'],
      subcategories: ['tools', 'motorcycles'],
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
      regions: ['sf bayarea', 'inland empire'],
      subcategories: ['tools', 'motorcycles'],
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
      regions: ['sf bayarea', 'inland empire'],
      subcategories: ['tools', 'motorcycles'],
    },
  },
};

export const isEnabledMissing = {
  '5': {
    sid: '5',
    alias: 'KTM dirt bikes',
    rank: 85,
    sources: ['craigslist'],
    craigslistSearchDetails: {
      searchTerms: ['search1', 'search2'],
      regions: ['sf bayarea', 'inland empire'],
      subcategories: ['tools', 'motorcycles'],
    },
  },
};

export const isEnabledWrongType = {
  '5': {
    sid: '5',
    alias: 'KTM dirt bikes',
    isEnabled: 1234,
    rank: 85,
    sources: ['craigslist'],
    craigslistSearchDetails: {
      searchTerms: ['search1', 'search2'],
      regions: ['sf bayarea', 'inland empire'],
      subcategories: ['tools', 'motorcycles'],
    },
  },
};

export const enabledSearches = {
  '60': {
    sid: '60',
    alias: 'KTM dirt bikes',
    isEnabled: true,
    rank: 20,
    sources: ['craigslist'],
    craigslistSearchDetails: {
      searchTerms: ['search1', 'search2'],
      regions: ['sf bayarea', 'inland empire'],
      subcategories: ['motorcycles'],
    },
  },
  '61': {
    sid: '61',
    alias: 'demolition hammer',
    isEnabled: true,
    rank: 10,
    sources: ['craigslist'],
    craigslistSearchDetails: {
      searchTerms: ['demolition hammer'],
      regions: ['sf bayarea'],
      subcategories: ['tools'],
    },
  },
  '62': {
    alias: 'invalid search',
    isEnabled: true,
    rank: 10,
    sources: ['craigslist'],
    craigslistSearchDetails: {
      searchTerms: ['demolition hammer'],
      regions: ['sf bayarea'],
      subcategories: ['tools'],
    },
  },
  '63': {
    sid: '63',
    rank: 10,
    sources: ['craigslist'],
    craigslistSearchDetails: {
      searchTerms: ['demolition hammer'],
      regions: ['sf bayarea'],
      subcategories: ['tools'],
    },
  },
};
