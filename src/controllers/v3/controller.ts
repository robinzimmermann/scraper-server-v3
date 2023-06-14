import { Request, Response } from 'express';

import { publicDir } from '../../globals';
import { RES_SEARCHES, RES_SUCCESS, RES_USER_PREFS } from './models';
import * as dbSearches from '../../database/dbSearches';
import * as dbUserPrefs from '../../database/dbUserPrefs';
import * as fetcher from '../../fetcher/fetcher';

export const rootHandler = (_req: Request, res: Response): void => {
  // res.status(200).send('v3 root');xxsxzz
  // res.sendFile(
  //   '/Users/rozimmermann/doc/2021.10.18_Craigslist-scraper/express-api-starter-ts/public/v3.html',
  // );
  res.sendFile(`${publicDir}/v3.html`);
};

export const getSearchesHandler = (_req: Request, res: Response): void => {
  const result: RES_SEARCHES = { searches: dbSearches.getSearches() };
  res.status(200).json(result);
};

export const getUserPrefsHandler = (_req: Request, res: Response): void => {
  const result: RES_USER_PREFS = { userPrefs: dbUserPrefs.getUserPrefs() };
  res.status(200).json(result);
};

export const isAliveHandler = (_req: Request, res: Response): void => {
  const result: RES_SUCCESS = { success: true };
  res.status(200).json(result);
};

export const startScanHandler = async (_req: Request, res: Response): Promise<void> => {
  await fetcher.doSearch();
  const result: RES_SUCCESS = { success: true };
  res.status(200).json(result);
};

export const exampleHandler = (_req: Request, res: Response): void => {
  res.status(200).json({ stuff: 'v3 example request' });
};

export const deadHandler = (_req: Request, res: Response): void => {
  res.status(400).json({ stuff: 'v3 dead request (' + _req.method + ')' });
};

// const exampleHandler = (req: Request, res: Response, next: NextFunction) => {
//     //Throwing some error
//     next(new HttpException(400,'Bad Request'));
// };
