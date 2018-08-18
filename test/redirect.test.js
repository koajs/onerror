'use strict';

const koa = require('koa');
const request = require('supertest');
const onerror = require('..');

describe('redirect.test.js', function() {
  it('should handle error and redirect to real error page', function(done) {
    const app = new koa();
    app.on('error', function() {});
    onerror(app, {
      redirect: 'http://example/500.html',
    });
    app.use(commonError);

    request(app.callback())
      .get('/')
      .set('Accept', 'text/html')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect('Redirecting to <a href="http://example/500.html">http://example/500.html</a>.')
      .expect('Location', 'http://example/500.html', done);
  });

  it('should got text/plain header', function(done) {
    const app = new koa();
    app.on('error', function() {});
    onerror(app, {
      redirect: 'http://example/500.html',
    });
    app.use(commonError);

    request(app.callback())
      .get('/')
      .set('Accept', 'text/plain')
      .expect('Content-Type', 'text/plain; charset=utf-8')
      .expect('Redirecting to http://example/500.html.')
      .expect('Location', 'http://example/500.html', done);
  });

  it('should show json when accept is json', function(done) {
    const app = new koa();
    app.on('error', function() {});
    onerror(app, {
      redirect: 'http://example/500.html',
    });
    app.use(commonError);

    request(app.callback())
      .get('/')
      .set('Accept', 'application/json')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect({ error: 'foo is not defined' }, done);
  });
});

function commonError() {
  // eslint-disable-next-line
  foo();
}
