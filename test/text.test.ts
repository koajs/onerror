import fs from 'node:fs';
import koa from 'koa';
import { request } from '@eggjs/supertest';
import { mm } from 'mm';
import { onerror } from '../src/index.js';
import { OnerrorError } from '../src/index.js';

describe('test/text.test.ts', () => {
  beforeEach(() => {
    mm(process.env, 'NODE_ENV', 'development');
  });

  afterEach(() => {
    mm.restore();
  });

  it('should common error ok', async () => {
    const app = new koa();
    app.on('error', () => {});
    onerror(app);
    app.use(commonError);

    await request(app.callback())
      .get('/')
      .set('Accept', 'text/plain')
      .expect(500)
      .expect('foo is not defined');
  });

  it('should show error message ok', async () => {
    const app = new koa();
    app.on('error', () => {});
    onerror(app);
    app.use(exposeError);

    await request(app.callback())
      .get('/')
      .set('Accept', 'text/plain')
      .expect(500)
      .expect('this message will be expose');
  });

  it('should show status error when err.message not present', async () => {
    const app = new koa();
    app.on('error', () => {});
    onerror(app);
    app.use(emptyError);

    await request(app.callback())
      .get('/')
      .set('Accept', 'text/plain')
      .expect(500)
      .expect('Internal Server Error');
  });

  it('should set headers from error.headers ok', async () => {
    const app = new koa();
    app.on('error', () => {});
    onerror(app);
    app.use(headerError);

    await request(app.callback())
      .get('/')
      .set('Accept', 'text/plain')
      .expect(500)
      .expect('foo', 'bar');
  });

  it('should stream error ok', async () => {
    const app = new koa();
    app.on('error', () => {});
    onerror(app);
    app.use(streamError);

    await request(app.callback())
      .get('/')
      .set('Accept', 'text/plain')
      .expect(404)
      .expect(/ENOENT/);
  });

  it('should custom handler', async () => {
    const app = new koa();
    app.on('error', () => {});
    onerror(app, {
      text(this: any) {
        this.status = 500;
        this.body = 'error';
      },
    });
    app.use(commonError);

    await request(app.callback())
      .get('/')
      .set('Accept', 'text/plain')
      .expect(500)
      .expect('error');
  });
});

function exposeError() {
  const err = new Error('this message will be expose') as OnerrorError;
  err.expose = true;
  throw err;
}

function emptyError() {
  const err = new Error('') as OnerrorError;
  err.expose = true;
  throw err;
}

function commonError() {
  // eslint-disable-next-line
  // @ts-ignore - intentionally calling undefined function to trigger error
  foo();
}

function headerError() {
  const err = new Error('error with headers') as OnerrorError;
  err.headers = {
    foo: 'bar',
  };
  throw err;
}

function streamError(ctx: any) {
  ctx.body = fs.createReadStream('not exist');
}
