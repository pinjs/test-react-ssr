import React from 'react';

export default class Script extends React.Component {
    static contextType = null;
    getScripts() {
        const { scripts } = this.context.document;
        return (scripts || []).map(file => <script key={file} src={file} async />);
    }

    getInlineScripts() {
        const { pinScripts } = this.context.document;
        return pinScripts.map((script, i) => <script key={i}  dangerouslySetInnerHTML={{ __html: script }} />);
    }

    render() {
        return (
            <>
                {this.getInlineScripts()}
                {this.getScripts()}
            </>
        );
    }
}
