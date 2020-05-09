import * as React from 'react';
import * as dayjs from 'dayjs';

import { Show, Season, Episode, Device, PlayOptions } from '@lib/models';
import SeasonService from '@lib/data/seasons';
import EpisodeService from '@lib/data/episodes';
import { StringExtensions } from '@lib/extensions';

import { Select, Option } from '@web/components/form/select';
import Modal from '@web/components/modal';
import Metadata from '@web/components/metadata';

const EPISODE_COUNT = 2,
    MODAL_WIDTH = 1144,
    SPACING = 25,
    EPISODE_WIDTH = (MODAL_WIDTH - SPACING*(EPISODE_COUNT-1))/EPISODE_COUNT;

interface IShowModalProps {
    show: Show | null;
    devices: Device[];
    onClose: () => void;
    onPlay: (episode: Episode, options: PlayOptions) => void;
}

interface IShowModalState {
    visible: boolean;
    loading: boolean;
    show: Show | null;
    seasonIndex: number | null;
    seasons: Season[];
    episodes: Episode[];
    subtitles: boolean;
    device: Device | null;
}

export default class ShowModal extends React.Component<IShowModalProps, IShowModalState> {
    episodesInSeasons: { [season: number]: Episode[] }
    
    state = {
        visible: false,
        loading: false,
        show: null,
        seasonIndex: null,
        seasons: [],
        episodes: [],
        subtitles: false,
        device: Device.thisDevice()
    }

    constructor(props) {
        super(props);

        this.episodesInSeasons = {};
    }

    async componentDidUpdate(previousProps) {
        if (!previousProps.show && this.props.show) {
            const show = this.props.show;

            this.setState({ loading: true, visible: true, show });

            const seasons = await SeasonService.getByShowName(show.name),
                episodes = await EpisodeService.getByShowAndSeason(show.name, seasons[0].number);

            this.setState({ loading: false, seasons, episodes, seasonIndex: 0 });
            this.episodesInSeasons[seasons[0].number] = episodes;

            const allEpisodes = await Promise.all(seasons.slice(1).map((season: Season) => EpisodeService.getByShowAndSeason(show.name, season.number)));
            allEpisodes.forEach((episodes: Episode[], index: number) => {
                this.episodesInSeasons[seasons[index+1].number] = episodes;
            });
        } else if (previousProps.show && !this.props.show)
            this.setState({
                visible: false
            });
    }

    render() {
        const show = this.state.show;
        return <Modal
            className='show-modal'
            visible={this.state.visible}
            onClose={() => this.props.onClose()}
        >
            {show && <div>
                <h2 className='title'>{show.name}</h2>

                <div className='show-header'>
                    <Metadata
                        className='metadata'
                        values={[
                            show.year.toString(),
                            `${show.runtime} m`
                        ].concat(show.genres.map(g => StringExtensions.capitalize(g)))}
                    />

                    <div className='actions'>
                        <Select
                            className='action'
                            options={[
                                new Option(false, 'No Subtitles'),
                                new Option(true, 'English')
                            ]}
                            selected={this.state.subtitles}
                            onSelect={(item: Option) => this.setState({ subtitles: item.value as boolean })}
                        />

                        <Select
                            className='action'
                            options={this.props.devices.map(d => new Option(d.id, d.name))}
                            selected={this.state.device.id}
                            onSelect={(option: Option) => this.setState({ device: this.props.devices.find(d => d.id === option.value) })}
                        />
                    </div>

                    <div className='clearfix'></div>
                </div>

                <div className='synopsis'>{show.synopsis}</div>

                <div className='seasons'>
                    <ul>
                        {this.state.seasons.map((season: Season, seasonIndex: number) => <li
                            key={seasonIndex}
                            onClick={() => this.onSeasonChange(season, seasonIndex)}
                        >
                            {`Season ${season.number}`}
                        </li>)}
                    </ul>

                    <div className={`season-selector ${this.state.seasonIndex ? ('season-' + this.state.seasonIndex) : ''}`}></div>
                    <div className='clearfix'></div>
                </div>

                <div className='episodes'>
                    {this.state.episodes.map((episode: Episode) => (
                        <div className='episode' style={{ width: EPISODE_WIDTH }} key={episode.name}>
                            <div className='episode-header'>
                                <span className='episode-number'>{`#${episode.number}`}</span>
                                <Metadata className='episode-metadata' values={[dayjs(episode.airDate).format('MM/DD/YYYY'), StringExtensions.runtime(episode.runtime)]} />
                                <div className='clearfix'></div>
                            </div>

                            <h4 className='episode-title'>{episode.name}</h4>
                            <div className='episode-synopsis'>{episode.synopsis}</div>

                            <div className={`episode-actions ${episode.progress > 0 ? 'split' : ''}`}>
                                {!!episode.progress && <button onClick={() => this.props.onPlay(episode, new PlayOptions(this.state.device, true, this.state.subtitles))}>Resume</button>}
                                <button onClick={() => this.props.onPlay(episode, new PlayOptions(this.state.device, false, this.state.subtitles))}>Play</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>}
        </Modal>
    }

    private onSeasonChange(season: Season, seasonIndex: number) {
        this.setState({
            seasonIndex,
            episodes: this.episodesInSeasons[season.number]
        });
    }
}