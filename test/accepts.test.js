/**!
 * koa-onerror - test/accepts.test.js
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
var pedding = require('pedding');
var onerror = require('..');

describe('accepts.test.js', function () {
  it('should return json response', function (done) {
    done = pedding(2, done);
    var app = koa();
    app.on('error', function () {});
    onerror(app, {
      accepts: function () {
        if (this.url.indexOf('.json') > 0) {
          return 'json';
        }
        return 'text';
      }
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

  it('should redrect when accepts type not json', function (done) {
    var app = koa();
    app.on('error', function () {});
    onerror(app, {
      accepts: function () {
        if (this.url.indexOf('.json') > 0) {
          return 'json';
        }
        return 'text';
      },
      redirect: 'http://foo.com/500.html'
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
  foo();
}
