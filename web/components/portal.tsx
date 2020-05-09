import * as React from 'react';
import * as ReactDOM from 'react-dom';

interface IPortalProps {
    className?: string;
    selector?: string;
    id?: string;
}

export default class Portal extends React.Component<IPortalProps, {}> {
    render() {
        const selector = this.props.selector;
        let dom;
        if (selector)
            dom = document.querySelector(selector);

        return ReactDOM.createPortal(<div id={this.props.id ? this.props.id : ''} className={`portal-cp ${this.props.className || ''}`}>
            {this.props.children}
        </div>, dom ? dom : document.body);
    }
}