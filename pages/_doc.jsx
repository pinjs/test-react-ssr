import React from 'react';
import { Html, Main, Script, Head as DocumentHead } from '@pinjs/view/document';

export default class DocumentPage extends React.Component {
    render() {
        return (
            <Html>
                <DocumentHead />
                <body>
                    <Main />
                    <Script />
                </body>
            </Html>
        )
    }
}
