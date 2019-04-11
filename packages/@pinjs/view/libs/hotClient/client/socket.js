"use strict";

/**
 * Source: https://github.com/webpack-contrib/webpack-hot-client/blob/master/lib/client/socket.js
 */

var url = require('url');
var log = require('webpack-hot-client/client/log');
var maxRetries = 10;
var retry = maxRetries;

module.exports = function connect(options, handler, reconnect = false) {
    var host = options.webSocket.host;
    var socketUrl = url.format({
        protocol: options.https ? 'wss' : 'ws',
        hostname: host === '*' ? window.location.hostname : host,
        port: options.webSocket.port,
        slashes: true
    });
    var open = false;
    var socket = new WebSocket(socketUrl);
    socket.addEventListener('open', function () {
        open = true;
        retry = maxRetries;
        log.info('WebSocket connected');
        if (reconnect) {
            socket.send(JSON.stringify({
                type: "reconnected"
            }));
        }
    });
    socket.addEventListener('close', function () {
        log.warn('WebSocket closed');
        open = false;
        socket = null; // exponentation operator ** isn't supported by IE at all

        var timeout = // eslint-disable-next-line no-restricted-properties
            1000 * Math.pow(maxRetries - retry, 2) + Math.random() * 100;

        if (open || retry <= 0) {
            log.warn("WebSocket: ending reconnect after ".concat(maxRetries, " attempts"));
            return;
        }

        log.info("WebSocket: attempting reconnect in ".concat(parseInt(timeout / 1000, 10), "s"));
        setTimeout(function () {
            retry -= 1;
            connect(options, handler, true);
        }, timeout);
    });
    socket.addEventListener('message', function (event) {
        log.debug('WebSocket: message:', event.data);
        var message = JSON.parse(event.data);

        if (handler[message.type]) {
            handler[message.type](message.data);
        }
    });
};
