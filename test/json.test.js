/*!
 * koa-onerror - test/json.test.js
 * Copyright(c) 2014 dead_horse <dead_horse@qq.com>
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var fs = require('fs');
var onerror = require('..');
var koa = require('koa');
var request = require('supertest');

describe('json.test.js', function () {
  it('should common error ok', function (done) {
    var app = koa();
    app.outputErrors = false;
    onerror(app);
    app.use(commonError);

    request(app.callback())
    .get('/')
    .set('Accept', 'application/json')
    .expect(500)
    .expect({ error: 'foo is not defined' }, done);
  });

  it('should stream error ok', function (done) {
    var app = koa();
    app.outputErrors = false;
    onerror(app);
    app.use(streamError);

    request(app.callback())
    .get('/')
    .set('Accept', 'application/json')
    .expect(404)
    .expect( { error: 'ENOENT, open \'not exist\'' }, done);
  });

  it('should custom handler', function (done) {
    var app = koa();
    app.outputErrors = false;
    onerror(app, {
      json: function () {
        this.status = 500;
        this.body = {
          message: 'error'
        };
      }
    });
    app.use(commonError);

    request(app.callback())
    .get('/')
    .set('Accept', 'application/json')
    .expect(500)
    .expect({ message: 'error' }, done);
  });
});

function* commonError() {
  foo();
}

function* streamError() {
  this.body = fs.createReadStream('not exist');
}
