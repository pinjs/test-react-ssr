import React from 'react';
import { Switch, Route } from 'react-router';
import ComponentLoader from '../shared/ComponentLoader';

function Routing(props) {
    return (
        <div>
            <Switch>
                <Route path={'*'} render={props => <ComponentLoader {...props} />}></Route>
            </Switch>
        </div>
    );
}

export default Routing;
