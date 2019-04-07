import React from 'react';
import { Switch, Route } from 'react-router';
import ComponentLoader from '../shared/ComponentLoader';

export default class Routing extends React.Component {
    render() {
        return (
            <Switch>
                <Route path={'*'} render={props => <ComponentLoader {...props} />}></Route>
            </Switch>
        )
    }
}
