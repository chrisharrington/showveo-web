import * as React from 'react';

interface RadioButtonProps {
    label: string;
    selected: boolean;
    onClick: () => void;
    className?: string;
}

export default class RadioButton extends React.Component<RadioButtonProps> {
    render() {
        return <div onClick={() => this.props.onClick()} className={`radio-button ${this.props.className || ''} ${this.props.selected ? 'radio-button-selected' : ''}`}>
            <span>{this.props.label}</span>
        </div>;
    }
}