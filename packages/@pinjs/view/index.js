const path = require('path');
const webpack = require('webpack');
const build = require('./libs/build');
const utils = require('./libs/utils');
const logger = require('./libs/logger');
const dev = require('./dev');

class PinView {
    constructor(config) {
        this.config = Object.assign({
            pagesDir: path.join(process.cwd(), 'pages/'),
            publicPath: '/build/',
            clientOutputDir: path.join(process.cwd(), 'build/client'),
            serverOutputDir: path.join(process.cwd(), 'build/server'),
        }, config || {});

        this.webpackConfig = {};
        this.webpackDevServerOptions = {};
        this.webpackCompiler = null;

        this.SSRBundleManifest = null;
        this.SSRBuildpath = this.config.serverOutputDir;
        this.SSRBuildClass = null;
        this.SSRBuild = null;
    }

    async loadSSRBuild() {
        this.SSRBundleManifest = require(this.config.clientOutputDir + '/react-loadable-manifest.json');
        this.SSRBuildFile = this.SSRBuildpath + '/main.js';
        utils.purgeCache(this.SSRBuildFile);
        this.SSRBuildClass = require(this.SSRBuildFile);
        await this.SSRBuildClass.preload();
        this.SSRBuild = new this.SSRBuildClass(this.config);
    }

    async init(rebuild = true, webpackDevServerOptions = {}) {
        this.webpackDevServerOptions = dev.config(this.config.publicPath, webpackDevServerOptions);
        this.webpackConfig = await build.getWebpackConfigs(this.config);
        this.webpackCompiler = webpack(this.webpackConfig);

        if (rebuild) {
            await build.buildClient(this.config, this.webpackCompiler.compilers[0]);
            await build.buildServer(this.config, this.webpackCompiler.compilers[1]);
            logger.info('> Build completed')
        }
        await this.loadSSRBuild();
        await this.initWebpack();
    }

    async initWebpack() {
        const serverCompiler = this.webpackCompiler.compilers[1];
        serverCompiler.hooks.watchRun.tapAsync('pinjsView', (_compiler, done) => {
            let watchFileSystem = _compiler.watchFileSystem;
            let watcher = watchFileSystem.watcher || watchFileSystem.wfs.watcher;
            let updatedFile = Object.keys(watcher.mtimes)[0];

            if (updatedFile && !updatedFile.startsWith(path.join(process.cwd(), '.pinjs', 'view'))) {
                logger.info('> File updated: ' + updatedFile);
            }
            return done();
        });
        serverCompiler.hooks.done.tapAsync('pinjsView', async (stats, done) => {
            // console.log('hooks.done.tapAsync');
            await this.loadSSRBuild();
            return done();
        });
    }

    middleware() {
        return [
            dev.middleware(this.webpackCompiler, this.webpackDevServerOptions.middleware),
            dev.hot(this.webpackCompiler.compilers[0])
        ];
    }

    async render(req, res, pagePath, query) {
        if (pagePath == '/favicon.ico') {
            return res.end('ok');
        }

        const rendered = await this.SSRBuild.render(pagePath, {}, this.SSRBundleManifest);
        res.end(`<!doctype html><html lang="en"><head>${rendered.cssFiles.map(file => `<link rel="stylesheet" href="${file}" />`)}</head><body><div id="app">${rendered.html}</div>${rendered.jsScripts.join('\n')}</body></html>`);
    }
}

module.exports = PinView;
