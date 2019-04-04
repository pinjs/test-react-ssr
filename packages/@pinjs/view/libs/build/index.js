const mkdirp = require('mkdirp');
const webpack = require('webpack');
const ProgressPlugin = require('webpack/lib/ProgressPlugin');

const webpackConfigClient = require('./webpack-config-client');
const webpackConfigServer = require('./webpack-config-server');

const getPageList = async (pageDir, pages) => {

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
    let webpackConfig = webpackConfigClient.getConfigs(config);
    await build(webpackConfig);
}

const buildServer = async config => {
    mkdirp.sync(config.serverOutputDir);
    let webpackConfig = webpackConfigServer.getConfigs(config);
    await build(webpackConfig);
}

exports.buildClient = buildClient;
exports.buildServer = buildServer;
