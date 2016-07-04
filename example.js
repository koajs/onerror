'use strict';

const fs = require('fs');
const koa = require('koa');
const onerror = require('./');
const app = koa();

onerror(app);

app.use(function*() {
  // foo();
  this.body = fs.createReadStream('not exist');
});

app.listen(3000);
console.log('listening on port 3000');
