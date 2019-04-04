import React from 'react';

export default class Hello extends React.Component {
    componentDidMount() {
        alert('Helooook');
    }
    
    render() {
        return <div>Hello 1</div>;
    }
}
