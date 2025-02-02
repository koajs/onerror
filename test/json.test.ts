import { strict as assert } from 'node:assert';
import { once } from 'node:events';
import fs from 'node:fs';
import Koa, { Context } from 'koa';
import { request } from '@eggjs/supertest';
import { mm } from 'mm';
import { onerror, OnerrorError } from '../src/index.js';

describe('test/json.test.ts', () => {
  beforeEach(() => {
    mm(process.env, 'NODE_ENV', 'development');
  });

  afterEach(() => {
    mm.restore();
  });

  it('should common error ok', async () => {
    const app = new Koa();
    app.on('error', () => {});
    onerror(app);
    app.use(commonError);

    await request(app.callback())
      .get('/')
      .set('Accept', 'application/json')
      .expect(500)
      .expect({ error: 'foo is not defined' });
  });

  it('should work on jsonp', async () => {
    const app = new Koa();
    app.on('error', () => {});
    onerror(app, {
      accepts(this: Context) {
        return 'js';
      },
      js(err: OnerrorError, ctx: Context) {
        ctx.body = `callback(${JSON.stringify({ error: err.message })})`;
      },
    });
    app.use(commonError);

    await request(app.callback())
      .get('/')
      .set('Accept', 'application/javascript')
      .expect('Content-Type', 'application/javascript; charset=utf-8')
      .expect(500)
      .expect('callback({"error":"foo is not defined"})');
  });

  it('should stream error ok', async () => {
    const app = new Koa();
    app.on('error', () => {});
    onerror(app);
    app.use(streamError);

    const res = await request(app.callback())
      .get('/')
      .set('Accept', 'application/json')
      .expect(404);
    assert.equal(typeof res.body.error, 'string');
    assert.match(res.body.error, /ENOENT/);
  });

  it('should custom handler', async () => {
    const app = new Koa();
    app.on('error', () => {});
    onerror(app, {
      json(this: Context) {
        this.status = 500;
        this.body = {
          message: 'error',
        };
      },
    });
    app.use(commonError);

    await request(app.callback())
      .get('/')
      .set('Accept', 'application/json')
      .expect(500)
      .expect({ message: 'error' });
  });

  it('should show status error when err.message not present', async () => {
    const app = new Koa();
    app.on('error', () => {});
    onerror(app);
    app.use(emptyError);

    await request(app.callback())
      .get('/')
      .set('Accept', 'application/json')
      .expect(500)
      .expect({ error: 'Internal Server Error' });
  });

  it('should wrap non-error primitive value', async () => {
    const app = new Koa();
    app.on('error', () => {});
    onerror(app);
    app.use(() => {
      throw 1;
    });

    await request(app.callback())
      .get('/')
      .set('Accept', 'application/json')
      .expect(500)
      .expect({ error: 'non-error thrown: 1' });
  });

  it('should wrap non-error object and stringify it', async () => {
    const app = new Koa();
    app.on('error', () => {});
    onerror(app);
    app.use(() => {
      throw { error: true };
    });

    await request(app.callback())
      .get('/')
      .set('Accept', 'application/json')
      .expect(500)
      .expect({ error: 'non-error thrown: {"error":true}' });
  });

  it('should wrap mock error obj instead of Error instance', async () => {
    const app = new Koa();
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

    const errorEvent = once(app, 'error');

    await request(app.callback())
      .get('/')
      .set('Accept', 'application/json')
      .expect(404)
      .expect('foo', 'bar')
      .expect({ error: 'mock error' });

    const [ err ] = await errorEvent;
    assert(err instanceof Error);
    assert.equal(err.name, 'TypeError');
    assert.equal(err.message, 'mock error');
    assert.match(err.stack!, /json\.test\./);
  });

  it('should custom handler with ctx', async () => {
    const app = new Koa();
    app.on('error', () => {});
    onerror(app, {
      json: (_err, ctx) => {
        ctx.status = 500;
        ctx.body = {
          message: 'error',
        };
      },
    });
    app.use(commonError);

    await request(app.callback())
      .get('/')
      .set('Accept', 'application/json')
      .expect(500)
      .expect({ message: 'error' });
  });

  it('should get headerSent in error listener', async () => {
    const app = new Koa();
    onerror(app, {
      json: (_err: OnerrorError, ctx: Context) => {
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

    const errorEvent = once(app, 'error');

    request(app.callback())
      .get('/')
      .set('Accept', 'application/json')
      .expect(500)
      .expect({ message: 'error' })
      .send()
      .catch(err => {
        assert(err instanceof Error);
        assert.equal((err as any).headerSent, true);
      });

    const [ err ] = await errorEvent;
    assert(err instanceof Error);
    assert.equal((err as any).headerSent, true);
  });
});

function emptyError() {
  const err = new Error('') as OnerrorError;
  err.expose = true;
  throw err;
}

function commonError() {
  // eslint-disable-next-line
  // @ts-ignore foo is not defined
  foo();
}

function streamError(ctx: Context) {
  ctx.body = fs.createReadStream('not exist');
}
