import { createBrowserHistory } from 'history';
import { EventEmitter } from 'events';
import BrowserRouter from './browser';

const history = IS_SERVER ? null : createBrowserHistory();

const supportedEvents = [
    'routeChangeStarted',
    'routeChangeCompleted',
    'routeChangeError',
];

class Router extends EventEmitter {
    constructor() {
        super();
        this.history = history;
    }

    emit(event, data) {
        if (!supportedEvents.includes(event)) {
            throw new Error('Invalid router event: ' + event);
        }

        super.emit(event, data);
    }
}

export { default as BrowserRouter} from './browser';
export default new Router();
