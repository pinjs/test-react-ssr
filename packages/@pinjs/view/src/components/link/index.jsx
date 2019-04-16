import React from 'react';
import querystring from 'querystring';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

function PinJsViewLink(props) {
    let hrefObject = props.href || {};
    let linkObject = {
        pathname: props.pathname || hrefObject.pathname || props.to,
        to: props.to || props.as || hrefObject.to || hrefObject.as || hrefObject.pathname,
        hash: props.hash || hrefObject.hash,
        query: props.query || hrefObject.query,
        params: props.params || hrefObject.params || {},
        replace: props.replace || false
    };

    if (!linkObject.to && !linkObject.pathname) {
        throw new Error('Link must contain "pathname" or "to" property');
    }

    linkObject.displayPath = linkObject.to || linkObject.pathname;
    linkObject.params.__real_pathname = linkObject.pathname;

    return (
        <Link to={{
            pathname: linkObject.displayPath,
            search: linkObject.query ? '?' + querystring.stringify(linkObject.query) : null,
            hash: linkObject.hash ? '#' + linkObject.hash : null,
            state: linkObject.params,
        }}>
            {props.children}
        </Link>
    );
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
