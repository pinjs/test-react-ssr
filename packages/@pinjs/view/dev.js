const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const PassThrough = require('stream').PassThrough;
const hotClient = require('./libs/hotClient');

const config = (publicPath, webpackDevServerOptions) => {
    return Object.assign({
        middleware: {
            hot: true,
            writeToDisk: true,
            serverSideRender: true,
            publicPath: publicPath,
            logLevel: 'silent',
            watchOptions: {
                // ignored: /view\/pages\.jsx/
            }
        },
        hotClient: {
            port: 44297,
            reload: true,
            logLevel: 'info'
        },
    }, webpackDevServerOptions || {})
}

const middleware = (compiler, options) => {
    const devMiddleware = webpackDevMiddleware(compiler, options);
    const devServerMiddleware = (ctx, next) => {
        // wait for webpack-dev-middleware to signal that the build is ready
        const ready = new Promise((resolve, reject) => {
            for (const comp of [].concat(compiler.compilers || compiler)) {
                comp.hooks.failed.tap('pinjsView', (error) => reject(error));
            }

            devMiddleware.waitUntilValid(() => resolve(true));
        });
        // tell webpack-dev-middleware to handle the request
        const init = new Promise((resolve) => {
            devMiddleware(
                ctx.req, {
                    end: content => {
                        // eslint-disable-next-line no-param-reassign
                        ctx.body = content;
                        resolve();
                    },
                    getHeader: ctx.get.bind(ctx),
                    setHeader: ctx.set.bind(ctx),
                    locals: ctx.state
                },
                () => resolve(next())
            );
        });

        return Promise.all([ready, init]);
    };

    devServerMiddleware.close = callback => devMiddleware.close(callback);

    return devServerMiddleware;
}

const hotMiddleware = compiler => {
    let middleware = webpackHotMiddleware(compiler, {
        path: '/__webpack_hmr',
        heartbeat: 10 * 1000,
        reload: true,
        noInfo: true,
    });

    return async (ctx, next) => {
        if (ctx.request.path != '/__webpack_hmr') {
            return await next();
        }

        let stream = new PassThrough()
        ctx.body = stream

        middleware(ctx.req, {
            end: () => stream.end(),
            write: stream.write.bind(stream),
            writeHead: (status, headers) => {
                ctx.status = status;
                Object.keys(headers).forEach(key => ctx.set(key, headers[key]));
            },
        }, next)
    }
}

exports.config = config;
exports.middleware = middleware;
exports.hotMiddleware = hotMiddleware;
exports.getHotClient = hotClient.getHotClient;
