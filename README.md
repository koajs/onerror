# koa-onerror

[![NPM version][npm-image]][npm-url]
[![Test coverage][codecov-image]][codecov-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/koa-onerror.svg?style=flat
[npm-url]: https://npmjs.org/package/koa-onerror
[codecov-image]: https://codecov.io/gh/koajs/onerror/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/koajs/onerror
[snyk-image]: https://snyk.io/test/npm/koa-onerror/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/koa-onerror
[download-image]: https://img.shields.io/npm/dm/koa-onerror.svg?style=flat-square
[download-url]: https://npmjs.org/package/koa-onerror

an error handler for koa, hack ctx.onerror.

different with [koa-error](https://github.com/koajs/error):

- we can not just use try catch to handle all errors, steams' and events'
errors are directly handle by `ctx.onerror`, so if we want to handle all
errors in one place, the only way i can see is to hack `ctx.onerror`.
- it is more customizable.

## install

```bash
npm install koa-onerror
```

## Usage

```js
const fs = require('fs');
const koa = require('koa');
const onerror = require('koa-onerror');

const app = new koa();

onerror(app);

app.use(ctx => {
  // foo();
  ctx.body = fs.createReadStream('not exist');
});
```

## Options

```js
onerror(app, options);
```

- **all**: if `options.all` exist, ignore negotiation
- **text**: text error handler
- **json**: json error handler
- **html**: html error handler
- **redirect**: if accept `html` or `text`, can redirect to another error page

check out default handler to write your own handler.

## Status and Headers

`koa-onerror` will automatic set `err.status` as response status code, and `err.headers` as response headers.

## License

[MIT](LICENSE)

## Contributors

[![Contributors](https://contrib.rocks/image?repo=koajs/onerror)](https://github.com/koajs/onerror/graphs/contributors)

Made with [contributors-img](https://contrib.rocks).
