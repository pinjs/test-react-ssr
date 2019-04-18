import React from 'react';
import ReactDOM from 'react-dom';
import { Switch, Router, Route } from 'react-router';
import { Provider } from 'react-redux';
import Loadable from 'react-loadable';
import createReduxStore from '../shared/createReduxStore';
import PageLoader from '../shared/PageLoader';
import PinJsRouter from '../components/router';
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
            <Router history={PinJsRouter.history}>
                <Switch>
                    <Route path={'*'} render={props => {
                        let pageProps = {};
                        let pathname = props.location.pathname;
                        let state = props.history.location.state;

                        // Pass initProps to page props in case of SSR
                        if (initProps) {
                            pathname = initPath;
                            pageProps = initProps;
                            initProps = null;
                        }
                        // Only assign history state to page props in case of CSR
                        else {
                            state.__page_pathname && (pathname = state.__page_pathname);
                            state.__page_props && (pageProps = state.__page_props);
                        }

                        (pathname[0] != '/') && (pathname = '/' + pathname);

                        return <PageLoader pathname={pathname} Component={pagesMap[pathname]} props={pageProps} />;
                    }}/>
                </Switch>
            </Router>
        </Provider>, appRoot);
    });
});

if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => console.log('dispose'));
}
