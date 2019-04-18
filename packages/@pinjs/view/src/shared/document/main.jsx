import React from 'react';
import Script from './script';

export default class DocumentMain extends React.Component {
    static content = '';
    render() {
        return (
            <div id="__PINJS__" dangerouslySetInnerHTML={{__html: DocumentMain.content + Script.content}} />
        )
    }
}