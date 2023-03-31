export enum Source {
  craigslist = 'craigslist',
  facebook = 'facebook',
}

export enum CraigslistSubcategory {
  all = 'all',
  antiques = 'antiques',
  appliances = 'appliances',
  artsCrafts = 'arts+crafts',
  atvsUtvsSnow = 'atvs/utvs/snow',
  autoParts = 'auto parts',
  autoWheelsAndTires = 'auto wheels & tires',
  aviation = 'aviation',
  babyKids = 'baby+kids',
  barter = 'barter',
  beautyHealth = 'beauty+hlth',
  bikeParts = 'bike parts',
  bikes = 'bikes',
  boatParts = 'boat parts',
  boats = 'boats',
  books = 'books',
  business = 'business',
  carsAndTrucks = 'cars+trucks',
  cdsDvdVhs = 'cds/dvd/vhs',
  cellPhones = 'cell phones',
  clothesAcc = 'clothes+acc',
  collectible = 'collectibles',
  computerParts = 'computer parts',
  computers = 'computers',
  electronics = 'electronics',
  farmGarden = 'farm+garden',
  freeStuff = 'free stuff',
  furniture = 'furniture',
  garageSale = 'garage sales',
  general = 'general',
  heavyEquip = 'heavy equipment',
  household = 'household',
  jewelry = 'jewelry',
  materials = 'materials',
  motorcycleParts = 'motorcycle parts',
  motorcycles = 'motorcycles',
  musicInstr = 'music instr',
  photoVideo = 'photo+video',
  RVs = 'RVs',
  sporting = 'sporting',
  tickets = 'tickets',
  tools = 'tools',
  toysGames = 'toys+games',
  trailers = 'trailers',
  videoGaming = 'video gaming',
  wanted = 'wanted',
}

export enum CraigslistRegion {
  sfBayArea = 'sf bayarea',
  westernSlope = 'western slope',
  losAngeles = 'los angeles',
  inlandEmpire = 'inland empire',
  sacramento = 'sacramento',
  stockton = 'stockton',
  reno = 'reno',
  merced = 'merced',
  modesto = 'modesto',
  santabarbara = 'santa barbara',
}

export type CraigslistRegionDetail = {
  [CraigslistRegion.sfBayArea]: 'sfbay.craigslist.org';
  [CraigslistRegion.losAngeles]: 'sacramento.craigslist.org';
  [CraigslistRegion.inlandEmpire]: 'inlandempire.craigslist.org';
  [CraigslistRegion.westernSlope]: 'westslope.craigslist.org';
};

// export type FacebookRegion = {
//   sfBayArea: {
//     name: 'sf bayarea';
//     mapCenter: '109449385747832';
//   };
//   losAngeles: {
//     name: 'los angeles';
//     mapCenter: '449310985747832';
//   };
//   sacramento: {
//     name: 'sacramento';
//     mapCenter: '747832109449385';
//   };
//   stockton: {
//     name: 'stockton';
//     mapCenter: '944938574783210';
//   };
//   reno: {
//     name: 'reno';
//     mapCenter: '385747832109449';
//   };
// };

export enum FacebookRegion {
  walnutCreek = 'walnut creek',
  losAngeles = 'los angeles',
  reno = 'reno',
  telluride = 'telluride',
}

export type FacebookRegionDetail = {
  [FacebookRegion.walnutCreek]: '112840708726711';
  [FacebookRegion.reno]: '115759591771016';
  [FacebookRegion.losAngeles]: 'la';
  [FacebookRegion.telluride]: '104096459626530';
};

export type FacebookRadius = {
  '1 mile': 1;
  '2 miles': 2;
  '5 miles': 5;
  '10 miles': 10;
  '20 miles': 20;
  '40 miles': 40;
  '60 miles': 60;
  '80 miles': 80;
  '100 miles': 100;
  '250 miles': 250;
  '500 miles': 500;
};

// export type SourceDetails = {
//   [sourceName: string]: {
//     sourceName: string;
//   };
// };

export type CraigslistSearchDetails = {
  searchTerms: string[];
  craigslistSubcategories: CraigslistSubcategory[];
  regions: CraigslistRegion[];
};

export type FacebookSearchRegionDetails = {
  region: FacebookRegion;
  distance: FacebookRadius;
};

export type FacebookSearchDetails = {
  searchTerms: string[];
  regionalDetails: FacebookSearchRegionDetails[];
};

export type Search = {
  sid: string; //search id
  alias: string; // common search term name that applies to all sources
  isEnabled: boolean; // whether this will be included in the next search
  rank: number;
  minPrice?: number;
  maxPrice?: number;
  sources: Source[]; // list of sources this search should use
  craigslistSearchDetails?: CraigslistSearchDetails;
  facebookSearchDetails?: FacebookSearchDetails;
  log?: string[];
};

export type Searches = {
  [sid: string]: Search;
};
