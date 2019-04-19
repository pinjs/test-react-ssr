import React, { Component } from 'react';

export default class Document extends Component {
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

export class Html extends Component {
    static contextType = null;

    render() {
        const { children, ...props } = this.props;
        return <html {...props}>{children}</html>;
    }
}

export class Main extends Component {
    static contextType = null;

    render() {
        const { main } = this.context.document;
        return (
            <div id='__PINJS__' dangerouslySetInnerHTML={{ __html: main }} />
        );
    }
}

export class Head extends Component {
    static contextType = null;

    getCssLinks() {
        const { styles } = this.context.document;
        return (styles || []).map(file =>  <link key={file} rel='stylesheet' href={file} />);
    }

    render() {
        let { head } = this.context.document;
        let children = this.props.children;

        return (
            <head {...this.props}>
                {children}
                {head}
                {this.getCssLinks()}
            </head>
        );
    }
}

export class Script extends Component {
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
