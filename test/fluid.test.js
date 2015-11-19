/*!
 * koa-onerror - test/text.test.js
 * Copyright(c) 2014 dead_horse <dead_horse@qq.com>
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var koa = require('koa');
var assert = require('assert');
var onerror = require('..');

describe('fluid.test.js', function () {
  it('should return app reference', function () {
    var app = koa();
    var res = onerror(app);
    assert(res instanceof koa);
    assert(res === app);
  });
});
