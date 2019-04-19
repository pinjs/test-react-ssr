import React from 'react';
import Html from './html';
import Head from './head';
import Main from './main';
import Script from './script';

export default class Document extends React.Component {
    render() {
        return (
            <Html>
                <Head />
                <body>
                    <Main />
                    <Script />
                </body>
            </Html>
        );
    }
}

export {
    Html,
    Head,
    Main,
    Script,
}

