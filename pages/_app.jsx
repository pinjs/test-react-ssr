import React from 'react';

export default class AppPage extends React.Component {
    render() {
        const { Component, pageProps } = this.props;
        return (
            <div className="layout">
                <Component {...pageProps} />
            </div>
        )
    }
}
