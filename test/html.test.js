'use strict';

const fs = require('fs');
const koa = require('koa');
const request = require('supertest');
const sleep = require('ko-sleep');
const onerror = require('..');

describe('html.test.js', function() {
  it('should common error ok', function(done) {
    const app = new koa();
    app.on('error', function() {});
    onerror(app);
    app.use(commonError);

    request(app.callback())
      .get('/')
      .set('Accept', 'text/html')
      .expect(/<h1>Error<\/h1>/, done);
  });

  it('should common error after sleep a little while ok', function(done) {
    const app = new koa();
    app.on('error', function() {});
    onerror(app);
    app.use(commonSleepError);

    request(app.callback())
      .get('/')
      .set('Accept', 'text/html')
      .expect(/<h1>Error<\/h1>/, done);
  });

  it('should stream error ok', function(done) {
    const app = new koa();
    app.on('error', function() {});
    onerror(app);
    app.use(streamError);

    request(app.callback())
      .get('/')
      .set('Accept', 'text/html')
      .expect(/<h1>Error<\/h1>/)
      .expect(/ENOENT/, done);
  });

  it('should custom error ok', function(done) {
    const app = new koa();
    app.on('error', function() {});
    onerror(app);
    app.use(customError);

    request(app.callback())
      .get('/')
      .set('Accept', 'text/html')
      .expect(/<p>Custom Error<\/p>/, done);
  });
});

function commonError() {
  // eslint-disable-next-line
  foo();
}

async function commonSleepError() {
  await sleep(50);
  // eslint-disable-next-line
  fooAfterSleep();
}

function streamError(ctx) {
  ctx.body = fs.createReadStream('not exist');
}

function customError(ctx) {
  ctx.throw(400, 'Custom Error');
}
