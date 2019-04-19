import React from 'react';
import { getStaticHead } from'../../components/head';

export default class Head extends React.Component {
    static contextType = null;

    getCssLinks() {
        const { styles } = this.context.document;
        return (styles || []).map(file =>  <link key={file} rel='stylesheet' href={file} />);
    }

    render() {
        let children = this.props.children;
        let helmetHead = getStaticHead();
        let TitleComponent = helmetHead.title.toComponent();
        let title = TitleComponent[0] && TitleComponent[0].props ? (TitleComponent[0].props.children || '') : '';

        return (
            <head {...this.props}>
                {title ? <title>{title}</title> : ''}
                {helmetHead.meta.toComponent()}
                {helmetHead.link.toComponent()}
                {children}
                {this.getCssLinks()}
            </head>
        );
    }
}
