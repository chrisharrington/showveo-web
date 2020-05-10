import * as React from 'react';

import './style.scss';

interface ButtonProps {
    label: string;
    onClick: () => void;
    className?: string;
}

export default class Button extends React.Component<ButtonProps> {
    render() {
        const p = this.props;
        return <button type='button' className={`button ${p.className || ''}`} onClick={p.onClick}>
            {p.label}
        </button>
    }
}