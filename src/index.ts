import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { debuglog, format } from 'node:util';
import escapeHtml from 'escape-html';
import { sendToWormhole } from 'stream-wormhole';

const debug = debuglog('koa-onerror');

export type OnerrorError = Error & {
  status: number;
  headers?: Record<string, string>;
  expose?: boolean;
};

export type OnerrorHandler = (err: OnerrorError, ctx: any) => void;

export type OnerrorOptions = {
  text?: OnerrorHandler;
  json?: OnerrorHandler;
  html?: OnerrorHandler;
  all?: OnerrorHandler;
  redirect?: string | null;
  accepts?: (...args: string[]) => string;
};

const defaultOptions: OnerrorOptions = {
  text,
  json,
  html,
};

export function onerror(app: any, options?: OnerrorOptions) {
  options = { ...defaultOptions, ...options };

  app.context.onerror = function(err: any) {
    debug('onerror: %s', err);
    // don't do anything if there is no error.
    // this allows you to pass `this.onerror`
    // to node-style callbacks.
    if (err == null) {
      return;
    }

    // ignore all pedding request stream
    if (this.req) {
      sendToWormhole(this.req);
      debug('send the req to wormhole');
    }

    // wrap non-error object
    if (!(err instanceof Error)) {
      debug('err is not an instance of Error');
      let errMsg = err;
      if (typeof err === 'object') {
        try {
          errMsg = JSON.stringify(err);
        } catch (e) {
          debug('stringify error: %s', e);
          errMsg = format('%s', e);
        }
      }
      const newError = new Error('non-error thrown: ' + errMsg);
      // err maybe an object, try to copy the name, message and stack to the new error instance
      if (err) {
        if (err.name) newError.name = err.name;
        if (err.message) newError.message = err.message;
        if (err.stack) newError.stack = err.stack;
        if (err.status) {
          Reflect.set(newError, 'status', err.status);
        }
        if (err.headers) {
          Reflect.set(newError, 'headers', err.headers);
        }
      }
      err = newError;
    }

    const headerSent = this.headerSent || !this.writable;
    if (headerSent) {
      debug('headerSent is true');
      err.headerSent = true;
    }

    // delegate
    this.app.emit('error', err, this);

    // nothing we can do here other
    // than delegate to the app-level
    // handler and log.
    if (headerSent) return;

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
        (options as any)[type].call(this, err, this);
        this.type = type;
      }
    }

    if (type === 'json') {
      this.body = JSON.stringify(this.body);
    }
    debug('end the response, body: %s', this.body);
    this.res.end(this.body);
  };

  return app;
}

const devTemplate = fs.readFileSync(path.join(getSourceDirname(), 'templates/dev_error.html'), 'utf8');
const prodTemplate = fs.readFileSync(path.join(getSourceDirname(), 'templates/prod_error.html'), 'utf8');

function isDev() {
  return process.env.NODE_ENV === 'development';
}

/**
 * default text error handler
 */
function text(err: OnerrorError, ctx: any) {
  // unset all headers, and set those specified
  ctx.res._headers = {};
  ctx.set(err.headers);

  ctx.body = (isDev() || err.expose) && err.message
    ? err.message
    : http.STATUS_CODES[ctx.status];
}

/**
 * default json error handler
 */
function json(err: OnerrorError, ctx: any) {
  const message = (isDev() || err.expose) && err.message
    ? err.message
    : http.STATUS_CODES[ctx.status];

  ctx.body = { error: message };
}

/**
 * default html error handler
 */
function html(err: OnerrorError, ctx: any) {
  const template = isDev() ? devTemplate : prodTemplate;
  ctx.body = template
    .replace('{{status}}', escapeHtml(String(err.status)))
    .replace('{{stack}}', escapeHtml(err.stack));
  ctx.type = 'html';
}

export function getSourceDirname() {
  if (typeof __dirname === 'string') {
    return __dirname;
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const __filename = fileURLToPath(import.meta.url);
  return path.dirname(__filename);
}
