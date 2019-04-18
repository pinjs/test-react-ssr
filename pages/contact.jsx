import React from 'react';
import Link from '@pinjs/view/link';
import CT1 from './ct1';

export default class ContactPage extends React.Component {
    static async getInitialProps() {
        return new Promise(resolve => {
            setTimeout(() => resolve(), 500)
        });
    }

    componentDidMount() {
        console.log('ContactPage')
    }
    render() {
        return (
            <div>
                This is Contact page kk<br />
                <CT1 />
                <Link to="/about">About</Link><br />
                <Link to="/">Home</Link><br />
            </div>
        )
    }
}
