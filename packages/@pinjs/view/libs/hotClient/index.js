const nanoid = require('nanoid')
const stringify = require('json-stringify-safe');
const webpackHotClient = require('webpack-hot-client');
const ParserHelpers = require('webpack/lib/ParserHelpers');
const { HotModuleReplacementPlugin } = require('webpack');
const getOptions = require('webpack-hot-client/lib/options');
const logger = require('../logger');

const addEntry = (entry, compilerName, options) => {
    const clientEntry = [`${__dirname}/client?${compilerName || nanoid()}`];
    let newEntry = {};

    if (!Array.isArray(entry) && typeof entry === 'object') {
        const keys = Object.keys(entry);
        const [first] = keys;

        for (const entryName of keys) {
            if (options.allEntries) {
                newEntry[entryName] = clientEntry.concat(entry[entryName]);
            } else if (entryName === first) {
                newEntry[first] = clientEntry.concat(entry[first]);
            } else {
                newEntry[entryName] = entry[entryName];
            }
        }
    } else {
        newEntry = clientEntry.concat(entry);
    }

    return newEntry;
}

const hotEntry = (compiler, options) => {
    if (!options.validTargets.includes(compiler.options.target)) {
        return false;
    }

    const { entry } = compiler.options;
    const { name } = compiler;
    let newEntry;

    if (typeof entry === 'function') {
        /* istanbul ignore next */
        // TODO: run the build in tests and examine the output
        newEntry = function enter(...args) {
            // the entry result from the original entry function in the config
            let result = entry(...args);

            validateEntry(result);

            result = addEntry(result, name, options);

            return result;
        };
    } else {
        newEntry = addEntry(entry, name, options);
    }

    compiler.hooks.entryOption.call(compiler.options.context, newEntry);

    return true;
}

function hotPlugin(compiler) {
    const hmrPlugin = new HotModuleReplacementPlugin();

    /* istanbul ignore next */
    compiler.hooks.compilation.tap(
        'HotModuleReplacementPlugin',
        (compilation, { normalModuleFactory }) => {
            const handler = (parser) => {
                parser.hooks.evaluateIdentifier.for('module.hot').tap({
                        name: 'HotModuleReplacementPlugin',
                        before: 'NodeStuffPlugin',
                    },
                    (expr) =>
                    ParserHelpers.evaluateToIdentifier(
                        'module.hot',
                        !!parser.state.compilation.hotUpdateChunkTemplate
                    )(expr)
                );
            };

            normalModuleFactory.hooks.parser
                .for('javascript/auto')
                .tap('HotModuleReplacementPlugin', handler);
            normalModuleFactory.hooks.parser
                .for('javascript/dynamic')
                .tap('HotModuleReplacementPlugin', handler);
        }
    );

    hmrPlugin.apply(compiler);
}

const getHotClient = (compiler, opts = {}, publicPath) => {
    opts.autoConfigure = false;
    const client = webpackHotClient(compiler, opts);
    const server = client.server;

    hotPlugin(compiler);
    hotEntry(compiler, getOptions(opts));

    return new Promise(resolve => {
        server.on('listening', () => resolve());
        server.on('connection', socket => {
            socket.on('message', data => {
                try {
                    let clientData = JSON.parse(data);
                    if (clientData.type == 'reconnected') {
                        server.broadcast(stringify({ type: 'reloadIfAvailable', data: { publicPath } }));
                    }
                } catch (e) {
                    logger.error(e);
                }
            });
        });
    });
}

exports.getHotClient = getHotClient;
