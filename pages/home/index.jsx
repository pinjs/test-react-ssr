import React from 'react';
import Link from '@pinjs/view/link';

export default class HomePage extends React.Component {
    // static async getInitialProps() {
    //     return new Promise(resolve => {
    //         setTimeout(() => resolve(), 500)
    //     });
    // }

    componentDidMount() {
        console.log('Home page')
    }

    render() {
        return (
            <div>
                This is home page<br />
                <Link to="/aboutFake" pathname="/about" params={{ fromDashboard: true }}>About</Link><br />
                <Link to="/contact" href={{pathname: '/contact', to: '/fakecontaaack'}}>Contact</Link><br />
                <Link href={{pathname: '/contact', to: '/fakecontaaack', query: {a: 'c', d: '3'}}}>
                    Contact with title and query
                </Link><br />
            </div>
        )
    }
}
