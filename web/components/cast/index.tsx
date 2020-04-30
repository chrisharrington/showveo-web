import * as React from 'react';

import { Castable, Device } from '@lib/models';
import DeviceService from '@lib/data/devices';

import './style.scss';
import { StringExtensions } from '@web/../lib/extensions';

enum Status {
    Loading = 'loading',
    Playing = 'fa-pause',
    Paused = 'fa-play'
}

interface CastProps {
}

interface CastState {
    castable: Castable | null;
    status: Status;
    time: number;
    duration: number;
    progress: number;
}

export default class Cast extends React.Component<CastProps, CastState> {
    seekBar: HTMLDivElement;
    heartbeatId: any;

    state = {
        time: 0,
        duration: 0,
        castable: null,
        status: Status.Loading,
        progress: 30
    }

    async cast(castable: Castable) {
        this.setState({ castable, status: Status.Loading });
        await DeviceService.cast(castable);
        this.setState({ status: Status.Playing });
    }

    render() {
        const castable = this.state.castable as any as Castable;
        return <div className={`cast ${castable ? 'cast-visible' : ''}`}>
            <div className='controls'>
                <i className='fas fa-backward' />
                <i className='fas fa-stop' onClick={() => this.onStop()} />
                <i className={`fas ${this.state.status}`} onClick={() => this.onTogglePlayback()} />
                <i className='fas fa-forward' />
            </div>
            <div className='seek' onClick={e => this.onSeek(e)}>
                <div ref={c => this.seekBar = c as HTMLDivElement} className='seek-bar'>
                    <div className='seek-bar-progress' style={{ width: this.state.progress + '%' }}></div>
                </div>
            </div>
            <div className='info'>
                <i className='fas fa-closed-captioning fa-lg' />
                <span>{`${StringExtensions.formatTime(this.state.time)} / ${StringExtensions.formatTime(this.state.duration)}`}</span>
            </div>
        </div>;
    }

    private async onTogglePlayback() {
        let status = this.state.status;
        if (status === Status.Loading)
            return;

        status = status === Status.Paused ? Status.Playing : Status.Paused;
        this.setState({ status });

        const device: Device = this.state.castable.options.device;
        if (status === Status.Paused)
            await DeviceService.pause(device);
        else if (status === Status.Playing)
            await DeviceService.play(device);
    }

    private async onStop() {
        clearInterval(this.heartbeatId);
        this.setState({ castable: null, progress: 0, time: 0, duration: 0 });
        await DeviceService.stop(this.state.castable.options.device);
    }

    private onSeek(e) {

    }
}