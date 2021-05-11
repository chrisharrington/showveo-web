import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Location } from 'history';
import { Router, Route, Switch, Redirect } from 'react-router-dom';

import { StringExtensions } from 'showveo-lib';
import { Movie, Show, PlayOptions, Castable, PlayableType, Navigation, Device, Episode, User } from 'showveo-lib';
import { MovieService, ShowService, DeviceService, AuthService } from 'showveo-lib';
import { HttpError, ErrorCode } from 'showveo-lib';

import Header from '@web/components/header';
import Cast from '@web/components/cast';
import MovieModal from '@web/components/modal/movie';
import ShowModal from '@web/components/modal/show';

import { Navigator, Views } from '@web/views';
import PlayerView from '@web/views/player';
import MediaView from '@web/views/media';
import SignInView from '@web/views/sign-in';

import './app.scss';


interface AppState {
    authorized: boolean;
    authorizing: boolean;
    user: User | null;

    movies: Movie[];
    shows: Show[];
    devices: Device[];

    cast: Castable | null;
    selected: Navigation;

    movie: Movie | null;
    show: Show | null;
}

class App extends React.Component<{}, AppState> {
    cast: Cast;

    state = {
        authorized: false,
        authorizing: true,
        user: null,

        movies: [],
        shows: [],
        devices: [],

        cast: null,
        selected: Navigation.Movies,

        movie: null,
        show: null
    }

    async componentDidMount() {
        try {
            Navigator.history.listen(async (location) => {
                this.setState({
                    selected: location.pathname.substring(1).split('/')[0] as Navigation,
                    authorized: await AuthService.isAuthorized(this.getTokenFromCookie()),
                    authorizing: false
                });
            });

            const authorized = await AuthService.isAuthorized(this.getTokenFromCookie());
            if (!authorized) {
                Navigator.navigate(Views.SignIn);
                return;
            }

            this.setState({
                authorized,
                authorizing: false,
                selected: Navigator.history.location.pathname.substring(1).split('/')[0] as Navigation
            });

            await this.loadMedia();
        } catch (e) {
            if (e instanceof HttpError && (e as HttpError).code === ErrorCode.Unauthorized)
                Navigator.navigate(Views.SignIn);

            console.error(e);
        }
    }

    render() {
        return <div>
            <Router history={Navigator.history}>
                <Route render={({ location }) => {
                    let element: JSX.Element;
                    if (this.state.authorizing)
                        element = <div className='page-loader' />;
                    else if (this.state.authorized || location.pathname.endsWith(Views.SignIn))
                        element = this.renderAuthorized(location);
                    else
                        element = <Redirect to={Views.SignIn} />
                    return element;
                }} />
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

    renderAuthorized(location: Location) : JSX.Element {
        return <>
            <Route exact path={new RegExp(/^(?!.*(\/sign-in)).*$/) as any}>
                <Header
                    backdrop={true}
                    selected={this.state.selected}
                />
            </Route>

            <Switch location={location}>
                <Route exact path={[Views.MoviePlayer, Views.EpisodePlayer]} component={PlayerView} />

                <Route exact path={Views.SignIn}>
                    <SignInView
                        onSignIn={(user: User) => this.onSignIn(user)}
                    />
                </Route>

                <Route exact path={Views.Movies}>
                    <MediaView
                        media={this.state.movies}
                        onMediaClicked={(movie: Movie) => this.setState({ movie })}
                    />
                </Route>

                <Route exact path={Views.Shows}>
                    <MediaView
                        media={this.state.shows}
                        onMediaClicked={(show: Show) => this.setState({ show })}
                    />
                </Route>

                <Route path={Views.BasePath}>
                    <Redirect to={Views.Shows} />
                </Route>
            </Switch>
        </>;
    }

    private async onPlayMovie(movie: Movie, options: PlayOptions) {
        this.setState({ movie: null });

        if (options.device.isThisDevice) {
            Navigator.navigate(Views.MoviePlayer, {
                name: StringExtensions.toKebabCase(movie.name),
                year: movie.year
            }, {
                resume: options.isResume ? '1' : '0',
                subtitles: options.isSubtitled ? '1' : '0'
            });
        } else
            await this.cast.cast(new Castable(movie, options, PlayableType.Movie));
    }

    private async onPlayEpisode(episode: Episode, options: PlayOptions) {
        this.setState({ show: null });

        if (options.device.isThisDevice) {
            Navigator.navigate(Views.EpisodePlayer, {
                show: StringExtensions.toKebabCase(episode.show),
                season: episode.season,
                number: episode.number
            }, {
                resume: options.isResume ? '1' : '0',
                subtitles: options.isSubtitled ? '1' : '0'
            });
        } else
            await this.cast.cast(new Castable(episode, options, PlayableType.Episode));
    }

    private onSignIn(user: User) {
        this.setState({ user, authorized: true, authorizing: false }, () => this.loadMedia());
        Navigator.navigate(Views.Movies);
    }

    private getTokenFromCookie() : string {
        const cookies = document.cookie.split('; ');

        let auth = '';
        cookies.forEach((cookie: string) => {
            const parts = cookie.split('=');
            if (parts[0] === 'token')
                auth = parts[1];
        });
        
        return auth;
    }

    private async loadMedia() {
        const moviesTask = MovieService.getAll(),
            showsTask = ShowService.getAll(),
            devicesTask = DeviceService.getAll();

        this.setState({
            movies: await moviesTask,
            shows: await showsTask,
            devices: await devicesTask,
        });
    }
}

ReactDOM.render(<App />, document.querySelector('#container'));
