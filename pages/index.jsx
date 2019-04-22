import React from 'react';
import Link from '@pinjs/view/link';
import Head from '@pinjs/view/head';

import './home.scss';

export default class HomePage extends React.Component {
    static async getInitialProps() {
        return new Promise(resolve => {
            setTimeout(() => resolve({
                name: 'Phuong',
                time: new Date().toISOString(),
            }), 500)
        });
    }

    render() {
        return (
            <div>
                <Head>
                    <title>This is home page</title>
                </Head>
                This is home page: {this.props.name} at {this.props.time}<br />
                <Link className="about-page" to="/aboutFake" pathname="/about" params={{ fromDashboard: true }}>About</Link><br />
                <Link to="/contact" href={{pathname: '/contact', to: '/fakecontaaack'}}>Contact</Link><br />
                <Link href={{pathname: '/contact', to: '/fakecontaaack', query: {a: 'c', d: '3'}}}>
                    Contact with title and query
                </Link><br />
            </div>
        )
    }
}
