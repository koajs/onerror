/*!
 * koa-onerror - test/html.test.js
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

describe('html.test.js', function () {
  it('should common error ok', function (done) {
    var app = koa();
    onerror(app);
    app.use(commonError);

    request(app.callback())
    .get('/')
    .set('Accept', 'text/html')
    .expect(/<p>Looks like something broke!<\/p>/, done);
  });

  it('should stream error ok', function (done) {
    var app = koa();
    onerror(app);
    app.use(streamError);

    request(app.callback())
    .get('/')
    .set('Accept', 'text/html')
    .expect(/<p>Looks like something broke!<\/p>/)
    .expect(/ENOENT/, done);
  });
});

function* commonError() {
  foo();
}

function* streamError() {
  this.body = fs.createReadStream('not exist');
}
