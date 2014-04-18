/*!
 * koa-onerror - index.js
 * Copyright(c) 2014 dead_horse <dead_horse@qq.com>
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var http = require('http');
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
    if (options.all) {
      options.all.call(this, err);
    } else {
      options[type].call(this, err);
      this.type = type;
    }

    if (type === 'json') {
      this.body = JSON.stringify(this.body);
    }
    this.res.end(this.body);
  };

  /**
   * default html error handler
   * @param {Error} err
   */

  function html(err) {
    this.body = render({
      env: env,
      ctx: this,
      request: this.request,
      response: this.response,
      error: err.message,
      stack: err.stack,
      status: this.status,
      code: err.code
    });
  }

  /**
   * default text error handler
   * @param {Error} err
   */

  function text(err) {
    this.res._headers = {};
    this.status = err.status || 500;

    this.body = isDev || err.expose
      ? err.message
      : http.STATUS_CODES[this.status];
  }

  /**
   * default json error handler
   * @param {Error} err
   */

  function json(err) {
    this.status = err.status || 500;
    this.body = isDev || err.expose
      ? { error: err.message }
      : { error: http.STATUS_CODES[this.status] };
  }
}
