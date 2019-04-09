const path = require('path');

const config = {
    pageDir: path.join(__dirname, 'pages'),
    publicPath: '/assets/',
    clientOutputDir: path.join(__dirname, 'public', 'assets'),
    serverOutputDir: path.join(__dirname, '.pinjs/view/build'),
};

module.exports = config;
