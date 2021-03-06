"use strict";

/**
 * Source: https://github.com/webpack-contrib/webpack-hot-client/blob/master/lib/client/index.js
 */

/* eslint-disable global-require, consistent-return */
(function hotClientEntry() {
    var isPinging = false;
    function ping (url, callback) {
        if (isPinging) return callback(new Error('Ping is still running'));
        isPinging = true;
        var img = new Image();
        img.onerror = function() {
            isPinging = false;
            callback(new Error('Ping server is down...'));
        }

        img.onload = function() {
            isPinging = false;
            log.info('Ping server is up...')
            callback(null);
        }

        img.src = url;
    }

    function waitForServerAvailable (pingUrl, callback) {
        var timer = setInterval(function() {
            ping(pingUrl, function(err) {
                if (!err) {
                    clearInterval(timer);
                }
                callback(err);
            })
        }, 1500);
    }


    // eslint-disable-next-line no-underscore-dangle
    if (window.__webpackHotClient__) {
        return;
    } // eslint-disable-next-line no-underscore-dangle


    window.__webpackHotClient__ = {}; // this is piped in at runtime build via DefinePlugin in /lib/plugins.js
    // eslint-disable-next-line no-unused-vars, no-undef

    var options = __hotClientOptions__;
    var log = require('webpack-hot-client/client/log'); // eslint-disable-line import/order

    log.level = options.logLevel;

    var update = require('webpack-hot-client/client/hot');
    var socket = require('./socket');

    if (!options) {
        throw new Error('Something went awry and __hotClientOptions__ is undefined. Possible bad build. HMR cannot be enabled.');
    }

    var currentHash;
    var initial = true;
    var isUnloading;
    window.addEventListener('beforeunload', function () {
        isUnloading = true;
    });

    function reload() {
        if (isUnloading) {
            return;
        }

        if (options.hmr) {
            log.info('App Updated, Reloading Modules');
            update(currentHash, options);
        } else if (options.reload) {
            log.info('Refreshing Page');
            window.location.reload();
        } else {
            log.warn('Please refresh the page manually.');
            log.info('The `hot` and `reload` options are set to false.');
        }
    }

    socket(options, {
        compile: function compile(_ref) {
            var compilerName = _ref.compilerName;
            log.info("webpack: Compiling (".concat(compilerName, ")"));
        },
        errors: function errors(_ref2) {
            var _errors = _ref2.errors;
            log.error('webpack: Encountered errors while compiling. Reload prevented.');

            for (var i = 0; i < _errors.length; i++) {
                log.error(_errors[i]);
            }
        },
        hash: function hash(_ref3) {
            var _hash = _ref3.hash;
            currentHash = _hash;
        },
        invalid: function invalid(_ref4) {
            var fileName = _ref4.fileName;
            log.info("App updated. Recompiling ".concat(fileName));
        },
        ok: function ok() {
            if (initial) {
                initial = false;
                return initial;
            }

            reload();
        },
        'window-reload': function windowReload() {
            window.location.reload();
        },
        reloadIfAvailable: function reloadIfAvailable(data) {
            var publicPath = data.publicPath || '/';
            waitForServerAvailable(publicPath + 'ping.png', function (err) {
                if (!err) {
                    return window.location.reload();
                }
                log.error(err.message || err);
            });
        },
        warnings: function warnings(_ref5) {
            var _warnings = _ref5.warnings;
            log.warn('Warnings while compiling.');

            for (var i = 0; i < _warnings.length; i++) {
                log.warn(_warnings[i]);
            }

            if (initial) {
                initial = false;
                return initial;
            }

            reload();
        }
    });
})();
