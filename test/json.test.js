'use strict';

const assert = require('assert');
const fs = require('fs');
const koa = require('koa');
const request = require('supertest');
const pedding = require('pedding');
const onerror = require('..');

describe('json.test.js', () => {
  it('should common error ok', done => {
    const app = new koa();
    app.on('error', () => {});
    onerror(app);
    app.use(commonError);

    request(app.callback())
      .get('/')
      .set('Accept', 'application/json')
      .expect(500)
      .expect({ error: 'foo is not defined' }, done);
  });

  it('should stream error ok', done => {
    const app = new koa();
    app.on('error', () => {});
    onerror(app);
    app.use(streamError);

    request(app.callback())
      .get('/')
      .set('Accept', 'application/json')
      .expect(404, (err, res) => {
        assert(!err);
        assert(typeof res.body.error === 'string');
        assert(res.body.error.match(/ENOENT/));
        done();
      });
  });

  it('should custom handler', done => {
    const app = new koa();
    app.on('error', () => {});
    onerror(app, {
      json() {
        this.status = 500;
        this.body = {
          message: 'error',
        };
      },
    });
    app.use(commonError);

    request(app.callback())
      .get('/')
      .set('Accept', 'application/json')
      .expect(500)
      .expect({ message: 'error' }, done);
  });

  it('should show status error when err.message not present', done => {
    const app = new koa();
    app.on('error', () => {});
    onerror(app);
    app.use(emptyError);

    request(app.callback())
      .get('/')
      .set('Accept', 'application/json')
      .expect(500)
      .expect({ error: 'Internal Server Error' }, done);
  });

  it('should wrap non-error primitive value', done => {
    const app = new koa();
    app.on('error', () => {});
    onerror(app);
    app.use(() => {
      throw 1;
    });

    request(app.callback())
      .get('/')
      .set('Accept', 'application/json')
      .expect(500)
      .expect({ error: 'non-error thrown: 1' }, done);
  });

  it('should wrap non-error object and stringify it', done => {
    const app = new koa();
    app.on('error', () => {});
    onerror(app);
    app.use(() => {
      throw { error: true };
    });

    request(app.callback())
      .get('/')
      .set('Accept', 'application/json')
      .expect(500)
      .expect({ error: 'non-error thrown: {"error":true}' }, done);
  });

  it('should wrap mock error obj instead of Error instance', done => {
    done = pedding(2, done);
    const app = new koa();
    app.on('error', err => {
      assert(err instanceof Error);
      assert(err.name === 'TypeError');
      assert(err.message === 'mock error');
      assert(err.stack.match(/json\.test\.js/));
      done();
    });
    onerror(app);
    app.use(() => {
      const err = {
        name: 'TypeError',
        message: 'mock error',
        stack: new Error().stack,
        status: 404,
        headers: { foo: 'bar' },
      };
      throw err;
    });

    request(app.callback())
      .get('/')
      .set('Accept', 'application/json')
      .expect(404)
      .expect('foo', 'bar')
      .expect({ error: 'mock error' }, done);
  });

  it('should custom handler with ctx', done => {
    const app = new koa();
    app.on('error', () => {});
    onerror(app, {
      json: (err, ctx) => {
        ctx.status = 500;
        ctx.body = {
          message: 'error',
        };
      },
    });
    app.use(commonError);

    request(app.callback())
      .get('/')
      .set('Accept', 'application/json')
      .expect(500)
      .expect({ message: 'error' }, done);
  });

  it('should get headerSent in error listener', done => {
    const app = new koa();
    app.on('error', err => {
      assert(err.headerSent);
      done();
    });
    onerror(app, {
      json: (err, ctx) => {
        ctx.status = 500;
        ctx.body = {
          message: 'error',
        };
      },
    });

    app.use(ctx => {
      ctx.res.flushHeaders();
      throw new Error('mock error');
    });

    request(app.callback())
      .get('/')
      .set('Accept', 'application/json')
      .expect(500)
      .expect({ message: 'error' }, done);
  });
});

function emptyError() {
  const err = new Error('');
  err.expose = true;
  throw err;
}

function commonError() {
  // eslint-disable-next-line
  foo();
}

function streamError(ctx) {
  ctx.body = fs.createReadStream('not exist');
}
