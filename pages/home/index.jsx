import React from 'react';
import { Link } from 'react-router-dom';

export default class HomePage extends React.Component {
    render() {
        return (
            <div>
                This is home page<br />
                <Link to="/about">About</Link><br />
                <Link to="/contact">Home</Link><br />
            </div>
        )
    }
}
