const path = require('path');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotClient = require('webpack-hot-client');
const build = require('./libs/build');

class PinView {
    constructor(config) {
        this.config = Object.assign({
            pagesDir: path.join(process.cwd(), 'pages/'),
            publicPath: '/build/',
            clientOutputDir: path.join(process.cwd(), 'build/client'),
            serverOutputDir: path.join(process.cwd(), 'build/server'),
        }, config || {});

        this.SSRBundleManifest = null;
        this.SSRBuildpath = this.config.serverOutputDir;
        this.SSRBuildClass = null;
        this.SSRBuild = null;
    }

    async init() {
        await build.buildClient(this.config);
        await build.buildServer(this.config);

        this.SSRBundleManifest = require(this.config.clientOutputDir + '/react-loadable-manifest.json');
        this.SSRBuildClass = require(this.SSRBuildpath);
        await this.SSRBuildClass.preload();
        this.SSRBuild = new this.SSRBuildClass(this.config);
    }

    getClient(compiler, options) {
        return new Promise((resolve) => {
            const client = webpackHotClient(compiler, options.hotClient);
            const { server } = client;
      
            server.on('listening', () => resolve(client));
        });
    }

    getMiddleware(compiler, devMiddleware) {
        return (context, next) => {
        // wait for webpack-dev-middleware to signal that the build is ready
        const ready = new Promise((resolve, reject) => {
            for (const comp of [].concat(compiler.compilers || compiler)) {
                comp.hooks.failed.tap('KoaWebpack', (error) => reject(error));
            }
    
            devMiddleware.waitUntilValid(() => resolve(true));
        });
        // tell webpack-dev-middleware to handle the request
        const init = new Promise((resolve) => {
            devMiddleware(
            context.req,
            {
                end: (content) => {
                    // eslint-disable-next-line no-param-reassign
                    context.body = content;
                    resolve();
                },
                getHeader: context.get.bind(context),
                setHeader: context.set.bind(context),
                locals: context.state
            },
            () => resolve(next())
            );
        });
    
        return Promise.all([ready, init]);
        };
    }

    async middleware(options = {}) {
        options = Object.assign({
            devMiddleware: {
                hot: true,
                writeToDisk: true,
                serverSideRender: true,
                publicPath: this.config.publicPath,
                logLevel: 'silent',
            },
            hotClient: {
                logLevel: 'silent'
            },
        }, options || {});
        console.log(options)

        let webpackConfig = await build.getWebpackConfigs(this.config);
        let compiler = webpack(webpackConfig);
        const hotClient = await this.getClient(compiler, options);
        const devMiddleware = webpackDevMiddleware(compiler, options.devMiddleware);
        const middleware = this.getMiddleware(compiler, devMiddleware);
        const close = (callback) => {
            const next = hotClient ? () => hotClient.close(callback) : callback;
            devMiddleware.close(next);
        };

        return Object.assign(middleware, {
            hotClient,
            devMiddleware,
            close
        });
    }

    async render(req, res, pagePath, query) {
        const rendered = await this.SSRBuild.render(pagePath, {}, this.SSRBundleManifest);
        res.end(`<!doctype html>
<html lang="en">
<head>${rendered.cssFiles.map(file => `<link rel="stylesheet" href="${file}" />`)}</head>
<body>
    <div id="app">${rendered.html}</div>
    ${rendered.jsScripts.join('\n')}
</body>
</html>`);
    }
}

module.exports = PinView;
