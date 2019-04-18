import React from 'react';
import NotFound from './NotFound';

class PageLoader extends React.Component {
    static PagesMap = {};
    static async getPagesMap() {
        PageLoader.PagesMap = (await import(`${PIN_VIEW_DIR}/pages.jsx`)).default;
        return PageLoader.PagesMap;
    }

    static async getPageComponent(pathname) {
        if (pathname[0] != '/') {
            pathname = '/' + pathname;
        }

        let props = {};
        let Component = NotFound;
        let LoadableComponent = PageLoader.PagesMap[pathname];

        if (!LoadableComponent) {
            return { Component, props };
        }

        Component = await LoadableComponent.preload();
        Component = Component.default || Component;

        if (typeof Component.getInitialProps == 'function') {
            props = await Component.getInitialProps();
            !props && (props = {})
        }

        return { Component, props };
    }

    render() {
        let PageComponent = this.props.Component || NotFound;
        let pageProps = this.props.props || {};

        return <PageComponent {...pageProps} />;
    }
}

export default PageLoader;
