const _ = require('lodash');
const path = require('path');
const fs = require('fs-extra');
const mkdirp = require('mkdirp');
const glob = require('fast-glob');
const webpack = require('webpack');
const logger = require('../logger');

const webpackConfigClient = require('./webpack-config-client');
const webpackConfigServer = require('./webpack-config-server');
const pinViewDir = path.join(process.cwd(), '.pinjs/view');

!fs.existsSync(pinViewDir) && mkdirp(pinViewDir);

const createPagesList = (namespace, pagesDir, customPages = []) => {
    if (pagesDir[pagesDir.length - 1] == '/') {
        pagesDir = pagesDir.substring(0, pagesDir.length - 1);
    }

    let pagesFound = glob.sync([`${pagesDir}/*\.(js|jsx)`, `${pagesDir}/**/*\.(js|jsx)`]);
    let pinViewPageManifestFile = path.join(pinViewDir, namespace + '-page-manifest.json');
    let pinViewPageComponent = path.join(pinViewDir, namespace + '-pages.jsx');
    let pageManifestContent = {};
    let pageComponentContent = {};
    let pageImport = {};
    let pathNamesList = [];

    pagesFound.forEach(page => {
        let pageCleanName = page.substring(pagesDir.length);
        let pathName = pageCleanName.substring(0, pageCleanName.length - path.extname(pageCleanName).length);
        let pageKeyName = pathName.replace(/[^a-zA-Z0-9_]/g, '___');
        let pageComponent = page;
        let chunkName = pathName;
        (chunkName[0] == '/') && (chunkName = chunkName.substring(1));

        (pathName == '/index') && (pathName = '/');
        if (pathName.endsWith('/index')) {
            pathName = pathName.substring(0, pathName.length - 6);
        }

        pathNamesList.push(pathName);
        pageManifestContent[pathName] = {
            pathname: pathName,
            component: page
        }
        pageImport[pathName] = `const ${pageKeyName} = Loadable({
            loader: () => import(/* webpackChunkName: "${chunkName}" */'${pageComponent}'),
            loading: () => Loading,
            modules: ['${pageComponent}'],
        })`;
        pageComponentContent[pathName] = `'${pathName}': ${pageKeyName}`
    });

    /** Process custom pages */
    customPages.forEach(page => {
        let pageCleanName = null;
        let pathName = null;
        let pageKeyName = null;
        let pageComponent = null;

        if (_.isString(page)) {
            pageCleanName = path.basename(page);
            pathName = '/' + pageCleanName.substring(0, pageCleanName.length - path.extname(pageCleanName).length);
            pageKeyName = pathName.replace(/[^a-zA-Z0-9_]/g, '___');
            pageComponent = page;
        } else {
            pageCleanName = page.cleanname || page.pathname;
            pathName = page.pathname;
            pageKeyName = pathName.replace(/[^a-zA-Z0-9_]/g, '___');
            pageComponent = page.component;
        }

        if (pathNamesList.includes(pathName)) {
            logger.info('> Overriding page: ' + pathName);
        }

        let chunkName = pathName;
        (chunkName[0] == '/') && (chunkName = chunkName.substring(1));
        (pathName == '/index') && (pathName = '/');
        pathNamesList.push(pathName);
        pageManifestContent[pathName] = {
            pathname: pathName,
            component: page
        }
        pageImport[pathName] = `const ${pageKeyName} = Loadable({
            loader: () => import(/* webpackChunkName: "${chunkName}" */'${pageComponent}'),
            loading: () => Loading,
            modules: ['${pageComponent}'],
        })`;
        pageComponentContent[pathName] = `'${pathName}': ${pageKeyName}`;
    });

    let exportDocumentPage = '';
    if (pageComponentContent['/_doc']) {
        exportDocumentPage = `const _doc = ____doc; export { _doc }`;
        delete pageComponentContent['/_doc'];
    }
    let exportAppPage = '';
    if (pageComponentContent['/_app']) {
        exportAppPage = `const _app = ____app; export { _app }`;
        delete pageComponentContent['/_app'];
    }
    let exportErrorPage = '';
    if (pageComponentContent['/_error']) {
        exportErrorPage = `const _error = ____error; export { _error }`;
        delete pageComponentContent['/_error'];
    }


    fs.writeFileSync(pinViewPageManifestFile, JSON.stringify(Object.values(pageManifestContent), null, 4));
    fs.writeFileSync(pinViewPageComponent, `import Loadable from 'react-loadable'; import React from 'react'; const Loading = <div>Loading...</div>;${Object.values(pageImport).join('\n')};const pagesMap = {${Object.values(pageComponentContent).join(',')}};export default pagesMap;\n${exportDocumentPage}\n${exportAppPage}\n${exportErrorPage}`);
}

const build = async (webpackConfig, label, compiler = null, output = false) => {
    process.stdout.write(`> Building ${label}...`);
    return new Promise((resolve, reject) => {
        compiler = compiler || webpack(webpackConfig);

        new webpack.ProgressPlugin((percentage, msg, current, active, modulepath) => {
            if (process.stdout.isTTY && percentage < 1) {
                process.stdout.cursorTo(0);
                modulepath = modulepath ? ' …' + modulepath.substr(modulepath.length - 30) : '';
                current = current ? ' ' + current : '';
                active = active ? ' ' + active : '';
                // process.stdout.write(`> Building ${label}: ${(percentage * 100).toFixed(0)}%  ${msg + current + active + modulepath} `);
                process.stdout.write(`> Building ${label}: ${(percentage * 100).toFixed(0)}%  ${active + path.basename(modulepath)} `);
                process.stdout.clearLine(1);
            } else if (percentage === 1) {
                process.stdout.cursorTo(0);
                process.stdout.write(`> Building ${label}: 100%`);
                process.stdout.clearLine(1);
            }
        }).apply(compiler);

        compiler.run((err, stats) => {
            if (err) return reject(err);
            process.stdout.write(` completed in ${stats.endTime - stats.startTime}ms`);
            process.stdout.write('\n');

            output && process.stdout.write(stats.toString({
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

const transformConfig = config => {
    if (config._view) {
        config = config._view;
    }

    if (!Array.isArray(config)) {
        config = [config];
    }

    return config;
}

const buildClient = async (config, compiler) => {
    config = transformConfig(config);
    for(var i = 0; i < config.length; i++) {
        let _config = config[i];
        mkdirp.sync(_config.clientOutputDir);
        let webpackConfig = webpackConfigClient.getConfigs(_config);
        await build(webpackConfig, 'Client ' + _config.namespace, compiler, true);
    }
}

const buildServer = async (config, compiler) => {
    config = transformConfig(config);
    for(var i = 0; i < config.length; i++) {
        let _config = config[i];
        mkdirp.sync(_config.serverOutputDir);
        let webpackConfig = webpackConfigServer.getConfigs(_config);
        await build(webpackConfig, 'Server ' + _config.namespace, compiler, true);
    }
}

const all = async config => {
    config = transformConfig(config);
    return Promise.all([
        buildClient(config),
        buildServer(config),
    ]);
}

const getWebpackConfigs = config => {
    createPagesList(config.namespace, config.pagesDir, config.customPages || []);
    let webpackClientConfig = webpackConfigClient.getConfigs(config);
    let webpackServerConfig = webpackConfigServer.getConfigs(config);

    return [webpackClientConfig, webpackServerConfig];
}

exports.all = all;
exports.buildClient = buildClient;
exports.buildServer = buildServer;
exports.createPagesList = createPagesList;
exports.getWebpackConfigs = getWebpackConfigs;
