import Koa from 'koa';
import { request } from '@eggjs/supertest';
import { mm } from 'mm';
import { onerror } from '../src/index.js';

describe('test/accepts.test.ts', () => {
  beforeEach(() => {
    mm(process.env, 'NODE_ENV', '');
  });

  afterEach(() => {
    mm.restore();
  });

  it('should return json response', async () => {
    const app = new Koa();
    app.on('error', () => {});
    onerror(app, {
      accepts(this: { url: string }) {
        if (this.url.includes('.json')) {
          return 'json';
        }
        return 'text';
      },
    });
    app.use(commonError);

    await request(app.callback())
      .get('/user.json')
      .set('Accept', '*/*')
      .expect(500)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect({ error: 'foo is not defined' });

    await request(app.callback())
      .get('/user')
      .set('Accept', 'application/json')
      .expect(500)
      .expect('Content-Type', 'text/plain; charset=utf-8')
      .expect('foo is not defined');

    // NODE_ENV=production
    mm(process.env, 'NODE_ENV', 'production');
    await request(app.callback())
      .get('/user')
      .set('Accept', 'application/json')
      .expect(500)
      .expect('Content-Type', 'text/plain; charset=utf-8')
      .expect('Internal Server Error');
  });

  it('should redirect when accepts type not json', async () => {
    const app = new Koa();
    app.on('error', () => {});
    onerror(app, {
      accepts(this: any) {
        if (this.url.indexOf('.json') > 0) {
          return 'json';
        }
        return 'text';
      },
      redirect: 'http://foo.com/500.html',
    });
    app.use(commonError);

    await request(app.callback())
      .get('/user')
      .set('Accept', '*/*')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect('Location', 'http://foo.com/500.html')
      .expect('Redirecting to <a href="http://foo.com/500.html">http://foo.com/500.html</a>.')
      .expect(302);
  });
});

function commonError() {
  // eslint-disable-next-line
  // @ts-ignore - intentionally calling undefined function to trigger error
  foo();
}
