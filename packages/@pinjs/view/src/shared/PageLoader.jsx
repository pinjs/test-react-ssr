import React from 'react';
import ErrorPageComponent from './document/error';

ErrorPageComponent.preload = () => {};

class PageLoader extends React.Component {
    static PagesMap = {};
    static DocumentPage = null;
    static AppPage = null;
    static ErrorPage = null;

    static async getPagesMap() {
        let pagesMapContent = await import(`${PIN_VIEW_DIR}/pages.jsx`);
        PageLoader.PagesMap = pagesMapContent.default;
        PageLoader.DocumentPage = pagesMapContent._doc || null;
        PageLoader.AppPage = pagesMapContent._app || null;
        PageLoader.ErrorPage = pagesMapContent._error || ErrorPageComponent;

        return PageLoader.PagesMap;
    }

    static async getPage(pathname) {
        return PageLoader.PagesMap[pathname] || PageLoader.ErrorPage;
    }

    static async getPageComponent(pathname) {
        if (pathname[0] != '/') {
            pathname = '/' + pathname;
        }

        let props = {};
        let Component = PageLoader.ErrorPage;
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
        let PageComponent = this.props.Component || PageLoader.ErrorPage;
        let pageProps = this.props.props || {};

        return PageLoader.AppPage ?
            <PageLoader.AppPage Component={PageComponent} pageProps={pageProps} /> :
            <PageComponent {...pageProps} />
    }
}

export default PageLoader;
