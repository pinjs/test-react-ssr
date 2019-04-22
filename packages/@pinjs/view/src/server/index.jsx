import React from 'react';
import { getBundles } from 'react-loadable-ssr-addon';
import { Provider } from 'react-redux';
import ReactDOMServer from 'react-dom/server';
import Loadable from 'react-loadable';
import createReduxStore from '../shared/createReduxStore';
import PageLoader from '../shared/PageLoader';
import { Html, Main, Script, Head } from '../shared/document';

class SSR {
    constructor(config) {
        this.config = config;
        this.PageComponent = null;
        this.ReactAppContextName = this.config.reactAppContextName;
        this[this.ReactAppContextName] = React.createContext({
            document: {
                pinScripts: [],
                scripts: [],
                styles: [],
                main: '',
            }
        });

        Html.contextType = this[this.ReactAppContextName];
        Main.contextType = this[this.ReactAppContextName];
        Head.contextType = this[this.ReactAppContextName];
        Script.contextType = this[this.ReactAppContextName];
    }

    static PageMaps = {};

    async render(pathname, bundleManifest, devAssets) {
        let cleanPathName = pathname;
        cleanPathName[0] == '/' && (cleanPathName = cleanPathName.substring(1));
        cleanPathName[cleanPathName.lenth - 1] == '/' && (cleanPathName = cleanPathName.substring(0, cleanPathName.length - 1));
        (!cleanPathName && (cleanPathName = 'index'))

        let Page = await PageLoader.getPageComponent(pathname);
        let store = createReduxStore({ server: true });
        let modules = new Set();
        let mainHtml = ReactDOMServer.renderToString(
            <Provider store={store}>
                <Loadable.Capture report={moduleName => modules.add(moduleName)}>
                    <PageLoader pathname={pathname} Component={Page.Component} props={Page.props} />
                </Loadable.Capture>
            </Provider>
        );

        let pageAssets = bundleManifest.assets[cleanPathName] || {css: [], js: []};
        let loadedModules = [...bundleManifest.entrypoints, ...Array.from(modules)];
        let initState = store.getState();
        let bundles = getBundles(bundleManifest, loadedModules);
        let scripts = [];
        let styles = [];
        let pinScripts = [
            `window.__PINJS_PATH__ = '${pathname}'`,
            `window.__PINJS_STATE__ = ${JSON.stringify(initState).replace(/</g, '\\u003c')}`,
            `window.__PINJS_PROPS__ = ${JSON.stringify(Page.props || {}).replace(/</g, '\\u003c')}`,
        ];

        (bundles.js || []).concat(pageAssets.js).map(js => scripts.push(js.publicPath));
        (bundles.css || []).concat(pageAssets.css).map(css => styles.push(css.publicPath));

        if (devAssets) {
            styles = devAssets.styles || [];
            scripts = devAssets.scripts || [];
        }

        const SiteContext = this[this.ReactAppContextName];
        const SiteContextValue = {
            document: {
                pinScripts: pinScripts,
                scripts: scripts,
                styles: styles,
                main: mainHtml,
            }
        };

        return ReactDOMServer.renderToStaticMarkup(
            <SiteContext.Provider value={SiteContextValue}>
                {PageLoader.DocumentPage ? <PageLoader.DocumentPage /> : <Document />}
            </SiteContext.Provider>
        );
    }

    static async preload() {
        await PageLoader.getPagesMap();
        await Loadable.preloadAll();
    }
}

module.hot && module.hot.accept(() => console.log('Error handler'));

export default SSR;
