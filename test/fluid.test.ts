import { strict as assert } from 'node:assert';
import Koa from 'koa';
import { onerror } from '../src/index.js';

describe('test/fluid.test.ts', () => {
  it('should return app reference', () => {
    const app = new Koa();
    const res = onerror(app);
    assert(res instanceof Koa);
    assert.equal(res, app);
  });
});
