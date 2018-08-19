'use strict';

const fs = require('fs');
const koa = require('koa');
const request = require('supertest');
const onerror = require('..');

describe('text.test.js', function() {
  it('should common error ok', function(done) {
    const app = new koa();
    app.on('error', function() {});
    onerror(app);
    app.use(commonError);

    request(app.callback())
      .get('/')
      .set('Accept', 'text/plain')
      .expect(500)
      .expect('foo is not defined', done);
  });

  it('should show error message ok', function(done) {
    const app = new koa();
    app.on('error', function() {});
    onerror(app);
    app.use(exposeError);

    request(app.callback())
      .get('/')
      .set('Accept', 'text/plain')
      .expect(500)
      .expect('this message will be expose', done);
  });

  it('should show status error when err.message not present', function(done) {
    const app = new koa();
    app.on('error', function() {});
    onerror(app);
    app.use(emptyError);

    request(app.callback())
      .get('/')
      .set('Accept', 'text/plain')
      .expect(500)
      .expect('Internal Server Error', done);
  });

  it('should set headers from error.headers ok', function(done) {
    const app = new koa();
    app.on('error', function() {});
    onerror(app);
    app.use(headerError);

    request(app.callback())
      .get('/')
      .set('Accept', 'text/plain')
      .expect(500)
      .expect('foo', 'bar', done);
  });

  it('should stream error ok', function(done) {
    const app = new koa();
    app.on('error', function() {});
    onerror(app);
    app.use(streamError);

    request(app.callback())
      .get('/')
      .set('Accept', 'text/plain')
      .expect(404)
      .expect(/ENOENT/, done);
  });

  it('should custom handler', function(done) {
    const app = new koa();
    app.on('error', function() {});
    onerror(app, {
      text() {
        this.status = 500;
        this.body = 'error';
      },
    });
    app.use(commonError);

    request(app.callback())
      .get('/')
      .set('Accept', 'text/plain')
      .expect(500)
      .expect('error', done);
  });
});

function exposeError() {
  const err = new Error('this message will be expose');
  err.expose = true;
  throw err;
}

function emptyError() {
  const err = new Error('');
  err.expose = true;
  throw err;
}

function commonError() {
  // eslint-disable-next-line
  foo();
}

function headerError() {
  const err = new Error('error with headers');
  err.headers = {
    foo: 'bar',
  };
  throw err;
}

function streamError(ctx) {
  ctx.body = fs.createReadStream('not exist');
}
