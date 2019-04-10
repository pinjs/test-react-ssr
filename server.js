const Koa = require('koa');
const serve = require('koa-static');
const Router = require('koa-router');
const PinView = require('@pinjs/view');
const config = require('./config.pin');
const app = new Koa();
const router = new Router();

(async () => {
    try {
        const view = new PinView(config);
        await view.init();
        router.use(view.middleware());

        router.get('*', async (ctx, next) => {
            ctx.status = 200;
            await view.render(ctx.req, ctx.res, ctx.path, ctx.query);
        });

        app.use(serve('./public'));
        app.use(router.routes()).use(router.allowedMethods());
        app.listen(3000, () => console.log('> Application running on port 3000'));
    } catch (e) {
        console.error(e);
    }
})();
