const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const build = require('./libs/build');
const utils = require('./libs/utils');
const logger = require('./libs/logger');
const isProduction = process.env.NODE_ENV === 'production';

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

        if (!isProduction) {
            this.webpackConfig = {};
            this.webpackOptions = {};
            this.webpackCompiler = null;
            this.webpackDevMiddleware = null;
        }
    }

    async init(webpackOptions = {}) {
        if (isProduction) {
            return await this.loadSSRBuild();
        }

        this.webpackOptions = utils.config(this.config.publicPath, webpackOptions);
        this.webpackConfig = await build.getWebpackConfigs(this.config);
        this.webpackCompiler = webpack(this.webpackConfig);
        this.webpackDevMiddleware = await utils.getWebpackDevMiddleware(this.webpackCompiler, this.webpackOptions.devServer);

        const clientCompiler = this.webpackCompiler.compilers[0];
        const serverCompiler = this.webpackCompiler.compilers[1];
        await utils.getWebpackHotClient(clientCompiler, this.webpackOptions.hotClient);
        await this.loadSSRBuild();
        this.initWebpackSSRWatcher(serverCompiler);
    }

    async loadSSRBuild() {
        this.SSRBuildFile = this.SSRBuildpath + '/main.js';
        this.SSRBundleManifestFile = this.config.serverOutputDir + '/react-loadable-manifest.json';

        if (!fs.existsSync(this.SSRBuildFile) || !fs.existsSync(this.SSRBundleManifestFile)) {
            logger.error('No production build found!');
            process.exit();
        }

        utils.purgeCache(this.SSRBuildFile);
        this.SSRBundleManifest = require(this.SSRBundleManifestFile);
        this.SSRBuildClass = require(this.SSRBuildFile);
        await this.SSRBuildClass.preload();
        this.SSRBuild = new this.SSRBuildClass(this.config);
    }

    async initWebpackSSRWatcher(serverCompiler) {
        serverCompiler.hooks.watchRun.tapAsync('PinJsView', (_compiler, done) => {
            let watchFileSystem = _compiler.watchFileSystem;
            let watcher = watchFileSystem.watcher || watchFileSystem.wfs.watcher;
            let updatedFile = Object.keys(watcher.mtimes)[0];

            if (updatedFile && !updatedFile.startsWith(path.join(process.cwd(), '.pinjs', 'view'))) {
                logger.info('> File updated: ' + updatedFile);
            }
            return done();
        });
        serverCompiler.hooks.done.tapAsync('PinJsView', async (stats, done) => {
            await this.loadSSRBuild();
            return done();
        });
    }

    async render(req, res, pagePath, query) {
        if (pagePath == '/favicon.ico') {
            return res.end('ok');
        }

        await utils.beforeViewRender(req, res, this.webpackDevMiddleware);

        let rendered = await this.SSRBuild.render(pagePath, {}, this.SSRBundleManifest);
        let cssScripts = rendered.cssScripts || [];
        let jsScripts = rendered.jsScripts || [];

        if (!isProduction && !this.webpackOptions.devServer.writeToDisk) {
            let devAssets = utils.getSSRDevMiddlewareAssets(pagePath, res.locals.webpackStats, res.locals.fs);
            cssScripts = devAssets.cssScripts || [];
            jsScripts = devAssets.jsScripts || [];
        }

        res.end(`<!doctype html><html lang="en"><head>${cssScripts.join('\n')}</head><body><div id="app">${rendered.html}</div>${jsScripts.join('\n')}</body></html>`);
    }
}

module.exports = PinView;
