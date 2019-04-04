const path = require('path');
const build = require('./libs/build');

class PinView {
    constructor(config) {
        this.config = Object.assign({
            pagesDir: path.join(process.cwd(), 'pages/'),
            publicPath: '/build/',
            clientOutputDir: path.join(process.cwd(), 'build/client'),
            serverOutputDir: path.join(process.cwd(), 'build/server'),
        }, config || {});

        this.SSRBuildpath = this.config.serverOutputDir;
        this.SSRBuildClass = null;
        this.SSRBuild = null;
    }

    async init() {
        await build.buildClient(this.config);
        await build.buildServer(this.config);

        this.SSRBuildClass = require(this.SSRBuildpath);
        this.SSRBuildClass.preload();
        this.SSRBuild = new this.SSRBuildClass(this.config);
    }

    async render(req, res, pagePath, query) {
        const bundleManifest = require(this.config.serverOutputDir + '/react-loadable-manifest.json');
        const rendered = this.SSRBuild.render(pagePath, {}, bundleManifest);

        res.end(`
        <!doctype html>
            <html lang="en">
            <head>${rendered.jsFiles.map(file => `<script src="${file}" async></script>`).join('\n')}</head>
            <body>
                <div id="app">${rendered.html}</div>
                ${rendered.cssFiles.map(file => `<link rel="stylesheet" href="${file}" />`)}
            </html>
        `);
    }
}

module.exports = PinView;
