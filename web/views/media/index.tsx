import * as React from 'react';

import { Media } from '@lib/models';

import { Navigator, Views } from '@web/views';

import List from './list';

import './style.scss';

interface IMediaViewProps {
    media: Media[];
    onMediaClicked: (media: Media) => void;
}

export default class MediaView extends React.Component<IMediaViewProps> {
    render() {
        return <div className='view media'>
            <List
                media={this.props.media}
                onClickMedia={(media: Media) => this.props.onMediaClicked(media)}
            />
        </div>;
    }
}