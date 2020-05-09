import * as React from 'react';

import Portal from '@web/components/portal';

import './style.scss';

interface IModalProps {
    visible: boolean;
    onClose: () => void;
    
    className?: string;
    style?: any;
}

export default class Modal extends React.Component<IModalProps> {
    render() {
        return <Portal>
            <div className={`modal ${this.props.visible ? 'modal-visible' : ''} ${this.props.className || ''}`}>
                <div className='overlay'></div>
                <div className='content' style={this.props.style}>
                    <div className='x' onClick={() => this.props.onClose()}>✕</div>
                    {this.props.children}
                </div>
            </div>
        </Portal>;
    }
}