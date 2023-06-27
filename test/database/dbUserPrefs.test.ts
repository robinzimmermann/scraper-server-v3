import { jest } from '@jest/globals';
import 'jest-extended';
import { SpiedFunction } from 'jest-mock';

import JsonDb from '../../src/api/jsonDb/lowdbDriver';
import { Searches } from '../../src/database/models/dbSearches';
import * as dbUserPrefs from '../../src/database/dbUserPrefs';
import * as dbSearches from '../../src/database/dbSearches';
import { UserPrefs } from '../../src/database/models/dbUserPrefs';

// TODO Add a test the fails if you reference a missing search

jest.mock('../../src/api/jsonDb/lowdbDriver');

let userPrefsDb = JsonDb<UserPrefs>();
let writeSpy: SpiedFunction<() => void>;

const searchesDb = JsonDb<Searches>();
const searchesDbData = {
  '1': {
    sid: '1',
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
  '2': {
    sid: '2',
    alias: 'demo hammer',
    isEnabled: true,
    rank: 95,
    sources: ['facebook'],
    facebookSearchDetails: {
      searchTerms: ['hammer1', 'hammer2'],
      regionalDetails: [
        { region: 'reno', distance: '20 miles' },
        { region: 'telluride', distance: '5 miles' },
      ],
    },
  },
};

const initializeJest = (): void => {
  jest.clearAllMocks();
  userPrefsDb = JsonDb<UserPrefs>();
  writeSpy = jest.spyOn(userPrefsDb, 'write');
};

describe('dbUserPrefs initialization', () => {
  beforeAll(() => {
    searchesDb.setCacheDir(JSON.stringify(searchesDbData));
    const result = dbSearches.init(searchesDb);
    expect(result.isOk()).toBeTrue();
  });

  beforeEach(() => {
    initializeJest();
  });

  test('searchPrefs upsert works', () => {
    const initialFile = {
      isUndoing: false,
      displayMinimalPostcards: false,
      searchPrefs: {
        '1': {
          sid: '1',
          showInHeader: true,
          isSelected: true,
        },
      },
    };
    userPrefsDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbUserPrefs.init(userPrefsDb);
    expect(result.isOk()).toBeTrue();
    if (result.isOk()) {
      const upsertResult = dbUserPrefs.upsertUserPrefs(<UserPrefs>{
        isUndoing: true,
        displayMinimalPostcards: true,
        searchPrefs: {
          '2': {
            sid: '2',
            showInHeader: false,
            isSelected: false,
          },
        },
      });

      expect(upsertResult.isOk()).toBeTrue();
      const up = dbUserPrefs.getUserPrefs();

      const desiredResponse = <UserPrefs>{
        isUndoing: true,
        displayMinimalPostcards: true,
        searchPrefs: {
          '1': { sid: '1', showInHeader: true, isSelected: true },
          '2': { sid: '2', showInHeader: false, isSelected: false },
        },
      };

      expect(up).toMatchObject(desiredResponse);

      expect(writeSpy).toHaveBeenCalledTimes(1);
    } else {
      expect(result.isOk()).toBeTrue();
    }
  });
});
