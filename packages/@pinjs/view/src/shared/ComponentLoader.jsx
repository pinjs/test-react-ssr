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

        // this.loadPageComponent = this.loadPageComponent.bind(this);
    }

    static PagesMap = {}
    static async getPagesMap() {
        ComponentLoader.PagesMap = (await import(`${PIN_VIEW_DIR}/pages.jsx`)).default;
    }

    static async getPageComponent(pathname) {
        console.log(3.1)
        if (pathname[0] == '/') {
            pathname = pathname.substring(1);
        }
        console.log(3.2)
        
        let componentProps = {};
        let Component = NotFound;
        let LoadableComponent = ComponentLoader.PagesMap[pathname];
        console.log(3.3, LoadableComponent)
        
        if (!LoadableComponent) {
            return { Component, componentProps };
        }
        Component = LoadableComponent;
        console.log(3.4)
        
        Component = await LoadableComponent.preload();
        console.log(3.5)
        Component = Component.default || Component;
        console.log(3.6)
        if (typeof Component.getInitialProps == 'function') {
            console.log(3.7)
            componentProps = await Component.getInitialProps();
            console.log(3.8)
        }
        console.log(3.9)

        return { Component, componentProps };
    }

    async loadPageComponent(pathname) {
        console.log(1);
        /**
         * If click from link on browser
         */
        let currentLocation = this.props.history.location;
        if (currentLocation && currentLocation.state && currentLocation.state.__real_pathname) {
            pathname = currentLocation.state.__real_pathname;
        }
        console.log(2);
        
        if (pathname[0] == '/') {
            pathname = pathname.substring(1);
        }
        console.log(3);
        
        let { Component, componentProps } = await ComponentLoader.getPageComponent(pathname);
        this.setState({ Component, componentProps })
    }

    async componentWillMount() {
        console.log('willmount')
        let pathname = this.props.location.pathname;
        console.log('willmount 2')
        await this.loadPageComponent(pathname);
        console.log('willmount 3')
    }

    async componentWillReceiveProps(props) {
        let pathname = props.location.pathname;
        await this.loadPageComponent(pathname);
    }

    async componentDidMount() {
        console.log('willmount')
        let pathname = this.props.location.pathname;
        console.log('willmount 2')
        await this.loadPageComponent(pathname);
        console.log('willmount 3')
    }

    render() {
        let { Component } = this.state;
        console.log('Render: ');
        return (
            <Component location={this.props.location} />
        )
    }
}


export default withRouter(ComponentLoader);
