import koa from 'koa';
import { request } from '@eggjs/supertest';
import { onerror } from '../src/index.js';
import { mm } from 'mm';

describe('test/redirect.test.ts', () => {
  beforeEach(() => {
    mm(process.env, 'NODE_ENV', 'development');
  });

  afterEach(() => {
    mm.restore();
  });

  it('should handle error and redirect to real error page', async () => {
    const app = new koa();
    app.on('error', () => {});
    onerror(app, {
      redirect: 'http://example/500.html',
    });
    app.use(commonError);

    await request(app.callback())
      .get('/')
      .set('Accept', 'text/html')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect('Redirecting to <a href="http://example/500.html">http://example/500.html</a>.')
      .expect('Location', 'http://example/500.html');
  });

  it('should got text/plain header', async () => {
    const app = new koa();
    app.on('error', () => {});
    onerror(app, {
      redirect: 'http://example/500.html',
    });
    app.use(commonError);

    await request(app.callback())
      .get('/')
      .set('Accept', 'text/plain')
      .expect('Content-Type', 'text/plain; charset=utf-8')
      .expect('Redirecting to http://example/500.html.')
      .expect('Location', 'http://example/500.html');
  });

  it('should show json when accept is json', async () => {
    const app = new koa();
    app.on('error', () => {});
    onerror(app, {
      redirect: 'http://example/500.html',
    });
    app.use(commonError);

    await request(app.callback())
      .get('/')
      .set('Accept', 'application/json')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect({ error: 'foo is not defined' });
  });
});

function commonError() {
  // eslint-disable-next-line
  // @ts-ignore - intentionally calling undefined function to trigger error
  foo();
}
