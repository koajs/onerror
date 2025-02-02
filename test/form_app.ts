import { scheduler } from 'node:timers/promises';
import Koa from 'koa';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - co-busboy is not typed
import parse from 'co-busboy';
import { onerror } from '../src/index.js';

const app = new Koa();
app.on('error', () => {});
onerror(app);
app.use(async ctx => {
  if (ctx.path === '/') {
    ctx.body = `
    <h2>Upload File</h2>
    <form action="/upload" method="POST" enctype="multipart/form-data">
      <ul>
        <li>File Name: <input name="name" type="text" /></li>
        <li><input name="file" type="file" /></li>
        <li><input type="submit" value="Upload" /></li>
      </ul>
    </form>
    `;
    return;
  }
  await scheduler.wait(10);
  if (!ctx.is('multipart')) {
    ctx.throw(400, 'Content-Type must be multipart/*');
  }
  const parts = parse(ctx, { autoFields: true });
  const stream = await parts();
  // console.log(stream.filename, parts.field);
  stream.undefiend.error();
});

// if (!module.parent) {
//   app.listen(8080);
//   console.log('Listen at http://127.0.0.1:8080');
// }

export { app };
