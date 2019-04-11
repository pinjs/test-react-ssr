const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ReactLoadableSSRAddon = require('react-loadable-ssr-addon');

const isDevMode = process.env.NODE_ENV !== 'production';
const entryIndex = path.join(path.dirname(path.dirname(__dirname)), 'src/server');

const getConfigs = config => {
    let webpackConfig = {
        watch: false,
        cache: false,
        mode: isDevMode ? 'development' : 'production',
        name: 'server',
        target: 'node',
        entry: [entryIndex],
        devtool: 'source-map',
        output: {
            publicPath: config.publicPath,
            path: config.serverOutputDir,
            filename: '[name].js',
            chunkFilename: isDevMode ? '[name].js' : '[name].[chunkhash].js',
            libraryExport: 'default',
            libraryTarget: 'commonjs2',
        },
        externals: [nodeExternals()],
        resolve: {
            extensions: ['.js', '.jsx'],
        },
        module: {
            rules: [{
                test: /\.(js|jsx)?$/,
                exclude: /(node_modules|bower_components|public\/)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        babelrc: false,
                        presets: [
                            '@babel/preset-env',
                            '@babel/preset-react',
                        ],
                        plugins: [
                            require('@babel/plugin-proposal-class-properties'),
                            require('@babel/plugin-proposal-object-rest-spread'),
                            require('@babel/plugin-syntax-dynamic-import'),
                            require('@babel/plugin-transform-runtime'),
                            require('react-loadable/babel'),
                        ],
                    },
                },
            }, ],
        },
        optimization: {
            nodeEnv: 'development',
            splitChunks: {
                cacheGroups: {
                    commons: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        chunks: 'all',
                        minChunks: 2,
                    },
                    default: {
                        minChunks: 2,
                        reuseExistingChunk: true,
                    },
                },
            },
        },
        plugins: [
            new ReactLoadableSSRAddon({
                filename: 'react-loadable-manifest.json',
            }),
            new webpack.DefinePlugin({
                OUTPUT_DIR: JSON.stringify(config.serverOutputDir),
                PIN_VIEW_DIR: JSON.stringify(path.join(process.cwd(), '.pinjs', 'view')),
                IS_SERVER: JSON.stringify(true),
            }),
            new CleanWebpackPlugin({
                dry: false,
                verbose: false,
                cleanStaleWebpackAssets: true,
                protectWebpackAssets: true,
                dangerouslyAllowCleanPatternsOutsideProject: true,
            }),
            new webpack.WatchIgnorePlugin([
                path.join(process.cwd(), '.pinjs', 'view', 'pages.jsx')
            ]),
        ],
    }

    return webpackConfig;
}

exports.getConfigs = getConfigs;
