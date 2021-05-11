import * as React from 'react';
import { Container, Row, Col } from 'react-grid-system';

import { Movie, Device, PlayOptions } from 'showveo-lib';
import { StringExtensions } from 'showveo-lib';

import Modal from '@web/components/modal';
import Metadata from '@web/components/metadata';
import { Select, Option } from '@web/components/form/select';
import Button from '@web/components/form/button';

interface IMovieModalProps {
    movie: Movie | null;
    devices: Device[];
    onClose: () => void;
    onPlay: (movie: Movie, options: PlayOptions) => void;
}

interface IMovieModalState {
    subtitles: boolean;
    resume: boolean;
    device: Device | null;
}

export default class MovieModal extends React.Component<IMovieModalProps, IMovieModalState> {
    state = {
        subtitles: false,
        resume: false,
        device: Device.thisDevice()
    }

    render() {
        const movie = this.props.movie;
        return <Modal
            className='movie-modal'
            visible={!!movie}
            onClose={() => this.props.onClose()}
        >
            {movie && <div>
                <h2 className='title'>{movie.name}</h2>

                <Metadata
                    className='info'
                    values={[
                        movie.year.toString(),
                        StringExtensions.runtime(movie.runtime)
                    ].concat(movie.genres.map(g => StringExtensions.capitalize(g)))}
                />

                <span className='synopsis'>{movie.synopsis}</span>

                <Container fluid={true} className='options no-padding'>
                    <Row>
                        <Col xs={12}>
                            <Select
                                options={[
                                    new Option(false, 'Play'),
                                    new Option(true, 'Resume')
                                ].filter(o => movie.progress === 0 ? !o.value : true)}
                                selected={this.state.resume}
                                onSelect={(option: Option) => this.setState({ resume: option.value as boolean })}
                            />
                        </Col>
                    </Row>
                    <Row className='row-spacing'>
                        <Col xs={12}>
                            <Select
                                options={[
                                    new Option(false, 'No Subtitles'),
                                    new Option(true, 'English')
                                ]}
                                selected={this.state.subtitles}
                                onSelect={(item: Option) => this.setState({ subtitles: item.value as boolean })}
                            />
                        </Col>
                    </Row>
                    <Row className='row-spacing'>
                        <Col xs={12}>
                            <Select
                                options={this.props.devices.map(d => new Option(d.id, d.name))}
                                selected={this.state.device.id}
                                onSelect={(option: Option) => this.setState({ device: this.props.devices.find(d => d.id === option.value) })}
                            />
                        </Col>
                    </Row>
                    <Row className='row-spacing'>
                        <Col xs={12}>
                            <Button
                                label='Play'
                                className='play-button'
                                onClick={() => this.props.onPlay(this.props.movie, new PlayOptions(this.state.device, this.state.resume, this.state.subtitles))}
                            />
                        </Col>
                    </Row>
                </Container>
            </div>}
        </Modal>
    }
}