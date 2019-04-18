import React from 'react';
import Link from '@pinjs/view/link';

export default class ContactPage extends React.Component {
    render() {
        return (
            <div>
                This is About page<br />
                <Link to="/">Home</Link><br />
                <Link to="/contact">Contact</Link><br />
            </div>
        )
    }
}
