'use strict';

const fs = require('fs');
const koa = require('koa');
const request = require('supertest');
const sleep = require('ko-sleep');
const onerror = require('..');

describe('html.test.js', function() {
  it('should common error ok', function(done) {
    const app = koa();
    app.on('error', function() {});
    onerror(app);
    app.use(commonError);

    request(app.callback())
    .get('/')
    .set('Accept', 'text/html')
    .expect(/<p>Looks like something broke!<\/p>/, done);
  });

  it('should common error after sleep a little while ok', function(done) {
    const app = koa();
    app.on('error', function() {});
    onerror(app);
    app.use(commonSleepError);

    request(app.callback())
    .get('/')
    .set('Accept', 'text/html')
    .expect(/<p>Looks like something broke!<\/p>/, done);
  });

  it('should stream error ok', function(done) {
    const app = koa();
    app.on('error', function() {});
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
  // eslint-disable-next-line
  foo();
}

function* commonSleepError() {
  yield sleep(50);
  // eslint-disable-next-line
  fooAfterSleep();
}

function* streamError() {
  this.body = fs.createReadStream('not exist');
}
