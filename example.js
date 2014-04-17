
/**
 * Module dependencies.
 */

var fs = require('fs');
var koa = require('koa');
var error = require('./');
var app = koa();

error(app);

app.use(function *(){
  // foo();
  this.body = fs.createReadStream('not exist');
});

app.listen(3000);
console.log('listening on port 3000');
