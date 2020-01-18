import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import Video from 'react-native-video-controls';
import Orientation from 'react-native-orientation';

import { Playable } from '@lib/models';

interface IPlayerViewProps {
    navigation: any;
}

interface IPlayerViewState {
    playable: Playable | null;
}

export default class PlayerView extends React.Component<IPlayerViewProps, IPlayerViewState> {
    static navigationOptions = {
        headerShown: false
    }

    state = {
        playable: null
    }
    
    componentDidMount() {
        this.setState({
            playable: this.props.navigation.getParam('playable')
        });

        Orientation.lockToLandscape();
    }

    render() {
        const playable: Playable = this.state.playable as any as Playable;
        if (!playable)
            return <View />;

        return <View style={styles.container}>
            <Video source={{ uri: playable.video() }}
                style={styles.video}
                showOnStart={true}
                fullscreen={true}
                navigator={this.props.navigation}
                disableVolume={true}
                disableFullscreen={true}
            />
        </View>;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        margin: 0,
    },
    video: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
    }
});