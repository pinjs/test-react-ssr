import React from 'react';
import querystring from 'querystring';
import PropTypes from 'prop-types';
import PageLoader from '../../shared/PageLoader';
import Router from '../../components/router';

class PinJsViewLink extends React.Component {
    constructor(props) {
        super();
        this.onClick = this.onClick.bind(this);

        let hrefObject = props.href || {};
        let linkObject = {
            pathname: props.pathname || hrefObject.pathname || props.to,
            to: props.to || props.as || hrefObject.to || hrefObject.as || hrefObject.pathname,
            hash: props.hash || hrefObject.hash,
            query: props.query || hrefObject.query || null,
            params: props.params || hrefObject.params || {},
            replace: props.replace || false
        };

        if (!linkObject.to && !linkObject.pathname) {
            throw new Error('Link must contain "pathname" or "to" property');
        }

        linkObject.displayPath = linkObject.to || linkObject.pathname;
        linkObject.params.__page_pathname = linkObject.pathname;

        let linkProps = {};
        props.className && (linkProps.className = props.className);
        props.id && (linkProps.id = props.id);
        props.hreflang && (linkProps.hreflang = props.hreflang);
        props.download && (linkProps.download = props.download);
        props.target && (linkProps.target = props.target);
        props.title && (linkProps.title = props.title);
        props.name && (linkProps.name = props.name);
        linkProps.href = linkObject.displayPath;

        if (linkObject.query) {
            typeof linkObject.query == 'object' && (linkProps.href += '?' + querystring.stringify(linkObject.query));
            typeof linkObject.query == 'string' && (linkProps.href += '?' + linkObject.query);
        }

        linkObject.hash && (linkProps.href += '#' + linkObject.hash);

        this.linkProps = linkProps;
        this.linkObject = linkObject;
    }

    async onClick(e) {
        e.preventDefault();
        Router.emit('routeChangeStarted', this.linkObject);
        Router.history.push(this.linkProps.href, Object.assign({}, this.linkObject.params));
        // let currentPath = window.__PINJS_PATH__.substring(1);
        // !currentPath && (currentPath = 'index');

        // let currentPageLinkElm = document.querySelector(`link[href^="${PUBLIC_PATH}${currentPath}.css"]`);
        // let currentPageScriptElm = document.querySelector(`script[src^="${PUBLIC_PATH}${currentPath}.js"]`);
        // currentPageLinkElm.parentElement.removeChild(currentPageLinkElm);
        // currentPageScriptElm.parentElement.removeChild(currentPageScriptElm);
        // window.__PINJS_PATH__ = this.linkObject.params.__page_pathname;
    }

    render() {
        let props = Object.assign({}, this.linkProps);
        let children = this.props.children;
        delete props.children;

        return (
            <a {...props} onClick={this.onClick}>
                {children}
            </a>
        );
    }
}

PinJsViewLink.propsTypes = {
    to: PropTypes.string,
    pathname: PropTypes.string,
    query: PropTypes.object,
    params: PropTypes.object,
    as: PropTypes.string,
    href: PropTypes.shape({
        pathname: PropTypes.string,
        query: PropTypes.object,
        params: PropTypes.object,
    }),
}

export default PinJsViewLink;
