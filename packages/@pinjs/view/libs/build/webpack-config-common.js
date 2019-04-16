const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const sharedDir = path.join(path.dirname(path.dirname(__dirname)), 'src/shared');
const componentsDir = path.join(path.dirname(path.dirname(__dirname)), 'src/components');
const PIN_VIEW_DIR = path.join(process.cwd(), '.pinjs', 'view');

exports.isDevMode = process.env.NODE_ENV !== 'production';
exports.getCommonWebpackConfig = (config, entryIndex) => {
    let customPageComponents = (config.customPages || []).map(pageComponent => {
        if (typeof pageComponent == 'string') {
            return pageComponent;
        }

        if (pageComponent && pageComponent.component) {
            return pageComponent.component;
        }
    });

    let webpackConfig = {
        watch: false,
        cache: false,
        mode: exports.isDevMode ? 'development' : 'production',
        devtool: 'source-map',
        resolve: {
            extensions: ['.js', '.jsx'],
            alias: {
                '@pinjs/view/link': path.resolve(path.join(process.cwd(), 'node_modules/@pinjs/view/src/components/link'))
            }
        },
        module: {
            rules: [{
                test: /\.(js|jsx)?$/,
                exclude: /(node_modules|bower_components|public\/)/,
                include: [
                    entryIndex,
                    sharedDir,
                    componentsDir,
                    config.pagesDir,
                    PIN_VIEW_DIR,
                    path.join(process.cwd(), 'node_modules/@pinjs/view/components/link'),
                ].concat(customPageComponents),
                use: {
                    loader: 'babel-loader',
                    options: {
                        babelrc: false,
                        presets: [
                            '@babel/preset-env',
                            '@babel/preset-react',
                        ],
                        plugins: [
                            // require('@babel/plugin-transform-runtime'),
                            ["@babel/transform-runtime"],
                            require('@babel/plugin-proposal-class-properties'),
                            require('@babel/plugin-proposal-object-rest-spread'),
                            require('@babel/plugin-syntax-dynamic-import'),
                            require('react-loadable/babel'),
                        ],
                    },
                },
            }],
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
            new webpack.DefinePlugin({
                OUTPUT_DIR: JSON.stringify(config.serverOutputDir),
                PIN_VIEW_DIR: JSON.stringify(PIN_VIEW_DIR),
                IS_SERVER: JSON.stringify(true),
            }),
            new CleanWebpackPlugin({
                dry: false,
                verbose: false,
                cleanStaleWebpackAssets: true,
                protectWebpackAssets: true,
                dangerouslyAllowCleanPatternsOutsideProject: true,
            }),
        ],
    }

    return webpackConfig;
}
