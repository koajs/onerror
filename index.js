'use strict';

const http = require('http');
const path = require('path');
const fs = require('fs');

const env = process.env.NODE_ENV || 'development';
const isDev = env === 'development';
const templatePath = isDev
  ? path.join(__dirname, 'templates/dev_error.html')
  : path.join('templates/prod_error.html');
const defaultTemplate = fs.readFileSync(templatePath, 'utf8');

const defaultOptions = {
  text: text,
  json: json,
  html: html,
  redirect: null,
  template: path.join(__dirname, 'error.html'),
  accepts: null,
};

module.exports = function onerror(app, options) {
  options = Object.assign({}, defaultOptions, options);

  app.context.onerror = function(err) {
    // don't do anything if there is no error.
    // this allows you to pass `this.onerror`
    // to node-style callbacks.
    if (err == null) {
      return;
    }

    // wrap non-error object
    if (!(err instanceof Error)) {
      err = new Error('non-error thrown: ' + err);
    }

    // delegate
    this.app.emit('error', err, this);

    // nothing we can do here other
    // than delegate to the app-level
    // handler and log.
    if (this.headerSent || !this.writable) {
      err.headerSent = true;
      return;
    }

    // ENOENT support
    if (err.code === 'ENOENT') {
      err.status = 404;
    }

    if (typeof err.status !== 'number' || !http.STATUS_CODES[err.status]) {
      err.status = 500;
    }
    this.status = err.status;

    this.set(err.headers);

    let type = 'text';
    if (options.accepts) {
      type = options.accepts.call(this, 'html', 'text', 'json');
    } else {
      type = this.accepts('html', 'text', 'json');
    }
    type = type || 'text';
    if (options.all) {
      options.all.call(this, err, this);
    } else {
      if (options.redirect && type !== 'json') {
        this.redirect(options.redirect);
      } else {
        options[type].call(this, err, this);
        this.type = type;
      }
    }

    if (type === 'json') {
      this.body = JSON.stringify(this.body);
    }
    this.res.end(this.body);
  };

  return app;
};

/**
 * default text error handler
 * @param {Error} err
 */

function text(err) {
  // unset all headers, and set those specified
  this.res._headers = {};
  this.set(err.headers);

  this.body = isDev || err.expose
    ? err.message
    : http.STATUS_CODES[this.status];
}

/**
 * default json error handler
 * @param {Error} err
 */

function json(err) {
  this.body = isDev || err.expose
    ? { error: err.message }
    : { error: http.STATUS_CODES[this.status] };
}

/**
 * default html error handler
 * @param {Error} err
 */

function html(err) {
  this.body = defaultTemplate
    .replace('{{status}}', err.status)
    .replace('{{stack}}', err.stack);
  this.type = 'html';
}
