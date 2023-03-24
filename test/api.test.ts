import request from 'supertest';

import app from '../src/app';

describe.skip('GET /api/v1', () => {
  it('responds with a json message', (done) => {
    request(app)
      .get('/api/v1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400, { status: 400, message: 'the v1 api is old, baby' }, done);
    // .expect(
    //   200,
    //   {
    //     message: 'API - 👋🌎🌍🌏',
    //   },
    //   done,
    // );
  });
});

describe.skip('GET /api/v1/emojis', () => {
  it('responds with a json message', (done) => {
    request(app)
      .get('/api/v1/emojis')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400, { status: 400, message: 'the v1 api is old, baby' }, done);
    // .expect(200, ['😀', '😳', '🙄'], done);
  });
});

describe('/api/v3', () => {
  it('GET /isAlive', (done) => {
    request(app)
      .get('/api/v3/isAlive')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, { success: true }, done);
  });
});
