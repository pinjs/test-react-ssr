import React from 'react';
import { StaticRouter } from 'react-router-dom';
import ReactDOMServer from 'react-dom/server';
import Loadable from 'react-loadable';
import { getBundles } from 'react-loadable-ssr-addon';

import AppRoutes from '../shared/AppRoutes';

class SSR {
    constructor(config) {
        this.config = config;
    }

    render(url, data, bundleManifest) {
        let modules = new Set();
        const context = {};
        const html = ReactDOMServer.renderToString(
            <Loadable.Capture report={moduleName => modules.add(moduleName)}>
                <StaticRouter location={url} context={context}>
                    <AppRoutes initialData={data} />
                </StaticRouter>
            </Loadable.Capture>
        );
        const modulesToBeLoaded = [
            ...bundleManifest.entrypoints,
            ...Array.from(modules)
        ];
        let bundles = getBundles(bundleManifest, modulesToBeLoaded);

        return {
            html,
            jsFiles: (bundles.js || []).map(bundle => `${bundle.publicPath}?v=${bundle.hash}`),
            cssFiles: (bundles.css || []).map(bundle => `${bundle.publicPath}?v=${bundle.hash}`),
        };
    }

    static preload() {
        return Loadable.preloadAll();
    }
}

export default SSR;
