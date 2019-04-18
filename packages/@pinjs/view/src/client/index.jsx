import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import Loadable from 'react-loadable';
import createReduxStore from '../shared/createReduxStore';
import PageLoader from '../shared/PageLoader';
import ClientApp from './app';
import './clientPingFile.png';

let initPath = window.__PINJS_PATH__ || '/';
let initState = window.__PINJS_STATE__ || {};
let initProps = window.__PINJS_PROPS__ || {};
delete window.__PINJS_STATE__;
delete window.__PINJS_PROPS__;
const store = createReduxStore({ initState });

PageLoader.getPagesMap().then(pagesMap => {
    Loadable.preloadAll().then(() => {
        const appRoot = document.getElementById('app');
        ReactDOM.hydrate(<Provider store={store}>
            <ClientApp render={props => {
                let pathname = '/';
                let pageProps = {};
                let pageComponent = null;

                // Pass initProps to page props in case of SSR
                if (initProps) {
                    pathname = initPath;
                    pageProps = initProps;
                    pageComponent = PageLoader.PagesMap[pathname];
                    initProps = null;
                }
                // Only assign history state to page props in case of CSR
                else {
                    pathname = props.page.pathname;
                    pageProps = props.page.props;
                    pageComponent = props.page.Component;
                }

                return <PageLoader pathname={pathname} Component={pageComponent} props={pageProps} />;
            }} />
        </Provider>, appRoot);
    });
});

if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => console.log('dispose'));
}
