import { Search } from '../../database/models/dbSearches';

export const rankComparator = (
  a: Search,
  b: Search,
  sortAsc = true,
): number => {
  if (a.rank === b.rank) {
    return 0;
  } else if (sortAsc) {
    return (a.rank ?? 999999) - (b.rank ?? 999999);
  } else {
    return (b.rank ?? 0) - (a.rank ?? 0);
  }
};
