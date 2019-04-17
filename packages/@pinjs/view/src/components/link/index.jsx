import React from 'react';
import { withRouter } from 'react-router';
import querystring from 'querystring';
import PropTypes from 'prop-types';
import PageLoader from '../../shared/PageLoader';

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
        let Page = await PageLoader.getPageComponent(this.linkObject.pathname);
        this.props.history.push(this.linkObject.to, Object.assign({}, this.linkObject.params, {
            __page_props: Page.props
        }));
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

export default withRouter(PinJsViewLink);
