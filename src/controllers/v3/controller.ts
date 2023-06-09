import { Request, Response } from 'express';

import { publicDir } from '../../globals';
import { RES, RES_POSTS, RES_SEARCH, RES_SEARCHES, RES_USER_PREFS } from './models';
import { UserPrefs } from '../../database/models/dbUserPrefs';
import * as dbSearches from '../../database/dbSearches';
import * as dbPosts from '../../database/dbPosts';
import * as dbUserPrefs from '../../database/dbUserPrefs';
import { removeAnsiCodes } from '../../utils/utils';
import { Search } from '../../database/models/dbSearches';

export const rootHandler = (_req: Request, res: Response): void => {
  res.sendFile(`${publicDir}/v3.html`);
};

export const getSearchesHandler = (_req: Request, res: Response): void => {
  const response: RES_SEARCHES = { searches: dbSearches.getSearches() };
  res.status(200).json(response);
};

export const upsertSearchHandler = (req: Request, res: Response): void => {
  const search = <Search>req.body;

  const result = dbSearches.upsertSearch(search);
  if (result.isOk()) {
    const response = <RES_SEARCH>{ success: true, search: result.value };
    // response.search.alias = response.search.alias + 'X';
    res.status(200).json(response);
  } else {
    const response = <RES_SEARCH>{
      success: false,
      search: req.body,
      reason: removeAnsiCodes(result.error),
    };
    res.status(400).json(response);
  }
};

export const deleteSearchHandler = (req: Request, res: Response): void => {
  const sid = req.params.sid;
  const result = dbSearches.deleteSearch(sid);
  if (result.isOk()) {
    const response = <RES>{ success: true };
    res.status(200).json(response);
  } else {
    const response = <RES>{
      success: false,
      reason: removeAnsiCodes(result.error),
    };
    res.status(400).json(response);
  }
};

export const getPostsHandler = (_req: Request, res: Response): void => {
  const response: RES_POSTS = { posts: dbPosts.getPosts() };
  res.status(200).json(response);
};

export const getUserPrefsHandler = (_req: Request, res: Response): void => {
  const response: RES_USER_PREFS = { success: true, userPrefs: dbUserPrefs.getUserPrefs() };
  res.status(200).json(response);
};

export const upsertUserPrefsHandler = (req: Request, res: Response): void => {
  const userPrefs = <UserPrefs>req.body;
  const result = dbUserPrefs.upsertUserPrefs(userPrefs);
  if (result.isOk()) {
    const response = <RES_USER_PREFS>{ success: true };
    res.status(200).json(response);
  } else {
    const response = <RES_USER_PREFS>{
      success: false,
      reason: removeAnsiCodes(result.error),
    };
    res.status(400).json(response);
  }
};

export const deadHandler = (_req: Request, res: Response): void => {
  res.status(400).json({ stuff: 'v3 dead request (' + _req.method + ')' });
};
