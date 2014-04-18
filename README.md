koa-onerror
=================
[![Build Status](https://travis-ci.org/node-modules/koa-onerror.svg?branch=master)](https://travis-ci.org/node-modules/koa-onerror)

an error handler for koa, hack ctx.onerror

different with [koa-error](https://github.com/kosjs/koa):
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
var fs = require('fs');
var koa = require('koa');
var onerror = require('koa-onerror');
var app = koa();

onerror(app);

app.use(function *(){
  // foo();
  this.body = fs.createReadStream('not exist');
});
```

## Options

```
error(app, options);
```

* **all**: if options.all exist, ignore negotiation
* **text**: text error handler
* **json**: json error handler
* **html**: html error handler
* **template**: default html error handler template path

## License
MIT
