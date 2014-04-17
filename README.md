koa-error-handler
=================

an error handler for koa, hack ctx.onerror

different with [koa-error](https://github.com/kosjs/koa):
- we can not just use try catch to handle all errors, steams' and events'
errors are directly handle by `ctx.onerror`, so if we want to handle all
errors in one place, only way i can see is to hack `ctx.onerror`.
- also it is more customizable.

## install

```bash
npm install koa-error-handler
```

## Usage

```js
var fs = require('fs');
var koa = require('koa');
var error = require('koa-error-handler');
var app = koa();

error(app);

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
