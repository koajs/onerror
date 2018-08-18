'use strict';

const fs = require('fs');
const koa = require('koa');
const request = require('supertest');
const sleep = require('mz-modules/sleep');
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
      .expect(/<p>Looks like something broke!<\/p>/, done);
  });

  it('should common error after sleep a little while ok', function(done) {
    const app = new koa();
    app.on('error', function() {});
    onerror(app);
    app.use(commonSleepError);

    request(app.callback())
      .get('/')
      .set('Accept', 'text/html')
      .expect(/<p>Looks like something broke!<\/p>/, done);
  });

  it('should stream error ok', function(done) {
    const app = new koa();
    app.on('error', function() {});
    onerror(app);
    app.use(streamError);

    request(app.callback())
      .get('/')
      .set('Accept', 'text/html')
      .expect(/<p>Looks like something broke!<\/p>/)
      .expect(/ENOENT/, done);
  });

  it('should unsafe error ok', function(done) {
    const app = new koa();
    app.on('error', function() {});
    onerror(app);
    app.use(unsafeError);

    request(app.callback())
      .get('/')
      .set('Accept', 'text/html')
      .expect(/<p>Looks like something broke!<\/p>/)
      .expect(/&lt;anonymous&gt;/, done);
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

function unsafeError() {
  throw new Error('<anonymous>');
}
