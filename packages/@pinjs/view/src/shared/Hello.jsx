import React from 'react';
import { Link } from 'react-router-dom'

export default class Hello extends React.Component {
    componentDidMount() {
        alert('Hello');
    }
    
    render() {
        return (
            <div>
                Hello<br />
                <Link to="/about">About</Link>
            </div>
        );
    }
}
