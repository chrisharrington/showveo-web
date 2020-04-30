import * as React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableHighlight } from 'react-native';
import { NavigationEvents } from 'react-navigation';
import * as Orientation from 'react-native-orientation';
import GoogleCast, { CastButton } from 'react-native-google-cast'

import MovieService from '@lib/data/movies';
import { Movie, CastState } from '@lib/models';

interface IMoviesViewProps {
    navigation: any;
}

interface IMoviesViewState {
    movies: Movie[];
}

export default class MoviesView extends React.Component<IMoviesViewProps, IMoviesViewState> {
    static navigationOptions = {
        headerRight: () => <View style={{ width: 150, alignSelf: 'center' }}>
            <CastButton style={{ width: 24, height: 24 }} />
        </View>
    }

    state = {
        movies: []
    }

    async componentDidMount() {
        this.setState({
            movies: await MovieService.getAll()
        });

        Orientation.unlockAllOrientations();
    }

    render() {
        return <FlatList
            data={this.state.movies}
            renderItem={({ item }) => <MovieView key={Movie.name} movie={item as Movie} {...this.props} />}
            keyExtractor={(item) => (item as Movie).name}
        />;
    }
}

class MovieView extends React.Component<{ movie: Movie, navigation: any }> {
    render() {
        const movie = this.props.movie;
        return <>
            <NavigationEvents
                onWillFocus={() => Orientation.unlockAllOrientations()}
            />
            <TouchableHighlight onPress={() => this.onPress(movie)} activeOpacity={0.9}>
                <View style={styles.itemWrapper}>
                    <View style={styles.item}>
                        <Text style={styles.itemText}>{movie.name}</Text>
                    </View>
                </View>
            </TouchableHighlight>
        </>;
    }

    async onPress(movie: Movie) {
        const state: CastState = await GoogleCast.getCastState() as CastState;
        if (state === CastState.Connected) {
            GoogleCast.castMedia({
                mediaUrl: movie.video(),
                title: movie.name,
                studio: 'Blender Foundation',
                streamDuration: movie.runtime,
            });
        } else {
            this.props.navigation.navigate('Player', {
                playable: movie
            });
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        margin: 0,
    },
    itemWrapper: {
        flex: 1,
        borderBottomColor: 'black',
        backgroundColor: 'white'
    },
    item: {
        padding: 15,
        flex: 1,
        justifyContent: 'center'
    },
    itemText: {
        fontSize: 20
    }
})