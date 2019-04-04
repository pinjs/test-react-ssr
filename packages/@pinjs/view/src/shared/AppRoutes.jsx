import React from 'react';
import { Switch, Route } from 'react-router';
import Loadable from 'react-loadable';

const AsyncHello = Loadable({
    loading: () => <div>loading...</div>,
    loader: () => import('./Hello')
});

const AsyncAbout = Loadable({
    loading: () => <div>loading...</div>,
    loader: () => import('./About')
});


const Home = () => <div>Home</div>;

function AppRoutes(props) {
    return (
        <Switch>
            <Route exact path='/hello' component={AsyncHello} />{' '}
            <Route exact path='/about' component={AsyncAbout} />{' '}
            <Route path='/' component={Home} />{' '}
        </Switch>
    );
}

export default AppRoutes;
