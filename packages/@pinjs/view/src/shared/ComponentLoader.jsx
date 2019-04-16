import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import NotFound from './NotFound';

class ComponentLoader extends React.Component {
    constructor() {
        super();
        this.state = {
            loading: true,
            pathname: '',
            Component: NotFound,
            componentProps: {}
        };

        this.loadPageComponent = this.loadPageComponent.bind(this);
    }

    static PagesMap = {}
    static async getPagesMap() {
        ComponentLoader.PagesMap = (await import(`${PIN_VIEW_DIR}/pages.jsx`)).default;
    }

    static async getPageComponent(pathname) {
        if (pathname[0] == '/') {
            pathname = pathname.substring(1);
        }

        let componentProps = {};
        let Component = NotFound;
        let LoadableComponent = ComponentLoader.PagesMap[pathname];

        if (!LoadableComponent) {
            return Component;
        }

        Component = await LoadableComponent.preload();
        Component = Component.default || Component;
        if (typeof Component.getInitialProps == 'function') {
            componentProps = await Component.getInitialProps();
        }

        return { Component, componentProps };
    }

    async loadPageComponent(pathname) {
        /**
         * If click from link on browser
         */
        let currentLocation = this.props.history.location;
        if (currentLocation && currentLocation.state && currentLocation.state.__real_pathname) {
            pathname = currentLocation.state.__real_pathname;
        }

        if (pathname[0] == '/') {
            pathname = pathname.substring(1);
        }

        let { Component, componentProps } = await ComponentLoader.getPageComponent(pathname);
        return new Promise(resolve => {
            this.setState({ Component, componentProps }, () => resolve());
        });
    }

    async componentWillMount() {
        let pathname = this.props.location.pathname;
        await this.loadPageComponent(pathname);
    }

    async componentWillReceiveProps(props) {
        let pathname = props.location.pathname;
        await this.loadPageComponent(pathname);
    }

    render() {
        let { Component } = this.state;
        console.log(Component);
        return (
            <Component location={this.props.location} />
        )
    }
}


export default withRouter(ComponentLoader);
