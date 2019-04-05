import React from 'react';
import { Link } from 'react-router-dom';

export default class ContactPage extends React.Component {
    componentDidMount() {
        alert('ContactPage')
    }
    render() {
        return (
            <div>
                This is Contact page<br />
                <Link to="/about">About</Link><br />
                <Link to="/home/index">Home</Link><br />
            </div>
        )
    }
}
