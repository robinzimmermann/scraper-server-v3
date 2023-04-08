import request from 'supertest';

import app from '../src/app';

describe('/api', () => {
  it('/api responds with an error', (done) => {
    request(app).get('/api').expect('Content-Type', /json/).expect(400, done);
  });

  it('/api/rubbish responds with an error', (done) => {
    request(app)
      .get('/api/rubbish')
      .expect('Content-Type', /json/)
      .expect(400, done);
  });
});

describe('/api/v1', () => {
  it('v1 api responds with a json message', (done) => {
    request(app)
      .get('/api/v1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400, { status: 400, message: 'the v1 api is old, baby' }, done);
  });

  it('non-existant v1 api responds with a json message', (done) => {
    request(app)
      .get('/api/v1/rubbish')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400, { status: 400, message: 'the v1 api is old, baby' }, done);
  });
});

describe('/api/v2', () => {
  it('v2 api responds with a json message', (done) => {
    request(app)
      .get('/api/v2')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400, { status: 400, message: 'the v2 api is old, baby' }, done);
  });

  it('non-existant v2 api responds with a json message', (done) => {
    request(app)
      .get('/api/v2/rubbish')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400, { status: 400, message: 'the v2 api is old, baby' }, done);
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
