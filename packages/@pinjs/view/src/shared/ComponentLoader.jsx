import React from 'react';
import { withRouter } from 'react-router';

class ComponentLoader extends React.Component {
    constructor() {
        super();
        this.state = {
            loading: true,
            pathname: '',
            Component: () => <div>Loading</div>,
        }
    }

    static PagesMap = {}
    static async getPagesMap() {
        ComponentLoader.PagesMap = (await import(`${PIN_VIEW_DIR}/pages.jsx`)).default;
    }

    componentWillMount() {
        console.log('will mount')
        let pathname = this.props.location.pathname;
        pathname = pathname.substring(1);
        let Component = ComponentLoader.PagesMap[pathname] || (() => <div>Not found</div>);
        this.setState({ Component });
        console.log('will mount')
    }

    render() {
        let { Component } = this.state;
        return (
            <Component />
        )
    }
}

export default withRouter(ComponentLoader);
