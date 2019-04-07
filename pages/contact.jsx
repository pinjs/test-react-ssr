import React from 'react';
import { Link } from 'react-router-dom';
import CT1 from './ct1';

export default class ContactPage extends React.Component {
    componentDidMount() {
        console.log('ContactPage')
    }
    render() {
        return (
            <div>
                This is Contact page kk<br />
                <CT1 />
                <Link to="/about">About</Link><br />
                <Link to="/home/index">Home</Link><br />
            </div>
        )
    }
}
