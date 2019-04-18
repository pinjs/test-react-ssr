import React from 'react';
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

    async render(pathname, bundleManifest, devAssets) {
        let Page = await PageLoader.getPageComponent(pathname);

        let store = createReduxStore({ server: true });
        let modules = new Set();

        let html = ReactDOMServer.renderToString(
            <Provider store={store}>
                <Loadable.Capture report={moduleName => modules.add(moduleName)}>
                    <PageLoader pathname={pathname} Component={Page.Component} props={Page.props} />
                </Loadable.Capture>
            </Provider>
        );

        let loadedModules = [...bundleManifest.entrypoints, ...Array.from(modules)];
        let initState = store.getState();
        let bundles = getBundles(bundleManifest, loadedModules);
        let cssScripts = [];
        let jsScripts = [
            `<script>window.__PINJS_PATH__ = '${pathname}'</script>`,
            `<script>window.__PINJS_STATE__ = ${JSON.stringify(initState).replace(/</g, '\\u003c')}</script>`,
            `<script>window.__PINJS_PROPS__ = ${JSON.stringify(Page.props || {}).replace(/</g, '\\u003c')}</script>`,
        ];

        (bundles.js || []).map(js => jsScripts.push(`<script src="${js.publicPath}" async></script>`));
        (bundles.css || []).map(css => cssScripts.push(`<link href="${css.publicPath}" rel="stylesheet"/>`));

        if (devAssets) {
            cssScripts = devAssets.cssScripts || [];
            jsScripts = devAssets.jsScripts || [];
        }

        return `<!doctype html><html lang="en"><head>${cssScripts.join('\n')}</head><body><div id="app">${html}</div>${jsScripts.join('\n')}</body></html>`;
    }

    static async preload() {
        await PageLoader.getPagesMap();
        await Loadable.preloadAll();
    }
}

module.hot && module.hot.accept(() => console.log('Error handler'));

export default SSR;
