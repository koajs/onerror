/*!
 * koa-onerror - test/text.test.js
 * Copyright(c) 2014 dead_horse <dead_horse@qq.com>
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var fs = require('fs');
var koa = require('koa');
var request = require('supertest');
var onerror = require('..');

describe('text.test.js', function () {
  it('should common error ok', function (done) {
    var app = koa();
    app.outputErrors = false;
    onerror(app);
    app.use(commonError);

    request(app.callback())
    .get('/')
    .set('Accept', 'text/plain')
    .expect(500)
    .expect('foo is not defined', done);
  });

  it('should show error message ok', function (done) {
    var app = koa();
    app.outputErrors = false;
    onerror(app);
    app.use(exposeError);

    request(app.callback())
    .get('/')
    .set('Accept', 'text/plain')
    .expect(500)
    .expect('this message will be expose', done);
  });

  it('should stream error ok', function (done) {
    var app = koa();
    app.outputErrors = false;
    onerror(app);
    app.use(streamError);

    request(app.callback())
    .get('/')
    .set('Accept', 'text/plain')
    .expect(404)
    .expect('ENOENT, open \'not exist\'', done);
  });

  it('should custom handler', function (done) {
    var app = koa();
    app.outputErrors = false;
    onerror(app, {
      text: function () {
        this.status = 500;
        this.body = 'error';
      }
    });
    app.use(commonError);

    request(app.callback())
    .get('/')
    .set('Accept', 'text/plain')
    .expect(500)
    .expect('error', done);
  });
});

function* exposeError() {
  var err = new Error('this message will be expose');
  err.expose = true;
  throw err;
}

function* commonError() {
  foo();
}

function* streamError() {
  this.body = fs.createReadStream('not exist');
}
