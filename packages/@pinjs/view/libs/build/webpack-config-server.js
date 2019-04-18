const path = require('path');
const nodeExternals = require('webpack-node-externals');
const ReactLoadableSSRAddon = require('react-loadable-ssr-addon');

const common = require('./webpack-config-common');
const entryIndex = path.join(path.dirname(path.dirname(__dirname)), 'src/server');

const getConfigs = config => {
    let webpackConfig = Object.assign({}, common.getCommonWebpackConfig(config, entryIndex, true), {
        name: 'server',
        target: 'node',
        entry: [entryIndex],
        output: {
            publicPath: config.publicPath,
            path: path.resolve(config.serverOutputDir),
            filename: '[name].js',
            chunkFilename: common.isDevMode ? '[name].js' : '[name].[chunkhash].js',
            libraryExport: 'default',
            libraryTarget: 'commonjs2',
        },
        externals: [nodeExternals({
            whitelist: [
                '@pinjs/view/link',
            ]
        })],
    });

    webpackConfig.plugins.unshift(new ReactLoadableSSRAddon({
        filename: 'react-loadable-manifest.json',
    }));

    return webpackConfig;
}

exports.getConfigs = getConfigs;
