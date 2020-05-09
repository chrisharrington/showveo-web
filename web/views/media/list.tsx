import * as React from 'react';

import { Media } from '@lib/models';

import Tile from './tile';

const BASE_TILE_WIDTH = 420,
    TILE_RATIO = 1.4371,
    HEADER_HEIGHT = 70,
    PADDING = 25;

interface IMediaListProps {
    media: Media[];
    onClickMedia: (media: Media) => void;
}

interface IMediaListState {
    tileWidth: number,
    tileCount: number
}

export default class List extends React.Component<IMediaListProps, IMediaListState> {
    state = {
        tileWidth: 0,
        tileCount: 0
    }

    async componentDidMount() {
        const width = document.documentElement.scrollWidth - PADDING;
        const count = Math.round(width/BASE_TILE_WIDTH);
        this.setState({
            tileWidth: width/count - PADDING,
            tileCount: count
        });
    }

    render() {
        const count = this.state.tileCount,
            width = this.state.tileWidth,
            height = width / TILE_RATIO,
            baseTop = HEADER_HEIGHT + PADDING,
            baseLeft = PADDING;

        return <div>
            {this.props.media.map((media: Media, index: number) => <Tile
                media={media}
                top={baseTop + (count === 0 ? 0 : (Math.floor(index/count) * (height + PADDING)))}
                left={baseLeft + (count === 0 ? 0 : index%count * (width + PADDING))}
                key={media.name}
                width={this.state.tileWidth}
                onClick={() => this.props.onClickMedia(media)}
            />)}
            <div className='clearfix'></div>
        </div>;
    }
}