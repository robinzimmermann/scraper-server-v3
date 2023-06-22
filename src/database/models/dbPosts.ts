import { Source, CraigslistSubcategory, CraigslistRegion, FacebookRegion } from './dbSearches';

export enum PostStatus {
  new = 'new',
  backlog = 'backlog',
  tier1 = 'tier1',
  tier2 = 'tier2',
  tier3 = 'tier3',
  sold = 'sold',
  closed = 'closed',
}

export type CraiglistFields = {
  subcategories: CraigslistSubcategory[];
};

export type Post = {
  pid: string;
  sid: string;
  source: Source;
  regions: (CraigslistRegion | FacebookRegion)[];
  searchTerms: string[];
  url: string;
  status: PostStatus;
  title: string;
  postDate: string; // 2022-12-07
  price: number;
  priceStr: string;
  hood: string;
  thumbnailUrl: string;
  rank: number;
  extras?: CraiglistFields;
};

// pid: string;
// sid: string;
// title: string;
// postDate: string;
// price: number;
// priceStr: string;
// hood: string;
// thumbnailUrl: string | null;
// searchAlias: string;
// source: Source;
// regions: Region[];
// searchTerms: string[];
// url: string;
// updateDate?: string;
// hoursToHood?: number;
// engineHours?: number;
// status: PostStatus;
// lastStatusBeforeClosed: PostStatus;
// isLongGone: boolean;
// year?: number;
// rank?: number;
// notes?: string;
// isTrash?: boolean;
// log: string[];
// clSubcategories: CraigslistSubcategory[];
// cc?: number;

export type Posts = {
  [pid: string]: Post;
};
