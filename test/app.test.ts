import request from 'supertest';

import app from '../src/app';

describe('GET /', () => {
  it('responds with a use rest message', (done) => {
    request(app).get('/').expect('Content-Type', /html/).expect(200, {}, done);
  });
});

// describe('actual', () => {
//   // Test actual URL rather than app
//   it('does something', (done) => {
//     request('http://localhost:3036/')
//       .get('/')
//       .set('Accept', 'application/json')
//       .expect('Content-Type', /html/)
//       .expect(200, {}, done);
//   });
// });
