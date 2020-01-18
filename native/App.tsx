import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';

import MoviesView from './views/movies';
import PlayerView from './views/player';

const Navigator = createStackNavigator({
    Movies: { screen: MoviesView },
    Player: { screen: PlayerView }
});

const App = createAppContainer(Navigator);
export default App;