const path = require('path');
const common = require('./webpack-config-common');
const entryIndex = path.join(path.dirname(path.dirname(__dirname)), 'src/client');

const getConfigs = config => {
    let webpackConfig = Object.assign({}, common.getCommonWebpackConfig(config, entryIndex, false), {
        name: 'client',
        target: 'web',
        entry: [entryIndex],
        output: {
            publicPath: config.publicPath,
            path: path.resolve(config.clientOutputDir),
            filename: '[name].js',
            // chunkFilename: common.isDevMode ? '[name].js' : '[name].[chunkhash].js',
            chunkFilename: common.isDevMode ? '[name].js' : '[name].' + config.buildId + '.js',
        },
    });

    webpackConfig.module.rules.push({
        test: /clientPingFile\.png$/,
        use: [{
            loader: 'file-loader',
            options: {
                name: 'ping.png',
                outputPath: config.clientOutputDir,
            },
        }]
    });

    return webpackConfig;
}

exports.getConfigs = getConfigs;
