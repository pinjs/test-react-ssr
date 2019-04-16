import { combineReducers } from 'redux';
import home from './home';
import common from './common';

const reduxState = combineReducers({
    common,
    home,
});

export default reduxState;
