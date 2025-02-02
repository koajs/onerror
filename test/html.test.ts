import fs from 'node:fs';
import { scheduler } from 'node:timers/promises';
import Koa from 'koa';
import { request } from '@eggjs/supertest';
import { mm } from 'mm';
import { onerror } from '../src/index.js';

describe('test/html.test.ts', () => {
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
      .set('Accept', 'text/html')
      .expect(/<p>Looks like something broke!<\/p>/);
  });

  it('should common error after sleep a little while ok', async () => {
    const app = new Koa();
    app.on('error', () => {});
    onerror(app);
    app.use(commonSleepError);

    await request(app.callback())
      .get('/')
      .set('Accept', 'text/html')
      .expect(/<p>Looks like something broke!<\/p>/);
  });

  it('should stream error ok', async () => {
    const app = new Koa();
    app.on('error', () => {});
    onerror(app);
    app.use(streamError);

    await request(app.callback())
      .get('/')
      .set('Accept', 'text/html')
      .expect(/<p>Looks like something broke!<\/p>/)
      .expect(/ENOENT/);
  });

  it('should unsafe error ok', async () => {
    const app = new Koa();
    app.on('error', () => {});
    onerror(app);
    app.use(unsafeError);

    await request(app.callback())
      .get('/')
      .set('Accept', 'text/html')
      .expect(/<p>Looks like something broke!<\/p>/)
      .expect(/&lt;anonymous&gt;/);
  });
});

function commonError() {
  // eslint-disable-next-line
  // @ts-ignore - intentionally calling undefined function to trigger error
  foo();
}

async function commonSleepError() {
  await scheduler.wait(50);
  // eslint-disable-next-line
  // @ts-ignore - intentionally calling undefined function to trigger error
  fooAfterSleep();
}

function streamError(ctx: Koa.Context) {
  ctx.body = fs.createReadStream('not exist');
}

function unsafeError() {
  throw new Error('<anonymous>');
}
