import React from 'react';
import DocumentMain from '@pinjs/view/document/main';

export default class PinSSRPage extends React.Component {
    render() {
        let styles = this.props.styles || '';
        return (
            <html>
                <head>
                    {styles}
                </head>
                <body>
                    <DocumentMain />
                    {this.props.scripts || ''}
                </body>
            </html>
        )
    }
}
