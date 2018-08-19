'use strict';

const koa = require('koa');
const assert = require('assert');
const onerror = require('..');

describe('fluid.test.js', function() {
  it('should return app reference', function() {
    const app = new koa();
    const res = onerror(app);
    assert(res instanceof koa);
    assert(res === app);
  });
});
