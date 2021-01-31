import * as React from 'react';
import * as QueryString from 'query-string';

import './style.scss';

import { StringExtensions } from '@lib/extensions';
import MovieService from '@lib/data/movies';
import EpisodeService from '@lib/data/episodes';
import { Playable, Status, Device } from '@lib/models';

const TIME_REMAINDER: number = 1000;

interface PlayerProps {
    match: any;
}

interface PlayerState {
    playable: Playable | null;
    loading: boolean;
    error: boolean;
    playing: boolean;
    time: number;
    seek: number;
    subtitles: boolean;
}

export default class PlayerView extends React.Component<PlayerProps, PlayerState> {
    video: HTMLVideoElement;
    seekBar: HTMLDivElement;
    onBeforeUnloadHandler: any;
    timeInterval: number;
    timeRemainder: number = TIME_REMAINDER;

    state = {
        playable: null,
        loading: true,
        error: false,
        playing: true,
        time: 0,
        seek: 0,
        subtitles: false
    }

    async componentDidMount() {
        try {
            const params = this.props.match.params;
            let playable: Playable;
            if (params.name && params.year)
                playable = await MovieService.getByYearAndName(params.year, params.name);
            else if (params.show && params.season && params.number)
                playable = await EpisodeService.getByShowSeasonAndEpisode(params.show, params.season, params.number);
            else
                throw new Error(`Unable to derive media type: ${params}`);

            const query = QueryString.parse(location.search);
            this.setState({
                playable
            }, () => {
                this.video.load();

                if (playable.progress)
                    this.seek(playable.progress);

                this.onToggleSubtiles(query.subtitles === '1');
            });

            this.onBeforeUnloadHandler = this.onBeforeUnload.bind(this);
            window.addEventListener('beforeunload', this.onBeforeUnloadHandler);
        } catch (e) {
            console.error(e);
            this.setState({
                loading: false,
                error: true
            });
        }
    }

    async componentWillUnmount() {
        window.removeEventListener('beforeunload', this.onBeforeUnloadHandler);
        await this.onBeforeUnload();
    }

    render() {
        const playable = this.state.playable as any as Playable;
        if (!playable)
            return <div />;

        return <div className={`player ${this.state.loading ? 'loading' : ''} ${this.state.playing ? 'playing' : 'paused'}`}>
            <video
                ref={c => this.video = c as HTMLVideoElement}
                autoPlay
                onClick={e => this.onTogglePlayback(e)}
                onSeeking={() => this.onLoading(true)}
                onSeeked={() => this.onLoading(false)}
                onWaiting={() => this.onWaiting()}
                onPlaying={() => this.onPlaying()}
                onError={() => this.setState({ loading: false, error: true })}
                onPause={() => this.onPause()}
            >
                <source src={playable.video(this.state.seek)} />
                <track label='English' kind='subtitles' src={playable.subtitle()} srcLang='en' />
                Sorry, your browser doesn't support embedded videos.
            </video>

            <div className='play-pause'>
                <i className={`fas fa-play fa-lg`}></i>
            </div>
            <div className='loader'></div>
            <div className={`error-indicator ${this.state.error && 'visible'}`}>
                <i className={`fas fa-times fa-lg`}></i>
            </div>

            <div className='controls'>
                <div className='top-controls'>
                    <div className='time'>
                        <span>{StringExtensions.formatTime(this.state.time)} / {StringExtensions.formatTime(this.state.playable.runtime)}</span>
                    </div>
                    <div className='actions'>
                        {playable.subtitlesStatus === Status.Fulfilled && <i className={`fas fa-closed-captioning fa-lg ${this.state.subtitles && 'active'}`} onClick={() => this.onToggleSubtiles(!this.state.subtitles)}></i>}
                    </div>
                </div>
                <div className='seek' onClick={e => this.onSeek(e)}>
                    <div ref={c => this.seekBar = c as HTMLDivElement} className='seek-bar'>
                        <div className='seek-bar-progress' style={{ width: (this.state.time / this.state.playable.runtime * 100) + '%' }}></div>
                    </div>
                </div>
            </div>
        </div>;
    }

    private onToggleSubtiles(enabled: boolean) {
        const track = this.video.textTracks[0];
        if (!track)
            return;

        this.setState({
            subtitles: enabled
        }, () => {
            track.mode = this.state.subtitles ? 'showing' : 'hidden';
        });
    }

    private onTogglePlayback(e) {
        if (e.isDefaultPrevented() || this.state.error)
            return;

        const playing = this.state.playing;
        if (playing) {
            this.video.pause();
        } else
            this.video.play();
    }

    private async onSeek(e) {
        const playable = this.state.playable as Playable | null;
        if (!playable)
            return;

        e.preventDefault();

        const width = this.seekBar.clientWidth,
            position = e.clientX - e.target.getBoundingClientRect().left,
            time = playable.runtime * position/width;

        await this.seek(time);
    }

    private onLoading(loading: boolean) {
        if (this.state.error)
            return;

        this.setState({ loading });
    }

    private onPlaying() {
        setTimeout(() => updateTime.call(this), this.timeRemainder);
        this.setState({ playing: true });
        this.onLoading(false);

        function updateTime() {
            this.timeRemainder = TIME_REMAINDER;
            this.setState({ time: this.state.time + 1 });
            this.timeInterval = setTimeout(() => updateTime.call(this), this.timeRemainder)
        }
    }

    private onPause() {
        this.timeRemainder = (this.video.currentTime - Math.floor(this.video.currentTime)) * 1000;
        if (this.timeInterval)
            clearInterval(this.timeInterval);
        this.setState({ playing: false });
    }

    private onWaiting() {
        this.onLoading(true)
    }

    private async onBeforeUnload() {
        await this.saveProgress();
    }

    private async saveProgress() {
        const playable: Playable = this.state.playable as any as Playable;
        if (!playable)
            return;

        await Promise.all([
            playable.saveProgress(this.state.time),
            playable.stop(Device.thisDevice())
        ]);
    }

    private async seek(time: number) {
        if (this.timeInterval)
            clearInterval(this.timeInterval);

        this.timeRemainder = (time - Math.floor(time)) * 1000;
        this.setState({ time, seek: time }, () => this.video.load());

        await this.saveProgress();
    }
}