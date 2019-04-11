import React from 'react';
import { StaticRouter } from 'react-router-dom';
import { Switch, Route } from 'react-router';
import { getBundles } from 'react-loadable-ssr-addon';
import { Provider } from 'react-redux';
import ReactDOMServer from 'react-dom/server';
import Loadable from 'react-loadable';
import createReduxStore from '../shared/createReduxStore';
import ComponentLoader from '../shared/ComponentLoader';

class SSR {
    constructor(config) {
        this.config = config;
        this.PageComponent = null;
    }

    static PageMaps = {}

    async render(pathname, data, bundleManifest, context = {}) {
        await ComponentLoader.getPagesMap();
        let store = createReduxStore({ server: true });
        let modules = new Set();

        let html = ReactDOMServer.renderToString(
            <Provider store={store}>
                <Loadable.Capture report={moduleName => modules.add(moduleName)}>
                    <StaticRouter location={pathname} context={context}>
                        <Switch>
                            <Route path={'*'} render={props => <ComponentLoader {...props} />}></Route>
                        </Switch>
                    </StaticRouter>
                </Loadable.Capture>
            </Provider>
        );
        let modulesToBeLoaded = [
            ...bundleManifest.entrypoints,
            ...Array.from(modules)
        ];

        let preloadedState = store.getState();
        let bundles = getBundles(bundleManifest, modulesToBeLoaded);
        let jsScripts = [`<script>window.__PRELOADED_STATE__ = ${JSON.stringify(preloadedState)}</script>`];
        let cssScripts = [];
        (bundles.js || []).map(bundle => jsScripts.push(`<script src="${bundle.publicPath}" async></script>`));
        (bundles.css || []).map(bundle => cssScripts.push(`<link href="${bundle.publicPath}" rel="stylesheet" />`));

        return {
            html,
            jsScripts,
            cssScripts,
        };
    }

    static async preload() {
        SSR.PageMaps = (await import(`${PIN_VIEW_DIR}/pages.jsx`)).default;
        return await Loadable.preloadAll();
    }
}

if (module.hot) {
    module.hot.accept(function() {
        console.log('Error handler')
    });
}

export default SSR;
