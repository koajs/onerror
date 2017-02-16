'use strict';

const should = require('should');
const fs = require('fs');
const koa = require('koa');
const request = require('supertest');
const pedding = require('pedding');
const onerror = require('..');

describe('json.test.js', function() {
  it('should common error ok', function(done) {
    const app = koa();
    app.on('error', function() {});
    onerror(app);
    app.use(commonError);

    request(app.callback())
    .get('/')
    .set('Accept', 'application/json')
    .expect(500)
    .expect({ error: 'foo is not defined' }, done);
  });

  it('should stream error ok', function(done) {
    const app = koa();
    app.on('error', function() {});
    onerror(app);
    app.use(streamError);

    request(app.callback())
    .get('/')
    .set('Accept', 'application/json')
    .expect(404, function(err, res) {
      should.not.exist(err);
      res.body.error.should.be.a.String;
      res.body.error.should.containEql('ENOENT');
      done();
    });
  });

  it('should custom handler', function(done) {
    const app = koa();
    app.on('error', function() {});
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

  it('should show status error when err.message not present', function(done) {
    const app = koa();
    app.on('error', function() {});
    onerror(app);
    app.use(emptyError);

    request(app.callback())
    .get('/')
    .set('Accept', 'application/json')
    .expect(500)
    .expect({ error: 'Internal Server Error' }, done);
  });

  it('should wrap non-error object', function(done) {
    const app = koa();
    app.on('error', function() {});
    onerror(app);
    app.use(function* () {
      throw 1;
    });

    request(app.callback())
    .get('/')
    .set('Accept', 'application/json')
    .expect(500)
    .expect({ error: 'non-error thrown: 1' }, done);
  });

  it('should wrap mock error obj instead of Error instance', function(done) {
    done = pedding(2, done);
    const app = koa();
    app.on('error', function(err) {
      err.should.be.an.Error;
      err.name.should.equal('TypeError');
      err.message.should.equal('mock error');
      err.stack.should.containEql('json.test.js');
      done();
    });
    onerror(app);
    app.use(function* () {
      const err = {
        name: 'TypeError',
        message: 'mock error',
        stack: new Error().stack,
      };
      throw err;
    });

    request(app.callback())
    .get('/')
    .set('Accept', 'application/json')
    .expect(500)
    .expect({ error: 'mock error' }, done);
  });

  it('should custom handler with ctx', function(done) {
    const app = koa();
    app.on('error', function() {});
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
});

function* emptyError() {
  const err = new Error('');
  err.expose = true;
  throw err;
}

function* commonError() {
  // eslint-disable-next-line
  foo();
}

function* streamError() {
  this.body = fs.createReadStream('not exist');
}
