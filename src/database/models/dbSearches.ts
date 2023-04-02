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

export const getCraigslistSubcategoryCode = (
  subcategory: CraigslistSubcategory,
): string => {
  switch (subcategory) {
    case CraigslistSubcategory.all:
      return 'sss';
    case CraigslistSubcategory.antiques:
      return 'ata';
    case CraigslistSubcategory.appliances:
      return 'ppa';
    case CraigslistSubcategory.artsCrafts:
      return 'ara';
    case CraigslistSubcategory.atvsUtvsSnow:
      return 'sna';
    case CraigslistSubcategory.autoParts:
      return 'pta';
    case CraigslistSubcategory.autoWheelsAndTires:
      return 'wta';
    case CraigslistSubcategory.aviation:
      return 'ava';
    case CraigslistSubcategory.babyKids:
      return 'baa';
    case CraigslistSubcategory.barter:
      return 'bar';
    case CraigslistSubcategory.beautyHealth:
      return 'haa';
    case CraigslistSubcategory.bikeParts:
      return 'bip';
    case CraigslistSubcategory.bikes:
      return 'bia';
    case CraigslistSubcategory.boatParts:
      return 'bpa';
    case CraigslistSubcategory.boats:
      return 'boo';
    case CraigslistSubcategory.books:
      return 'bka';
    case CraigslistSubcategory.business:
      return 'bfa';
    case CraigslistSubcategory.carsAndTrucks:
      return 'cta';
    case CraigslistSubcategory.cdsDvdVhs:
      return 'ema';
    case CraigslistSubcategory.cellPhones:
      return 'moa';
    case CraigslistSubcategory.clothesAcc:
      return 'cla';
    case CraigslistSubcategory.collectible:
      return 'cba';
    case CraigslistSubcategory.computerParts:
      return 'syp';
    case CraigslistSubcategory.computers:
      return 'sya';
    case CraigslistSubcategory.electronics:
      return 'ela';
    case CraigslistSubcategory.farmGarden:
      return 'gra';
    case CraigslistSubcategory.freeStuff:
      return 'zip';
    case CraigslistSubcategory.furniture:
      return 'fua';
    case CraigslistSubcategory.garageSale:
      return 'gms';
    case CraigslistSubcategory.general:
      return 'foa';
    case CraigslistSubcategory.heavyEquip:
      return 'hva';
    case CraigslistSubcategory.household:
      return 'hsa';
    case CraigslistSubcategory.jewelry:
      return 'jwa';
    case CraigslistSubcategory.materials:
      return 'maa';
    case CraigslistSubcategory.motorcycleParts:
      return 'mpa';
    case CraigslistSubcategory.motorcycles:
      return 'mca';
    case CraigslistSubcategory.musicInstr:
      return 'msa';
    case CraigslistSubcategory.photoVideo:
      return 'pha';
    case CraigslistSubcategory.RVs:
      return 'rva';
    case CraigslistSubcategory.sporting:
      return 'sga';
    case CraigslistSubcategory.tickets:
      return 'tia';
    case CraigslistSubcategory.tools:
      return 'tla';
    case CraigslistSubcategory.toysGames:
      return 'taa';
    case CraigslistSubcategory.trailers:
      return 'tra';
    case CraigslistSubcategory.videoGaming:
      return 'vga';
    case CraigslistSubcategory.wanted:
      return 'waa';
  }
};

export enum CraigslistRegion {
  sfBayArea = 'sf bayarea',
  losAngeles = 'los angeles',
  inlandEmpire = 'inland empire',
  sacramento = 'sacramento',
  stockton = 'stockton',
  reno = 'reno',
  merced = 'merced',
  modesto = 'modesto',
  santabarbara = 'santa barbara',
  westernSlope = 'western slope',
}

export const getCraigslistBaseUrl = (region: CraigslistRegion): string => {
  switch (region) {
    case CraigslistRegion.sfBayArea:
      return 'sfbay.craigslist.org';
    case CraigslistRegion.losAngeles:
      return 'losangeles  .craigslist.org';
    case CraigslistRegion.inlandEmpire:
      return 'inlandempire.craigslist.org';
    case CraigslistRegion.sacramento:
      return 'sacramento.craigslist.org';
    case CraigslistRegion.stockton:
      return 'stockton  .craigslist.org';
    case CraigslistRegion.reno:
      return 'reno.craigslist.org';
    case CraigslistRegion.merced:
      return 'merced.craigslist.org';
    case CraigslistRegion.modesto:
      return 'modesto.craigslist.org';
    case CraigslistRegion.santabarbara:
      return 'santabarbara.craigslist.org';
    case CraigslistRegion.westernSlope:
      return 'westslope.craigslist.org';
  }
};

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

// export type FacebookRegionDetail = {
//   [FacebookRegion.walnutCreek]: '112840708726711';
//   [FacebookRegion.reno]: '115759591771016';
//   [FacebookRegion.losAngeles]: 'la';
//   [FacebookRegion.telluride]: '104096459626530';
// };

export const getFacebookLocation = (region: FacebookRegion): string => {
  switch (region) {
    case FacebookRegion.walnutCreek:
      return '112840708726711';
    case FacebookRegion.reno:
      return '115759591771016';
    case FacebookRegion.losAngeles:
      return 'la';
    case FacebookRegion.telluride:
      return '104096459626530';
  }
};
export type FacebookRadius2 = {
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
export enum FacebookRadius {
  dist1 = '1 mile',
  dist2 = '2 miles',
  dist3 = '5 miles',
  dist10 = '10 miles',
  dist20 = '20 miles',
  dist40 = '40 miles',
  dist60 = '60 miles',
  dist80 = '80 miles',
  dist100 = '100 miles',
  dist250 = '250 miles',
  dist500 = '500 miles',
}

// export type SourceDetails = {
//   [sourceName: string]: {
//     sourceName: string;
//   };
// };

export type CraigslistSearchDetails = {
  searchTerms: string[];
  regions: CraigslistRegion[];
  craigslistSubcategories: CraigslistSubcategory[];
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
