import React from 'react';
import Link from '@pinjs/view/link';

export default class ContactPage extends React.Component {
    componentDidMount() {
        console.log('AboutPage')
    }
    render() {
        return (
            <div>
                This is About page 1<br />
                <Link to="/home/index">Home</Link><br />
                <Link to="/contact">Contact</Link><br />
            </div>
        )
    }
}
