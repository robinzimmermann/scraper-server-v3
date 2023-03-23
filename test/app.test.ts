import request from 'supertest';

import app from '../src/app';

describe('app', () => {
  // it('responds with a use rest message', (done) => {
  //   request(app)
  //     .get('/what-is-this-even')
  //     .set('Accept', 'application/json')
  //     .expect('Content-Type', /html/)
  //     .expect((response) => {
  //       console.log('text=', response.text);
  //       return response.text.includes('friendpoo');
  //     })
  //     .expect(200, done);
  // });

  it('blahs', async () => {
    const resp = await request(app).get('/what-is-this-even');
    console.log(`resp.text=${resp.text},${resp.text.includes('friend')},`);
    console.log(`Content-Type=${resp.get('Content-Type')}`);
    console.log(`Content-Length=${resp.get('Content-Length')}`);
    console.log(`resp.status=${resp.status}`);
    console.log(`resp.body.errors=${resp.body.errors}`);
    console.log(`headers=${JSON.stringify(resp.headers)}`);
    expect(resp.status).toBe(200);
    // console.log(`resp.AAA=${resp.AAA}`);
    // expect('Content-Type', /html/)
    // .end((err, res) => {
    //   if (err) {
    //     return done(err);
    //   }
    //   console.log('res.body.message=', res.body.message);
    //   expect(res.body.message).toBe('success');
    //   return done();
    // });
  });
});

describe('GET /', () => {
  it('responds with a use rest message', (done) => {
    request(app)
      .get('/')
      .set('Accept', 'application/json')
      .expect('Content-Type', /html/)
      .expect(200, {}, done);
  });
});

describe.skip('actual', () => {
  // Test actual URL rather than app
  it('does something', (done) => {
    request('http://localhost:3036/what')
      .get('/')
      .set('Accept', 'application/json')
      .expect('Content-Type', /html/)
      .expect(200, {}, done);
  });
});
