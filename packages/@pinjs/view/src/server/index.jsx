import React from 'react';
import { StaticRouter } from 'react-router-dom';
import { Switch, Route } from 'react-router';
import { getBundles } from 'react-loadable-ssr-addon';
import { Provider } from 'react-redux';
import ReactDOMServer from 'react-dom/server';
import Loadable from 'react-loadable';
import createReduxStore from '../shared/createReduxStore';
import PageLoader from '../shared/PageLoader';

class SSR {
    constructor(config) {
        this.config = config;
        this.PageComponent = null;
    }

    static PageMaps = {};

    async render(pathname, data, bundleManifest, context = {}) {
        let store = createReduxStore({ server: true });
        let modules = new Set();

        let Page = await PageLoader.getPageComponent(pathname);
        let html = ReactDOMServer.renderToString(
            <Provider store={store}>
                <Loadable.Capture
                    report={moduleName => modules.add(moduleName)}>
                    <StaticRouter location={pathname} context={context}>
                        <Switch>
                            <Route path={'*'} render={props => {
                                return <Page.Component {...Object.assign({}, { _route: props }, Page.props)} />
                            }}/>
                        </Switch>
                    </StaticRouter>
                </Loadable.Capture>
            </Provider>
        );

        let loadedModules = [...bundleManifest.entrypoints, ...Array.from(modules)];
        let initState = store.getState();
        let bundles = getBundles(bundleManifest, loadedModules);
        let cssScripts = [];
        let jsScripts = [
            `<script>window.__INIT_STATE__ = ${JSON.stringify(initState).replace(/</g, '\\u003c')}</script>`,
            `<script>window.__INIT_PROPS__ = ${JSON.stringify(Page.props || {}).replace(/</g, '\\u003c')}</script>`,
        ];

        (bundles.js || []).map(js => jsScripts.push(`<script src="${js.publicPath}" async></script>`));
        (bundles.css || []).map(css => cssScripts.push(`<link href="${css.publicPath}" rel="stylesheet"/>`));

        return {
            html,
            jsScripts,
            cssScripts
        };
    }

    static async preload() {
        await PageLoader.getPagesMap();
        await Loadable.preloadAll();
    }
}

module.hot && module.hot.accept(() => console.log('Error handler'));

export default SSR;
