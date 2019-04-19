import React from 'react';

export default class Html extends React.Component {
    static contextType = null;

    render() {
        const { children, ...props } = this.props;
        return <html {...props}>{children}</html>;
    }
}
