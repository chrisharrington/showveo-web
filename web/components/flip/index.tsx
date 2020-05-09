import * as React from 'react';

import './style.scss';

interface IFlipProps {
    front: JSX.Element;
    back: JSX.Element;
    className?: string;
    style?: any;
}

interface IFlipState {
    flipped: boolean;
}

export default class Flip extends React.Component<IFlipProps, IFlipState> {
    state = {
        flipped: false
    }

    render() {
        return <div className={`flip ${this.state.flipped ? 'flipped' : ''} ${this.props.className || ''}`} style={this.props.style} onClick={() => this.setState({ flipped: !this.state.flipped })}>
            <div className='flip-inner'>
                <div className='flip-front'>
                    {this.props.front}
                </div>
                <div className='flip-back'>
                    {this.props.back}
                </div>
            </div>
        </div>
    }
}