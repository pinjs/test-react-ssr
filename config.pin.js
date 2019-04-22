const path = require('path');

const config = {
    namespace: 'Site',
    pagesDir: path.join(__dirname, 'pages'),
    customPages: [
        path.join(__dirname, 'custom/pages/custompage1.jsx'),
        {
            pathname: '/TestPathPrefix/CustomPage2WithCustomName',
            component: path.join(__dirname, 'custom/pages/custompage2.jsx')
        },
        {
            pathname: '/about',
            component: path.join(__dirname, 'custom/pages/custompage3.jsx')
        },
    ],
    publicPath: '/assets/site/',
    clientOutputDir: path.join(__dirname, 'public', 'assets/site'),
    serverOutputDir: path.join(__dirname, '.pinjs/view/build/site'),
    reactAppContextName: 'SiteContext',
};

module.exports = config;
