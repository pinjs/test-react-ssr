import React from 'react';

export default class Main extends React.Component {
    static contextType = null;

    render() {
        const { main } = this.context.document;
        return (
            <div id='__PINJS__' dangerouslySetInnerHTML={{ __html: main }} />
        );
    }
}
