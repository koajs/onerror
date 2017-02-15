'use strict';

const koa = require('koa');
const request = require('supertest');
const pedding = require('pedding');
const onerror = require('..');

describe('accepts.test.js', function() {
  it('should return json response', function(done) {
    done = pedding(2, done);
    const app = koa();
    app.on('error', function() {});
    onerror(app, {
      accepts() {
        if (this.url.indexOf('.json') > 0) {
          return 'json';
        }
        return 'text';
      },
    });
    app.use(commonError);

    request(app.callback())
    .get('/user.json')
    .set('Accept', '*/*')
    .expect(500)
    .expect('Content-Type', 'application/json; charset=utf-8')
    .expect({ error: 'foo is not defined' }, done);

    request(app.callback())
    .get('/user')
    .set('Accept', 'application/json')
    .expect(500)
    .expect('Content-Type', 'text/plain; charset=utf-8')
    .expect('foo is not defined', done);
  });

  it('should redrect when accepts type not json', function(done) {
    const app = koa();
    app.on('error', function() {});
    onerror(app, {
      accepts() {
        if (this.url.indexOf('.json') > 0) {
          return 'json';
        }
        return 'text';
      },
      redirect: 'http://foo.com/500.html',
    });
    app.use(commonError);

    request(app.callback())
    .get('/user')
    .set('Accept', '*/*')
    .expect('Content-Type', 'text/html; charset=utf-8')
    .expect('Location', 'http://foo.com/500.html')
    .expect('Redirecting to <a href="http://foo.com/500.html">http://foo.com/500.html</a>.')
    .expect(302, done);
  });
});

function* commonError() {
  // eslint-disable-next-line
  foo();
}
