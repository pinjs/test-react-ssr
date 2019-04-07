const path = require('path');
const fs = require('fs-extra');
const mkdirp = require('mkdirp');
const glob = require('fast-glob');
const webpack = require('webpack');
const ProgressPlugin = require('webpack/lib/ProgressPlugin');

const webpackConfigClient = require('./webpack-config-client');
const webpackConfigServer = require('./webpack-config-server');
const pinViewDir = path.join(process.cwd(), '.pinjs/view');

!fs.existsSync(pinViewDir) && mkdirp(pinViewDir);

const getPageList = async (pageDir, pages = []) => {
    let pagesFound = glob.sync([`${pageDir}/*\.(js|jsx)`, `${pageDir}/**/*\.(js|jsx)`]);
    let pinViewPageManifestFile = path.join(pinViewDir, 'page-manifest.json');
    let pinViewPageComponent = path.join(pinViewDir, 'pages.jsx');
    let pageManifestContent = [];
    let pageComponentContent = [];
    let pageImport = [];
    pagesFound.forEach(page => {
        let pageCleanName = page.substring(pageDir.length + 1);
        let pathName = pageCleanName.substring(0, pageCleanName.length - path.extname(pageCleanName).length);
        let pageKeyName = pathName.replace(/[^a-zA-Z0-9_]/g, '___');
        pageManifestContent.push({
            pathname: pathName,
            component: page
        });

        pageImport.push(`const ${pageKeyName} = Loadable({
            loader: () => import(/* webpackChunkName: "${pathName}" */'${page}'),
            loading: () => Loading
        })`);
        pageComponentContent.push(
            `'${pathName}': ${pageKeyName}`
        );
    });

    fs.writeFileSync(pinViewPageManifestFile, JSON.stringify(pageManifestContent, null, 4));
    fs.writeFileSync(pinViewPageComponent, `import Loadable from 'react-loadable'; import React from 'react'; const Loading = <div>Loading...</div>;${pageImport.join('\n')};const pagesMap = {${pageComponentContent.join(',')}};export default pagesMap;`);
}

const build = async webpackConfig => {
    return new Promise((resolve, reject) => {
        const compiler = webpack(webpackConfig);

        compiler.apply(new ProgressPlugin((percentage, msg, current, active, modulepath) => {
            if (process.stdout.isTTY && percentage < 1) {
                process.stdout.cursorTo(0)
                modulepath = modulepath ? ' …' + modulepath.substr(modulepath.length - 30) : ''
                current = current ? ' ' + current : ''
                active = active ? ' ' + active : ''
                process.stdout.write((percentage * 100).toFixed(0) + '% ' + msg + current + active + modulepath + ' ')
                process.stdout.clearLine(1)
            } else if (percentage === 1) {
                process.stdout.write('\n')
                console.log('webpack: done.')
            }
        }))

        compiler.run((err, stats) => {
            if (err) return reject(err);

            process.stdout.write(stats.toString({
                colors: true,
                modules: false,
                children: false,
                chunks: false,
                chunkModules: false
            }) + '\n\n');

            return resolve();
        })
    })
}

const buildClient = async config => {
    mkdirp.sync(config.clientOutputDir);
    let pages = await getPageList(config.pageDir, []);
    let webpackConfig = webpackConfigClient.getConfigs(config);
    await build(webpackConfig);
}

const buildServer = async config => {
    mkdirp.sync(config.serverOutputDir);
    let pages = await getPageList(config.pageDir, []);
    let webpackConfig = webpackConfigServer.getConfigs(config);
    await build(webpackConfig);
}

const getWebpackConfigs = async config => {
    await getPageList(config.pageDir, []);
    let webpackClientConfig = webpackConfigClient.getConfigs(config);
    let webpackServerConfig = webpackConfigServer.getConfigs(config);

    return [webpackClientConfig, webpackServerConfig];
}

const getWebpackClientConfig = async config => {
    await getPageList(config.pageDir, []);
    return webpackConfigClient.getConfigs(config);
}

exports.buildClient = buildClient;
exports.buildServer = buildServer;
exports.getWebpackConfigs = getWebpackConfigs;
exports.getWebpackClientConfig = getWebpackClientConfig;
