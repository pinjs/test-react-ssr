const _ = require('lodash');
const webpackDevMiddleware = require('webpack-dev-middleware');
const hotClient = require('./hotClient');
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Author: Ben Barkay
 * Url: https://stackoverflow.com/a/14801711/2422005
 */
const purgeCache = moduleName => {
    // Traverse the cache looking for the files
    // loaded by the specified module name
    searchCache(moduleName, mod => {
        delete require.cache[mod.id];
    });

    // Remove cached paths to the module.
    // Thanks to @bentael for pointing this out.
    Object.keys(module.constructor._pathCache).forEach(cacheKey => {
        if (cacheKey.indexOf(moduleName) > 0) {
            delete module.constructor._pathCache[cacheKey];
        }
    });
};

/**
 * Traverses the cache to search for all the cached
 * files of the specified module name
 */
const searchCache = (moduleName, callback) => {
    // Resolve the module identified by the specified name
    var mod = require.resolve(moduleName);

    // Check if the module has been resolved and found within
    // the cache
    if (mod && ((mod = require.cache[mod]) !== undefined)) {
        // Recursively go over the results
        (function traverse(mod) {
            // Go over each of the module's children and
            // traverse them
            mod.children.forEach(function (child) {
                if (!/node_modules/.test(child.filename)) {
                    traverse(child);
                }
            });

            // Call the specified callback providing the
            // found cached module
            callback(mod);
        }(mod));
    }
};

const config = (publicPath, webpackOptions) => {
    return {
        devServer: Object.assign({
            hot: true,
            writeToDisk: true,
            serverSideRender: true,
            publicPath: publicPath,
            logLevel: 'silent',
        }, webpackOptions.devServer || {}),
        hotClient: Object.assign({
            port: 44297,
            reload: true,
            logLevel: 'info'
        }, webpackOptions.hotClient || {}),
    };
}

const waitUntilValid = (compiler, devMiddleware) => {
    return new Promise((resolve, reject) => {
        for (const comp of [].concat(compiler.compilers || compiler)) {
            comp.hooks.failed.tap('PinJsView', error => reject(error));
        }

        devMiddleware.waitUntilValid(() => resolve(devMiddleware));
    });
}

const getWebpackDevMiddleware = async (compiler, options) => {
    const devMiddleware = webpackDevMiddleware(compiler, options);

    return await waitUntilValid(compiler, devMiddleware);
}

const beforeViewRender = async (req, res, compiler, webpackDevMiddleware) => {
    if (isProduction) return;

    await waitUntilValid(compiler, webpackDevMiddleware);

    return new Promise((resolve) => {
        res = Object.assign(res, {
            getHeader: key => res.headers[key] || null,
            locals: {}
        });

        webpackDevMiddleware(req, res, () => resolve());
    });
}

const normalizeDevMiddlewareAssets = assets => {
    if (_.isObject(assets)) {
        return Object.values(assets);
    }

    return Array.isArray(assets) ? assets : [assets];
}

const getSSRDevMiddlewareAssets = (pagePath, webpackStats, fs) => {
    pagePath = pagePath.substring(1);
    const assetsByChunkName = webpackStats.stats[0].toJson().assetsByChunkName;
    const outputPath = webpackStats.stats[0].toJson().outputPath;

    const assets = normalizeDevMiddlewareAssets(assetsByChunkName[pagePath]);

    const jsScripts = assets.filter(path => path.endsWith('.js')).map(js => {
        return `<script src="${outputPath + js}">${fs.readFileSync(outputPath + '/' + js)}</script>`;
    });
    const cssScripts = [
        `<style>
            ${assets.filter(path => path.endsWith('.css')).map(css => fs.readFileSync(outputPath + '/' + js)).join('\n')}
        </style>`
    ];

    return {
        jsScripts,
        cssScripts
    };
}

exports.purgeCache = purgeCache;
exports.config = config;
exports.getWebpackDevMiddleware = getWebpackDevMiddleware;
exports.getWebpackHotClient = hotClient.getHotClient;
exports.beforeViewRender = beforeViewRender;
exports.getSSRDevMiddlewareAssets = getSSRDevMiddlewareAssets;
