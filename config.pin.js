const path = require('path');

const customPages = [
    path.join(__dirname, 'custom/pages/custompage1.jsx'),
    {
        pathname: '/TestPathPrefix/CustomPage2WithCustomName',
        component: path.join(__dirname, 'custom/pages/custompage2.jsx')
    },
    {
        pathname: '/about',
        component: path.join(__dirname, 'custom/pages/custompage3.jsx')
    },
];


const config = {
    pageDir: path.join(__dirname, 'pages'),
    customPages: customPages,
    publicPath: '/assets/',
    clientOutputDir: path.join(__dirname, 'public', 'assets'),
    serverOutputDir: path.join(__dirname, '.pinjs/view/build'),
};

module.exports = config;
