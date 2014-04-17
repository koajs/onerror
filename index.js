/*!
 * koa-error-handler - index.js
 * Copyright(c) 2014 dead_horse <dead_horse@qq.com>
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var http = require('http');
var debug = require('debug')('koa-error-handler');
var copy = require('copy-to');
var swig = require('swig');

var env = process.env.NODE_ENV || 'development';
var isDev = env === 'development';

/**
 * Expose `onerror`
 */

module.exports = onerror;

function onerror(app, options) {
  options = options || {};

  var defaultOptions = {
    html: html,
    text: text,
    json: json,
    template: __dirname + '/error.html'
  };

  copy(defaultOptions).to(options);
  var render = swig.compileFile(options.template);

  app.context.onerror = function(err) {
    // don't do anything if there is no error.
    // this allows you to pass `this.onerror`
    // to node-style callbacks.
    if (!err) {
      return;
    }

    // nothing we can do here other
    // than delegate to the app-level
    // handler and log.
    if (this.headerSent || !this.writable) {
      err.headerSent = true;
      this.app.emit('error', err, this);
      return;
    }

    // delegate
    this.app.emit('error', err, this);

    // ENOENT support
    if ('ENOENT' === err.code) {
      err.status = 404;
    }

    var type = this.accepts('html', 'text', 'json') || 'text';
    options.all
      ? options.all(this, err)
      : options[type](this, err);

    switch (type) {
    case 'json':
      this.type = 'json';
      this.body = JSON.stringify(this.body);
      break;
    case 'html':
      this.type = 'html';
      break;
    case 'text':
      this.type = 'text';
      if (!this.body) {
        this.body = http.STATUS_CODES[this.status];
      }
      break;
    }

    this.res.end(this.body);
  };

  /**
   * default html error handler
   * @param {Context} ctx
   * @param {Error} err
   */

  function html(ctx, err) {
    ctx.body = render({
      env: env,
      ctx: ctx,
      request: ctx.request,
      response: ctx.response,
      error: err.message,
      stack: err.stack,
      status: ctx.status,
      code: err.code
    });
  }

  /**
   * default text error handler
   * @param {Context} ctx
   * @param {Error} err
   */

  function text(ctx, err) {
    if (isDev || err.expose) {
      ctx.body = err.message;
      return;
    }
    ctx.res._headers = {};

    // force text/plain
    ctx.type = 'text';

    // status body
    ctx.status = err.status || 500;
  }

  /**
   * default json error handler
   * @param {Context} ctx
   * @param {Error} err
   */

  function json(ctx, err) {
    ctx.body = isDev || err.expose
      ? { error: err.message }
      : { error: http.STATUS_CODES[ctx.status] };
  }
}
