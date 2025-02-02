import assert from 'node:assert';
import { scheduler } from 'node:timers/promises';
import { Readable } from 'node:stream';
import urllib from 'urllib';
import formstream from 'formstream';
import { mm } from 'mm';
import { app } from './form_app.js';
import { getFixtures } from './helper.js';

describe('test/multipart.test.ts', () => {
  let host: string;
  before(done => {
    const server = app.listen(0, () => {
      const addr = server.address();
      if (addr && typeof addr !== 'string') {
        host = `http://127.0.0.1:${addr.port}`;
      }
      done();
    });
  });

  beforeEach(() => {
    mm(process.env, 'NODE_ENV', 'development');
  });

  afterEach(() => {
    mm.restore();
  });

  it('should consume all request data after error throw', async () => {
    // retry 10 times
    for (let i = 0; i < 10; i++) {
      const form = formstream();
      form.file('file1', getFixtures('bigdata.txt'));
      form.field('foo', 'fengmk2')
        .field('love', 'koa')
        .field('index', `${i}`);

      const headers = form.headers();
      const result = await urllib.request(`${host}/upload`, {
        method: 'POST',
        headers,
        stream: form as unknown as Readable,
        timing: true,
      });

      const data = result.data;
      const response = result.res;
      assert.equal(response.status, 500);
      assert.match(data.toString(), /TypeError: Cannot read properties of undefined/);
      // wait for the request data is consumed by onerror
      await scheduler.wait(200);
    }
  });
});
