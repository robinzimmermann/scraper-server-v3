import { Searches } from '../../database/models/dbSearches';
import { UserPrefs } from '../../database/models/dbUserPrefs';

export type RES_SUCCESS = {
  success: boolean;
};

export type RES_SEARCHES = {
  searches: Searches;
};

export type RES_USER_PREFS = {
  userPrefs: UserPrefs;
};
