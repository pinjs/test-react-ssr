import React from 'react';
import { Html, Main, Script, Head } from '@pinjs/view/document';

export default class PinSSRPage extends React.Component {
    render() {
        return (
            <Html>
                <Head />
                <body>
                    <Main />
                    <Script />
                </body>
            </Html>
        )
    }
}
