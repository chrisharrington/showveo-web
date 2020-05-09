import * as React from 'react';

import { Media } from '@lib/models';

interface ITileProps {
    media: Media;
    width: number;
    top: number;
    left: number;
    onClick: () => void;
}

export default class Tile extends React.Component<ITileProps> {
    render() {
        const media = this.props.media;
        return <div className='tile' style={{ width: this.props.width + 'px', top: this.props.top + 'px', left: this.props.left + 'px' }} onClick={() => this.props.onClick()}>
            {media.backdrop && <img src={media.backdrop} alt={this.props.media.name} style={{ height: this.props.width/1.7778 + 'px' }} />}
            {!media.backdrop && <div className='poster-fill' style={{ backgroundImage: `url("${media.poster}")`, height: this.props.width/1.7778 + 'px' }}></div>}

            <div className='details'>
                <h4>{media.name}</h4>
                <span className='year'>{media.year}</span>
                <div className='clearfix'></div>
            </div>
        </div>;
    }
}