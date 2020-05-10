import * as React from 'react';

import './style.scss';

interface ITextProps {
    value: string;
    onChange: (value: string) => void;
    label: string;
    className?: string;
    inputClassName?: string;
    type?: string;
    placeholder?: string;
    focus?: boolean;
}

export default class Text extends React.Component<ITextProps> {
    input: HTMLInputElement;

    componentDidMount() {
        if (this.props.focus)
            this.input.focus();
    }

    render() {
        return <div className={`text ${this.props.className || ''}`}>
            <label>{this.props.label}</label>
            <input
                ref={c => this.input = c}
                className={this.props.inputClassName}
                type={this.props.type || 'text'}
                onChange={e => this.props.onChange(e.target.value)}
                placeholder={this.props.placeholder || ''}
            />
        </div>;
    }
}