import * as React from 'react';

import './style.scss';

interface SelectButtonProps {
    label: string;
    selected: boolean;
    className?: string;
}

export default class SelectButton extends React.Component<SelectButtonProps> {
    render() {
        return <div className={`form select-button ${this.props.selected ? 'select-button-selected' : ''} ${this.props.className || ''}`}>
            {this.props.label}
        </div>;
    }
}