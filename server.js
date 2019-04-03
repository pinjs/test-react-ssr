const Koa = require('koa');
const Router = require('koa-router');
const core = require('./libs/core');

const app = new Koa();
const router = new Router();

router.get('*', async (ctx, next) => {
    // await handler(ctx.path, ctx.query);
    ctx.body = 'body pppl';
});

app
    .use(router.routes())
    .use(router.allowedMethods());
app.listen(3000, () => console.log('App listening on port 3000'));

(async () => {
    const handler = await core.getHandler();
})();