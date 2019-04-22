const MiniCssExtractPlugin = require('mini-css-extract-plugin');
module.exports = (config, isServer, options = {}) => {
    const cssLoader = {
        loader: isServer ? 'css-loader/locals' : 'css-loader',
    }

    config.plugins.push(new MiniCssExtractPlugin({
        filename: '[name].css',
        chunkFilename: '[id].css',
    }));

    // When not using css modules we don't transpile on the server
    if (isServer) {
        return ['ignore-loader']
    }

    return [
        MiniCssExtractPlugin.loader,
        cssLoader, // translates CSS into CommonJS
        'sass-loader' // compiles Sass to CSS, using Node Sass by default
    ]
}
