import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Router, Route, Switch, Redirect } from 'react-router-dom';

import { StringExtensions } from '@lib/extensions';
import { Movie, Show, Media, Season, PlayOptions, Castable, PlayableType, Navigation, Device, Episode } from '@lib/models';
import MovieService from '@lib/data/movies';
import ShowService from '@lib/data/shows';
import DeviceService from '@lib/data/devices';

import Header from '@web/components/header';
import Cast from '@web/components/cast';
import MovieModal from '@web/components/modal/movie';
import ShowModal from '@web/components/modal/show';

import { Navigator, Views } from '@web/views';
import PlayerView from '@web/views/player';
import MediaView from '@web/views/media';
import ShowView from '@web/views/show';
import MovieDetailsView from '@web/views/movie-details';
import SignInView from '@web/views/sign-in';

import './app.scss';

interface AppState {
    movies: Movie[];
    shows: Show[];
    devices: Device[];
    backdrop: string;
    cast: Castable | null;
    selected: Navigation;
    movie: Movie | null;
    show: Show | null;
}

class App extends React.Component<{}, AppState> {
    cast: Cast;

    state = {
        movies: [],
        shows: [],
        devices: [],
        backdrop: '',
        cast: null,
        selected: Navigation.Movies,

        movie: null,
        show: null
    }

    async componentDidMount() {
        Navigator.history.listen((location) => {
            this.setState({ selected: location.pathname.substring(1).split('/')[0] as Navigation });
        });

        const moviesTask = MovieService.getAll(),
            showsTask = ShowService.getAll(),
            devicesTask = DeviceService.getAll();

        this.setState({
            movies: await moviesTask,
            shows: await showsTask,
            devices: await devicesTask,
            selected: Navigator.history.location.pathname.substring(1).split('/')[0] as Navigation
        });
    }

    render() {
        return <div>
            <Router history={Navigator.history}>
                <Switch>
                    <Route exact path={[Views.Show, Views.Season, Views.MovieDetails]}>
                        <Header
                            backdrop={true}
                            selected={this.state.selected}
                        />

                        {this.state.backdrop && <div className='backdrop' style={{ backgroundImage: `url(${this.state.backdrop})`}}>
                            <div className='backdrop-shader'></div>
                        </div>}
                    </Route>
                    <Route>
                        <Header
                            backdrop={false}
                            selected={this.state.selected}
                        />
                    </Route>
                </Switch>

                <Route render={({ location }) => (
                    <Switch location={location}>
                        <Route exact path={[Views.MoviePlayer, Views.EpisodePlayer]} component={PlayerView} />

                        <Route exact path={Views.SignIn}>
                            <SignInView

                            />
                        </Route>

                        <Route exact path={Views.Movies}>
                            <MediaView
                                media={this.state.movies}
                                onMediaClicked={(movie: Movie) => this.setState({ movie })}
                            />
                        </Route>

                        <Route path={Views.MovieDetails} render={(props) => <MovieDetailsView
                            {...props}
                            onMovieLoaded={(movie: Movie) => this.setState({ backdrop: movie.backdrop })}
                            onMoviePlayed={(movie: Movie, options: PlayOptions) => this.onPlayMovie(movie, options)}
                        />} />

                        <Route exact path={Views.Shows}>
                            <MediaView
                                media={this.state.shows}
                                // onMediaClicked={(show: Show) => this.onNavigateToMedia(Views.Show, show)}
                                onMediaClicked={(show: Show) => this.setState({ show })}
                            />
                        </Route>

                        <Route path={Views.Show} render={(props) => <ShowView
                            {...props}
                            onShowLoaded={(show: Show) => this.setState({ backdrop: show.backdrop })}
                            onSeasonClicked={(show: Show, season: Season) => this.onNavigateToSeason(show, season)}
                        />} />

                        <Route path={Views.BasePath}>
                            <Redirect to={Views.Shows} />
                        </Route>
                    </Switch>
                )} />
            </Router>

            <Cast
                ref={c => this.cast = c}
            />

            <MovieModal
                movie={this.state.movie}
                devices={this.state.devices}
                onClose={() => this.setState({ movie: null })}
                onPlay={(movie: Movie, options: PlayOptions) => this.onPlayMovie(movie, options)}
            />

            <ShowModal
                show={this.state.show}
                devices={this.state.devices}
                onClose={() => this.setState({ show: null })}
                onPlay={(episode: Episode, options: PlayOptions) => this.onPlayEpisode(episode, options)}
            />
        </div>;
    }

    async onPlayMovie(movie: Movie, options: PlayOptions) {
        this.setState({ movie: null });

        if (options.device.isThisDevice) {
            movie.name = StringExtensions.toKebabCase(movie.name);
            Navigator.navigate(Views.MoviePlayer, movie, {
                resume: options.isResume ? '1' : '0',
                subtitles: options.isSubtitled ? '1' : '0'
            });
        } else
            await this.cast.cast(new Castable(movie, options, PlayableType.Movie));
    }

    async onPlayEpisode(episode: Episode, options: PlayOptions) {
        this.setState({ show: null });

        if (options.device.isThisDevice) {
            episode.show = StringExtensions.toKebabCase(episode.show);
            Navigator.navigate(Views.EpisodePlayer, episode, {
                resume: options.isResume ? '1' : '0',
                subtitles: options.isSubtitled ? '1' : '0'
            });
        } else
            await this.cast.cast(new Castable(episode, options, PlayableType.Episode));
    }

    onNavigateToMedia(view: string, media: Media, query?: any) {
        media.name = StringExtensions.toKebabCase(media.name);
        Navigator.navigate(view, media, query);
    }

    onNavigateToSeason(show: Show, season: Season) {
        Navigator.navigate(Views.Season, {
            name: StringExtensions.toKebabCase(show.name),
            season: season.number 
        });
    }
}

ReactDOM.render(<App />, document.querySelector('#container'));
