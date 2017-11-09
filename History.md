
4.0.0 / 2017-11-09
==================

**others**
  * [[`df878e4`](http://github.com/koajs/onerror/commit/df878e4605c91aa55489a249c4093642f16ce96b)] - refactor: support koa 2 (#27) (Yiyu He <<dead_horse@qq.com>>)

3.1.0 / 2017-03-02
==================

  * feat: can reach err.headerSent in app error listener (#23)
  * feat: non-error wrapper support status and headers (#22)

3.0.2 / 2017-02-16
==================

  * fix: try to restore non Error instance properties (#20)
  * fix: change the koa-error url (#17)

3.0.1 / 2016-10-21
==================

  * fix: use absolute path (#16)

3.0.0 / 2016-10-21
==================

  * fix: Send default text/plain body if message is undefined
  * refactor: remove nunjucks

2.1.0 / 2016-10-19
==================

  * fix: don't throw when non-error object passed (#15)
  * Return reference to app (#7)

2.0.0 / 2016-07-04
==================

  * refactor: use nunjucks instead of swig

1.3.1 / 2016-03-21
==================

  * fix: only unset text headers

1.3.0 / 2016-03-10
==================

  * feat: support set err.headers

1.2.1 / 2015-05-13
==================

  * Merge pull request #5 from koajs/fix-test-iojs
  * fix: test run on iojs and upgrade copy-to

1.2.0 / 2014-08-08
==================

  * fix status in on error

1.1.0 / 2014-08-05
==================

  * fix link
  * Merge pull request #4 from koajs/custom-accepts
  * update links and add coveralls
  * Support options.accepts custom detect function
  * fix readme

1.0.3 / 2014-04-25
==================

  * Merge pull request #2 from koajs/redirect
  * Allow `options.redirect = 'http://example/500.html'`.

1.0.2 / 2014-04-25
==================

  * use path.join

1.0.1 / 2014-04-25
==================

  * add assert error type
  * update repo

1.0.0 / 2014-04-24
==================

  * refine readme, bump dependencies
  * fix status

0.0.2 / 2014-04-18
==================

  * all do not set type

0.0.1 / 2014-04-18
==================

  * add test
  * fix status
  * rename to koa-onerror
  * refactor
  * update readme
  * update readme
  * error handler by hack ctx.onerror
  * Initial commit
