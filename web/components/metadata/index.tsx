import * as React from 'react';

import './style.scss';

export default class Metadata extends React.Component<{ values: string[], className?: string }> {
    render() {
        let elements: JSX.Element[] = [], counter =0;
        this.props.values.forEach((value: string) => {
            elements.push(<span key={counter++}>{value}</span>);
            elements.push(<span key={counter++} className='delimiter'>●</span>)
        });
        elements = elements.slice(0, -1);

        return <div className={`metadata ${this.props.className || ''}`}>
            {elements}
        </div>;
    }
}