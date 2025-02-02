const fs = require('node:fs');
const Koa = require('koa');
const { onerror } = require('./');

const app = new Koa();

onerror(app);

app.use(async ctx => {
  foo();
  ctx.body = fs.createReadStream('not exist');
});

app.listen(3000);
console.log('listening on port http://localhost:3000');
