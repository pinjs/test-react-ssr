const fs = require('fs-extra');
const path = require('path');
const webpack = require('webpack');
const chokidar = require('chokidar');
const build = require('./libs/build');
const utils = require('./libs/utils');
const logger = require('./libs/logger');
const isProduction = process.env.NODE_ENV === 'production';

class PinView {
    constructor(config = {}) {
        if (config._view) {
            config = config._view;
        }

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

        this.webpackConfig = build.getWebpackConfigs(this.config);
        this.webpackOptions = utils.config(this.config.publicPath, webpackOptions);
        this.webpackCompiler = webpack(this.webpackConfig);
        const clientCompiler = this.webpackCompiler.compilers[0];
        const serverCompiler = this.webpackCompiler.compilers[1];
        await utils.getWebpackHotClient(clientCompiler, this.webpackOptions.hotClient, this.config.publicPath);
        this.webpackDevMiddleware = await utils.getWebpackDevMiddleware(this.webpackCompiler, this.webpackOptions.devServer);

        await this.loadSSRBuild();
        this.initFileWatcher(serverCompiler, clientCompiler);
    }

    async loadSSRBuild() {
        this.SSRBuildFile = this.SSRBuildpath + '/main.js';
        this.SSRBundleManifestFile = this.config.serverOutputDir + '/react-loadable-manifest.json';

        if (!fs.existsSync(this.SSRBuildFile) || !fs.existsSync(this.SSRBundleManifestFile)) {
            logger.error('No production build found!');
            process.exit();
        }

        utils.purgeCache(this.SSRBuildFile);
        utils.purgeCache(this.SSRBundleManifestFile);
        this.SSRBundleManifest = require(this.SSRBundleManifestFile);
        this.SSRBuildClass = require(this.SSRBuildFile);
        await this.SSRBuildClass.preload();
        this.SSRBuild = new this.SSRBuildClass(this.config);
    }

    async initFileWatcher(serverCompiler, clientCompiler) {
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

        /** Watch for new file in pages directory */
        const watcher = chokidar.watch(this.config.pagesDir, {
            ignored: /(^|[\/\\])\../,
            ignoreInitial: true,
            persistent: true
        });

        watcher.on('all', async (event, path) => {
            logger.info(`> ${event}: ${path}`);
            build.createPagesList(this.config.pagesDir);
            await this.loadSSRBuild();
        });
    }

    async render(req, res, pagePath, query) {
        if (pagePath == '/favicon.ico') {
            return res.end('ok');
        }

        await utils.beforeViewRender(req, res, this.webpackCompiler, this.webpackDevMiddleware);
        let devAssets = null;

        if (!isProduction && !this.webpackOptions.devServer.writeToDisk) {
            devAssets = utils.getSSRDevMiddlewareAssets(pagePath, res.locals.webpackStats, res.locals.fs);
        }

        let renderedHtml = await this.SSRBuild.render(pagePath, this.SSRBundleManifest, devAssets);

        res.end(renderedHtml);
    }
}

module.exports = PinView;
