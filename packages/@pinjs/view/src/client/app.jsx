import React from 'react';
import Router from '../components/router';
import PageLoader from '../shared/PageLoader';

export default class ClientApp extends React.Component {
    constructor() {
        super();
        this.state = {
            pageProps: {}
        }

        Router.history.listen(async (location, action) => {
            try {
                let Page = await PageLoader.getPageComponent(location.state.__page_pathname);
                this.setState({
                    pageProps: {
                        action: action,
                        location: location,
                        pathname: location.state.__page_pathname,
                        Component: Page.Component,
                        props: Page.props,
                    }
                }, () => Router.emit('routeChangeCompleted'));
            } catch (e) {
                Router.emit('routeChangeError', e);
            }
        });
    }

    render() {
        let Children = this.props.render;
        return <Children page={this.state.pageProps} />
    }
}
