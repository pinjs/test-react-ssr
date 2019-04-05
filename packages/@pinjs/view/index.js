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

        this.SSRBundleManifest = null;
        this.SSRBuildpath = this.config.serverOutputDir;
        this.SSRBuildClass = null;
        this.SSRBuild = null;
    }

    async init() {
        await build.buildClient(this.config);
        await build.buildServer(this.config);

        this.SSRBundleManifest = require(this.config.serverOutputDir + '/react-loadable-manifest.json');
        this.SSRBuildClass = require(this.SSRBuildpath);
        await this.SSRBuildClass.preload();
        this.SSRBuild = new this.SSRBuildClass(this.config);
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
