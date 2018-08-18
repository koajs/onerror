'use strict';

const path = require('path');
const assert = require('assert');
const urllib = require('urllib');
const Agent = require('http').Agent;
const formstream = require('formstream');
const sleep = require('mz-modules/sleep');

describe('multipart.test.js', () => {
  let app;
  let host;
  before(done => {
    app = require('./form_app');
    const server = app.listen(0, err => {
      host = `http://127.0.0.1:${server.address().port}`;
      done(err);
    });
  });

  it('should consume all request data after error throw', async () => {
    const keepAliveAgent = new Agent({
      keepAlive: true,
    });
    // retry 10 times
    for (let i = 0; i < 10; i++) {
      const form = formstream();
      form.file('file1', path.join(__dirname, 'fixtures/bigdata.txt'));
      form.field('foo', 'fengmk2')
        .field('love', 'koa')
        .field('index', `${i}`);

      const headers = form.headers();
      const result = await urllib.request(`${host}/upload`, {
        method: 'POST',
        headers,
        stream: form,
        timing: true,
        agent: keepAliveAgent,
      });

      const data = result.data;
      const response = result.res;
      if (i === 0) {
        assert(response.keepAliveSocket === false);
      } else {
        assert(response.keepAliveSocket === true);
      }
      assert(response.status === 500);
      assert(data.toString().includes('Cannot read property &#39;error&#39; of undefined'));
      // wait for the request data is consumed by onerror
      await sleep(200);
    }
  });
});
