import request from 'supertest';
import { jest } from '@jest/globals';
import 'jest-extended';

import app from '../../src/app';
import JsonDb from '../../src/api/jsonDb/lowdbDriver';
import { Searches } from '../../src/database/models/dbSearches';

import * as dbSearches from '../../src/database/dbSearches';

jest.mock('../../src/api/jsonDb/lowdbDriver');

let searchesDb = JsonDb<Searches>();

const initializeJest = (): void => {
  jest.clearAllMocks();
  searchesDb = JsonDb<Searches>();

  const baseSearches = <Searches>{
    '401': {
      sid: '401',
      alias: 'demo hammer',
      isEnabled: true,
      rank: 50,
      sources: ['craigslist', 'facebook'],
      craigslistSearchDetails: {
        searchTerms: ['demo hammer', 'jackhammer'],
        regions: ['sf bayarea', 'reno'],
        subcategories: ['tools'],
      },
      facebookSearchDetails: {
        searchTerms: ['demo hammer'],
        regionalDetails: [
          {
            region: 'walnut creek',
            distance: '20 miles',
          },
        ],
      },
    },
  };

  searchesDb.setCacheDir(JSON.stringify(baseSearches));
  dbSearches.init(searchesDb);
};

describe('/api', () => {
  it('/api responds with an error', async () => {
    await request(app).get('/api').expect('Content-Type', /json/).expect(400);
  });

  it('/api/rubbish responds with an error', async () => {
    await request(app).get('/api/rubbish').expect('Content-Type', /json/).expect(400);
  });
});

describe('/api/v1', () => {
  it('v1 api responds with a json message', async () => {
    await request(app)
      .get('/api/v1')
      .expect(400, { status: 400, message: 'the v1 api is old, baby' })
      .expect('Content-Type', /json/);
  });

  it('non-existant v1 api responds with a json message', async () => {
    await request(app)
      .get('/api/v1/rubbish')
      .expect(400, { status: 400, message: 'the v1 api is old, baby' })
      .expect('Content-Type', /json/);
  });
});

describe('/api/v2', () => {
  it('v2 api responds with a json message', async () => {
    await request(app)
      .get('/api/v2')
      .expect(400, { status: 400, message: 'the v2 api is old, baby' })
      .expect('Content-Type', /json/);
  });

  it('non-existant v2 api responds with a json message', async () => {
    await request(app)
      .get('/api/v2/rubbish')
      .expect(400, { status: 400, message: 'the v2 api is old, baby' })
      .expect('Content-Type', /json/);
  });
});

describe('/api/v3', () => {
  beforeEach(() => {
    initializeJest();
  });

  test('GET /searches', async () => {
    const res = await request(app).get('/api/v3/searches');

    const desiredResponse = {
      searches: {
        '401': { sid: '401' },
      },
    };

    expect(res.status).toEqual(200);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toMatchObject(desiredResponse);
  });

  test('put /searches/:sid (insert)', async () => {
    const reqPayload = {
      sid: '802',
      alias: 'demo hammer',
      isEnabled: true,
      rank: 51,
      sources: ['craigslist', 'facebook'],
      craigslistSearchDetails: {
        searchTerms: ['demo hammer', 'jackhammer'],
        regions: ['sf bayarea', 'reno'],
        subcategories: ['tools'],
      },
      facebookSearchDetails: {
        searchTerms: ['demo hammer'],
        regionalDetails: [
          {
            region: 'walnut creek',
            distance: '20 miles',
          },
        ],
      },
    };

    const res = await request(app).put('/api/v3/searches/802').send(reqPayload);

    const desiredResponse = {
      success: true,
      search: {
        sid: '802',
        rank: 51,
      },
    };

    expect(res.status).toEqual(200);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toMatchObject(desiredResponse);

    expect(dbSearches.getSearches()).toContainAllKeys(['401', '802']);
  });

  test('put /searches/:sid (update)', async () => {
    const reqPayload = {
      sid: '401',
      alias: 'demo hammer',
      isEnabled: true,
      rank: 51,
      sources: ['craigslist', 'facebook'],
      craigslistSearchDetails: {
        searchTerms: ['demo hammer', 'jackhammer'],
        regions: ['sf bayarea', 'reno'],
        subcategories: ['tools'],
      },
      facebookSearchDetails: {
        searchTerms: ['demo hammer'],
        regionalDetails: [
          {
            region: 'walnut creek',
            distance: '20 miles',
          },
        ],
      },
    };

    const res = await request(app).put('/api/v3/searches/401').send(reqPayload);

    const desiredResponse = {
      success: true,
      search: {
        sid: '401',
        rank: 51,
      },
    };

    expect(res.status).toEqual(200);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toMatchObject(desiredResponse);

    expect(dbSearches.getSearches()).toContainAllKeys(['401']);
  });

  test('put /searches/:sid (invalid)', async () => {
    const reqPayload = {
      sid: '401',
      alias: 'demo hammer',
      isEnabled: true,
      rank: 'DUMMY',
      sources: ['craigslist', 'facebook'],
      craigslistSearchDetails: {
        searchTerms: ['demo hammer', 'jackhammer'],
        regions: ['sf bayarea', 'reno'],
        subcategories: ['tools'],
      },
      facebookSearchDetails: {
        searchTerms: ['demo hammer'],
        regionalDetails: [
          {
            region: 'walnut creek',
            distance: '20 miles',
          },
        ],
      },
    };

    const res = await request(app).put('/api/v3/searches/401').send(reqPayload);

    const desiredResponse = {
      success: false,
      reason: expect.toIncludeMultiple(['401', 'rank', 'DUMMY', 'number']),
    };

    expect(res.status).toEqual(400);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toMatchObject(desiredResponse);

    const search = dbSearches.getSearchBySid('401');
    if (search) {
      expect(search.rank).toBe(50);
    } else {
      expect(search).toBeDefined();
    }
  });
});
