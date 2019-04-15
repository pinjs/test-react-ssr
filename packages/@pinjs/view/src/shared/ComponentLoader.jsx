import React from 'react';
import { withRouter } from 'react-router';
import NotFound from './NotFound';

class ComponentLoader extends React.Component {
    constructor() {
        super();
        this.state = {
            loading: true,
            pathname: '',
            Component: () => <div>Loading</div>,
            componentProps: {}
        }
    }

    static PagesMap = {}
    static async getPagesMap() {
        ComponentLoader.PagesMap = (await import(`${PIN_VIEW_DIR}/pages.jsx`)).default;
    }

    async loadComponent(pathname) {
        console.log(this.props);
        pathname = pathname.substring(1);
        let componentProps = {};
        let Component = ComponentLoader.PagesMap[pathname] || (() => <div>Not found</div>);
        
        if (typeof Component.getInitialProps == 'function') {
            try {
                componentProps = await Component.getInitialProps();
            } catch (e) {
                console.error(e);
                Component = NotFound;
            }
        }
        this.setState({ Component, componentProps });
    }

    async componentWillMount() {
        let pathname = this.props.location.pathname;
        await this.loadComponent(pathname);
    }

    async componentWillReceiveProps(props) {
        let pathname = props.location.pathname;
        await this.loadComponent(pathname);
    }

    render() {
        let { Component } = this.state;
        return (
            <Component location={this.props.location} {...this.state.componentProps} />
        )
    }
}

export default withRouter(ComponentLoader);
