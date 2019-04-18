import React from 'react';

export default class PinSSRPage extends React.Component {
    render() {
        let main = this.props.main || '';
        let scripts = this.props.scripts || '';
        let styles = this.props.styles || '';
        return (
            <html>
                <head>
                    {styles}
                </head>
                <body dangerouslySetInnerHTML={{__html: main + scripts}}>
                </body>
            </html>
        )
    }
}
