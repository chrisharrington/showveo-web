import * as React from 'react';

import Portal from '@web/components/portal';

import './style.scss';

interface ISelectProps {
    options: Option[];
    selected: number | string | boolean;
    onSelect: (item: Option) => void;

    className?: string;
}

interface ISelectState {
    open: boolean;
    top: number;
    left: number;
    width: number;
}

export class Option {
    value: number | string | boolean;
    text: string;

    constructor(value: number | string | boolean, text: string) {
        this.value = value;
        this.text = text;
    }
}

export class Select extends React.Component<ISelectProps, ISelectState> {
    indicator: HTMLDivElement;
    onBodyClickHandler: () => void;

    state = {
        open: false,
        top: 0,
        left: 0,
        width: 0
    }

    componentDidMount() {
        this.onBodyClickHandler = this.onBodyClick.bind(this);
        document.addEventListener('click', this.onBodyClickHandler);
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.onBodyClickHandler);
    }

    render() {
        return <div ref={c => this.indicator = c} className={`select ${this.state.open ? 'select-open' : ''} ${this.props.className || ''}`}>
            <div className='indicator' onClick={() => this.onToggle()}>
                {this.props.options.find(o => o.value === this.props.selected).text}
            </div>
            <Portal>
                <div className={`selector ${this.state.open ? 'selector-open' : ''}`} style={{ top: this.state.top, left: this.state.left, width: this.state.width }}>
                    {this.props.options.map((option: Option, index: number) => <div
                        className={`option ${option.value === this.props.selected ? 'selected' : ''}`}
                        key={index}
                        onClick={() => this.onSelect(option)}
                    >
                        {option.text}
                    </div>)}
                </div>
            </Portal>
        </div>;
    }

    private onToggle() {
        if (this.state.open)
            this.setState({ open: false });
        else
            setTimeout(() => {
                const rectangle = this.indicator.getBoundingClientRect();
                this.setState({
                    top: rectangle.top + 41,
                    left: rectangle.left,
                    width: rectangle.width,
                    open: true
                });
            });
    }

    private onBodyClick() {
        this.setState({ open: false });
    }

    private onSelect(option: Option) {
        this.props.onSelect(option);
        this.setState({ open: false });
    }
}