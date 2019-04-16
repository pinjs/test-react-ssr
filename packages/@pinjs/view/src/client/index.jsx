import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Switch, Route } from 'react-router';
import { Provider } from 'react-redux';
import Loadable from 'react-loadable';
import createReduxStore from '../shared/createReduxStore';
import ComponentLoader from '../shared/ComponentLoader';
import './clientPingFile.png';

const preloadedState = window.__PRELOADED_STATE__; // eslint-disable-line no-underscore-dangle
delete window.__PRELOADED_STATE__; // eslint-disable-line no-underscore-dangle
const store = createReduxStore({ preloadedState });

ComponentLoader.getPagesMap().then(() => {
    Loadable.preloadReady().then(a => {
        console.log(a);
        const appRoot = document.getElementById('app');
        ReactDOM.hydrate(
            <Provider store={store}>
                <BrowserRouter>
                    <Switch>
                        <Route path={'*'} render={props => <ComponentLoader {...props} />}></Route>
                    </Switch>
                </BrowserRouter>
            </Provider>,
            appRoot
        );
    });
});

if (module.hot) {
    module.hot.accept();
    module.hot.dispose(function() {
        console.log('dispose')
    });
}
