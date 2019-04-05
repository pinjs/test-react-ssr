import React from 'react';
import { Link } from 'react-router-dom';

export default class ContactPage extends React.Component {
    componentDidMount() {
        alert('AboutPage')
    }
    render() {
        return (
            <div>
                This is Contact page<br />
                <Link to="/about">About</Link><br />
                <Link to="/contact">Contact</Link><br />
            </div>
        )
    }
}
