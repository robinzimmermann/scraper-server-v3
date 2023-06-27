import { Posts } from '../../database/models/dbPosts';
import { Search, Searches } from '../../database/models/dbSearches';
import { UserPrefs } from '../../database/models/dbUserPrefs';

export type RES_SUCCESS = {
  success: boolean;
};

export type RES = {
  success: boolean;
  message?: string;
};

export type RES_FAILURE = {
  success: boolean;
  reason: string;
};

export type RES_SEARCHES = {
  searches: Searches;
};

export type RES_SEARCH = {
  success: boolean;
  search: Search;
  reason?: string;
};

export type RES_POSTS = {
  posts: Posts;
};

export type RES_USER_PREFS = {
  success: boolean;
  userPrefs: UserPrefs;
  reason?: string;
};
