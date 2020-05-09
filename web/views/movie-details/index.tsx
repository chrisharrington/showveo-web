import * as React from 'react';
import { Container, Row, Col } from 'react-grid-system';

import MovieService from '@lib/data/movies';
import DeviceService from '@lib/data/devices';
import { Movie, PlayOptions, Status, Device } from '@lib/models';
import { StringExtensions } from '@lib/extensions';

import { RadioButtonGroup, RadioGroupItem } from '@web/components/form/radio-button-group';
import { Button } from '@web/components/form/button';

import './style.scss';

interface MovieDetailsProps {
    match: any;
    onMovieLoaded: (movie: Movie) => void;
    onMoviePlayed: (movie: Movie, playOptions: PlayOptions) => void;
}

interface MovieDetailsState {
    movie: Movie | null;
    devices: Device[];
    playOptions: PlayOptions;
}

export default class Details extends React.Component<MovieDetailsProps, MovieDetailsState> {
    state = {
        movie: null,
        devices: [],
        playOptions: new PlayOptions(Device.thisDevice(), false, false),
    }

    async componentDidMount() {
        const params = this.props.match.params;
        const [movie, devices] = await Promise.all([
            await MovieService.getByYearAndName(params.year, StringExtensions.fromKebabCase(params.name)),
            await DeviceService.getAll()
        ]);

        const playOptions = this.state.playOptions;
        playOptions.isResume = movie.progress > 0;
        
        this.setState({ movie, devices, playOptions });
        this.props.onMovieLoaded(movie);
    }

    render() {
        const movie = this.state.movie as any as Movie;
        if (!movie)
            return <div />;

        return <div className='view movie-details'>
            <Container>
                <div className='movie-details-tile'>
                    <h1 className='title'>{`${movie.name} (${movie.year})`}</h1>

                    <img className='poster' src={movie.poster} alt='poster' />

                    <div className='info-and-actions'>
                        <span className='synopsis'>{movie.synopsis}</span>
                    </div>
                </div>
                {/* <Row>
                    <Col xs={12}>
                        <h1>{`${movie.name} (${movie.year})`}</h1>
                    </Col>
                </Row>
                <Row className='spacing-top'>
                    <Col xs={12}>
                        <span>{movie.synopsis}</span>
                    </Col>
                </Row>
                <Row className='spacing-top'>
                    <Col xs={4}>
                        <RadioButtonGroup<boolean>
                            items={this.getPlayOptions()}
                            onChange={(isResume: boolean) => this.onPlayOptionsChanged('isResume', isResume)}
                        />
                    </Col>
                    <Col xs={4}>
                        <RadioButtonGroup<boolean>
                            items={this.getSubtitleOptions()}
                            onChange={(isSubtitled: boolean) => this.onPlayOptionsChanged('isSubtitled', isSubtitled)}
                        />
                    </Col>
                    <Col xs={4}>
                        <RadioButtonGroup<Device>
                            items={this.state.devices.map((device: Device) => new RadioGroupItem<Device>(device.name, device, this.state.playOptions.device.host === device.host))}
                            onChange={(device: Device) => this.onPlayOptionsChanged('device', device)}
                        />
                    </Col>
                </Row>
                <Separator />
                <Row className='spacing-top'>
                    <Col xs={4} offset={{ xs: 8 }}>
                        <Button
                            label='Play'
                            onClick={() => this.props.onMoviePlayed(this.state.movie, this.state.playOptions)}
                        />
                    </Col>
                </Row> */}
            </Container>
        </div>;
    }

    private onPlayOptionsChanged(key: string, value: any) {
        const playOptions = this.state.playOptions;
        playOptions[key] = value;
        this.setState({ playOptions });
    }

    private getPlayOptions() : RadioGroupItem<boolean>[] {
        const items = [
            new RadioGroupItem<boolean>('Play', false, !this.state.playOptions.isResume)
        ];

        if (this.state.movie.progress > 0)
            items.push(new RadioGroupItem<boolean>('Resume', true, this.state.playOptions.isResume));

        return items;
    }

    private getSubtitleOptions() : RadioGroupItem<boolean>[] {
        const items = [
            new RadioGroupItem<boolean>('No subtitles', false, !this.state.playOptions.isSubtitled)
        ]

        if (this.state.movie.subtitlesStatus === Status.Fulfilled)
            items.push(new RadioGroupItem<boolean>('English', true, this.state.playOptions.isSubtitled));

        return items;
    }
}

class Separator extends React.Component {
    render() {
        return <Row className='spacing-top'>
            <Col xs={12}>
                <div className='separator'></div>
            </Col>
        </Row>
    }
}