import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Switch, Route } from 'react-router';
import { Provider } from 'react-redux';
import Loadable from 'react-loadable';
import createReduxStore from '../shared/createReduxStore';
import PageLoader from '../shared/PageLoader';
import './clientPingFile.png';

const initState = window.__INIT_STATE__;
const initProps = window.__INIT_PROPS__;
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
                                    let pageProps = initProps;
                                    let pathname = props.location.pathname;

                                    // If click from link on browser
                                    let currentLocation = props.history.location;
                                    if (currentLocation && currentLocation.state) {
                                        currentLocation.state.__page_pathname && (pathname = currentLocation.state.__page_pathname);
                                        currentLocation.state.__page_props && (pageProps = currentLocation.state.__page_props);
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
    module.hot.dispose(function() {
        console.log('dispose');
    });
}
