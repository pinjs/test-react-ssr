import React from 'react';
import Link from '@pinjs/view/link';
import Head from '@pinjs/view/head';
import CT1 from './ct1';

import './contact.scss';
import './contact2.scss';

export default class ContactPage extends React.Component {
    static async getInitialProps() {
        return new Promise(resolve => {
            setTimeout(() => resolve(), 500)
        });
    }

    render() {
        return (
            <div>
                <Head>
                    <title>This is contact page</title>
                </Head>
                This is Contact page<br />
                <CT1 />
                <Link to="/about">About</Link><br />
                <Link to="/">Home</Link><br />
            </div>
        )
    }
}
