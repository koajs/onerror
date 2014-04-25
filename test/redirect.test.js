/**!
 * koa-onerror - test/redirect.test.js
 *
 * Copyright(c) fengmk2 and other contributors.
 * MIT Licensed
 *
 * Authors:
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 */

'use strict';

/**
 * Module dependencies.
 */

var fs = require('fs');
var koa = require('koa');
var request = require('supertest');
var onerror = require('..');

describe('redirect.test.js', function () {
  it('should handle error and redirect to real error page', function (done) {
    var app = koa();
    app.outputErrors = false;
    onerror(app, {
      redirect: 'http://example/500.html'
    });
    app.use(commonError);

    request(app.callback())
    .get('/')
    .set('Accept', 'text/html')
    .expect('Content-Type', 'text/html; charset=utf-8')
    .expect('Redirecting to <a href="http://example/500.html">http://example/500.html</a>.')
    .expect('Location', 'http://example/500.html', done);
  });

  it('should got text/plain header', function (done) {
    var app = koa();
    app.outputErrors = false;
    onerror(app, {
      redirect: 'http://example/500.html'
    });
    app.use(commonError);

    request(app.callback())
    .get('/')
    .set('Accept', 'text/plain')
    .expect('Content-Type', 'text/plain; charset=utf-8')
    .expect('Redirecting to http://example/500.html.')
    .expect('Location', 'http://example/500.html', done);
  });

  it('should show json when accept is json', function (done) {
    var app = koa();
    app.outputErrors = false;
    onerror(app, {
      redirect: 'http://example/500.html'
    });
    app.use(commonError);

    request(app.callback())
    .get('/')
    .set('Accept', 'application/json')
    .expect('Content-Type', 'application/json')
    .expect({"error":"foo is not defined"}, done);
  });
});

function* commonError() {
  foo();
}
