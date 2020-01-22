import * as React from 'react';

import RadioButton from './radio-button';

import './style.scss';

export class RadioGroupItem<TValue> {
    label: string;
    value: TValue;
    selected: boolean;

    constructor(label: string, value: TValue, selected: boolean = false) {
        this.label = label;
        this.value = value;
        this.selected = selected;
    }
}

interface RadioButtonGroupProps<TValue> {
    items: RadioGroupItem<TValue>[];
    onChange: (item: TValue) => void;
    className?: string;
}

interface RadioButtonGroupState {
    selectedIndex: number;
}

export class RadioButtonGroup<TValue> extends React.Component<RadioButtonGroupProps<TValue>, RadioButtonGroupState> {
    state = {
        selectedIndex: 0
    }

    static getDerivedStateFromProps(props) {
        return {
            selectedIndex: props.items.findIndex(item => item.selected)
        };
    }
    
    render() {
        return <div className={`form radio-button-group ${this.props.className || ''}`}>
            {this.props.items.map((item: RadioGroupItem<TValue>) => <RadioButton
                key={item.label}
                label={item.label}
                selected={item.selected}
                onClick={() => this.props.onChange(item.value)}
            />)}

            <div className='radio-button-overlay' style={{ transform: `translateY(${50*this.state.selectedIndex}px)`}}></div>
        </div>;
    }
}