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
        let pathname = this.props.location.pathname;
        pathname = pathname.substring(1);
        let Component = ComponentLoader.PagesMap[pathname] || (() => <div>Not found</div>);
        this.setState({ Component });
    }

    componentWillReceiveProps(props) {
        let pathname = props.location.pathname;
        pathname = pathname.substring(1);
        let Component = ComponentLoader.PagesMap[pathname] || (() => <div>Not found</div>);
        this.setState({ Component });
    }

    render() {
        let { Component } = this.state;
        return (
            <Component location={this.props.location} />
        )
    }
}

export default withRouter(ComponentLoader);
