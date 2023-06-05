import fs from 'fs';
import { ok, err, Result } from 'neverthrow';
import chalk from 'chalk';

import JsonDb from '../api/jsonDb/lowdbDriver';
import * as dbPosts from '../database/dbPosts';
import * as dbSearches from '../database/dbSearches';
import * as dbUserPrefs from '../database/dbUserPrefs';
import { dbDir } from '../globals';
import { logger } from '../../src/utils/logger/logger';
import { Posts } from './models/dbPosts';
import {
  CraigslistRegion,
  CraigslistSubcategory,
  FacebookRegion,
  Search,
  Searches,
  Source,
} from './models/dbSearches';
import { UserPrefs } from './models/dbUserPrefs';

export type ErrorWarnings = {
  errors?: string[];
  warnings?: string[];
};

export const initAllDbs = (): Result<boolean, string[]> => {
  if (!fs.existsSync(dbDir)) {
    logger.warn(`database directory doesn't exist, creating it: ${chalk.bold(dbDir)}`);
    fs.mkdirSync(dbDir, { recursive: true });
  }
  const errors = [] as string[];

  const searchesDb = JsonDb<Searches>();
  searchesDb.setCacheDir(`${dbDir}/dbSearches.json`);
  const searchesResult = dbSearches.init(searchesDb);

  if (searchesResult.isErr()) {
    logger.error(`one or more errors in ${dbDir}/dbSearches.json`);
    searchesResult.mapErr((messages: string[]) =>
      messages.forEach((msg) => logger.error(chalk.red(msg))),
    );
  }

  const postsDb = JsonDb<Posts>();
  postsDb.setCacheDir(`${dbDir}/dbPosts.json`);
  const postsResult = dbPosts.init(postsDb);

  if (postsResult.isErr()) {
    logger.error(`one or more errors in ${dbDir}/dbPosts.json`);
    postsResult.mapErr((messages: string[]) =>
      messages.forEach((msg) => logger.error(chalk.red(msg))),
    );
  }

  const userPrefsDb = JsonDb<UserPrefs>();
  userPrefsDb.setCacheDir(`${dbDir}/dbUserPrefs.json`);
  const userPrefsResult = dbUserPrefs.init(userPrefsDb);

  if (userPrefsResult.isErr()) {
    logger.error(`one or more errors in ${dbDir}/dbUserPrefs.json`);
    userPrefsResult.mapErr((messages: string[]) =>
      messages.forEach((msg) => logger.error(chalk.red(msg))),
    );
  }

  if (searchesResult.isErr() || postsResult.isErr() || userPrefsResult.isErr()) {
    return err(errors);
  } else {
    const addSearchResult1 = dbSearches.add(<Search>{
      alias: 'search-1',
      isEnabled: true,
      rank: 50,
      sources: [Source.craigslist],
      craigslistSearchDetails: {
        searchTerms: ['demo hammer'],
        regions: [CraigslistRegion.merced],
        subcategories: [CraigslistSubcategory.tools],
      },
      log: ['first'],
    });
    if (addSearchResult1.isErr()) {
      logger.warn(`got an error withg dbSearches: ${addSearchResult1.error}`);
    }
    const addSearchResult2 = dbSearches.add(<Search>{
      alias: 'search-2',
      isEnabled: true,
      rank: 60,
      sources: [Source.craigslist],
      craigslistSearchDetails: {
        searchTerms: ['jackhammer'],
        regions: [CraigslistRegion.merced],
        subcategories: [CraigslistSubcategory.tools],
      },
      log: ['first comment'],
    });
    if (addSearchResult2.isErr()) {
      logger.warn(`got an error withg dbSearches: ${addSearchResult2.error}`);
    }

    const result = dbPosts.upsert(
      '123',
      '1',
      Source.facebook,
      FacebookRegion.losAngeles,
      'demo hammer',
      'good demolition hammer',
      '2023-05-05',
      299,
      'nearby',
      'http://thumbnails.org/555',
    );
    if (result.isErr()) {
      logger.debug(`got an error withg dbPosts: ${result.error}`);
    }

    const upResults = dbUserPrefs.upsert(<UserPrefs>{
      isUndoing: true,
      displayMinimalPostcards: false,
      searchPrefs: {
        '1': {
          sid: '1',
          showInHeader: true,
          isSelected: true,
        },
        '2': {
          sid: '2',
          showInHeader: true,
          isSelected: true,
        },
      },
    });
    if (upResults.isErr()) {
      logger.debug(`got an error with UserPrefs: ${upResults.error}`);
    }

    return ok(true);
  }

  // export const upsertPost = (
  //   pid: string,
  //   sid: string,
  //   source: Source,
  //   region: CraigslistRegion | FacebookRegion,
  //   searchTerm: string,
  //   title: string,
  //   postDate: string,
  //   price: number,
  //   hood: string,
  //   thumbnailUrl: string,
  //   extras?: CraiglistFields,
  // ): Result<Post, string[]> => {
};
