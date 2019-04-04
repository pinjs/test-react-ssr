import React from 'react';
import { Link } from 'react-router-dom'

export default class About extends React.Component {
    componentDidMount() {
        alert('About');
    }
    render() {
        return (
            <div>
                About<br />
                <Link to="/hello">Hello</Link>
            </div>
        );
    }
}
