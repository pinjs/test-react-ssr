import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Switch, Route } from 'react-router';
import { Provider } from 'react-redux';
import Loadable from 'react-loadable';
import createReduxStore from '../shared/createReduxStore';
import PageLoader from '../shared/PageLoader';
import './clientPingFile.png';

let initState = window.__INIT_STATE__ || {};
let initProps = window.__INIT_PROPS__ || {};
delete window.__INIT_STATE__;
delete window.__INIT_PROPS__;
const store = createReduxStore({ initState });

PageLoader.getPagesMap().then(pagesMap => {
    Loadable.preloadReady().then(() => {
        Loadable.preloadAll().then(() => {
            const appRoot = document.getElementById('app');
            ReactDOM.hydrate(
                <Provider store={store}>
                    <BrowserRouter>
                        <Switch>
                            <Route
                                path={'*'}
                                render={props => {
                                    let pageProps = {};
                                    let pathname = props.location.pathname;
                                    let state = props.history.location.state;

                                    // Pass initProps to page props in case of SSR
                                    if (initProps) {
                                        pageProps = initProps;
                                        initProps = null;
                                    }
                                    // Only assign history state to page props in case of CSR
                                    else {
                                        state.__page_pathname && (pathname = state.__page_pathname);
                                        state.__page_props && (pageProps = state.__page_props);
                                    }

                                    if (pathname[0] == '/') {
                                        pathname = pathname.substring(1);
                                    }

                                    let LoadablePage = pagesMap[pathname];
                                    return (
                                        <PageLoader pathname={pathname} pageComponent={LoadablePage} pageProps={pageProps} />
                                    );
                                }}
                            />
                        </Switch>
                    </BrowserRouter>
                </Provider>,
                appRoot
            );
        });
    });
});

if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => console.log('dispose'));
}
