import React from 'react';
import { Helmet } from 'react-helmet';

export default class PinJsHead extends React.Component {
    render() {
        return (
            <Helmet>
                {this.props.children}
            </Helmet>
        );
    }
}

export const getStaticHead = () => {
    const helmet = Helmet.renderStatic();
    return helmet;
}
