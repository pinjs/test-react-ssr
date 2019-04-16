import React from 'react';
import Link from '@pinjs/view/link';
// import Link from '../../packages/@pinjs/view/link'

export default class HomePage extends React.Component {
    render() {
        return (
            <div>
                This is home page<br />
                <Link to="/about" params={{ fromDashboard: true }}>About</Link><br />
                <Link to="/contact">Contact</Link><br />
            </div>
        )
    }
}
