import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import Loadable from 'react-loadable';
import createReduxStore from '../shared/createReduxStore';
import ComponentLoader from '../shared/ComponentLoader';
import Routing from './routing';

const preloadedState = window.__PRELOADED_STATE__; // eslint-disable-line no-underscore-dangle
delete window.__PRELOADED_STATE__; // eslint-disable-line no-underscore-dangle
const store = createReduxStore({ preloadedState });

ComponentLoader.getPagesMap().then(() => {
    Loadable.preloadReady().then(() => {
        const appRoot = document.getElementById('app');
        ReactDOM.hydrate(
            <Provider store={store}>
                <BrowserRouter>
                    <Routing />
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
