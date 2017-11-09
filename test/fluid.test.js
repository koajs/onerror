/* !
 * koa-onerror - test/text.test.js
 * Copyright(c) 2014 dead_horse <dead_horse@qq.com>
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

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
