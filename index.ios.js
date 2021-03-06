import React, { Component } from 'react';
import {
  ActivityIndicator,
  AppRegistry,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Storage from './src/data/storage';
import Menu from './src/components/menu';
import SideMenu from 'react-native-side-menu';
import ContentView from './src/components/content-view';
import dismissKeyboard from 'dismissKeyboard';
import UserActions from './src/actions/user';
import Styles from './src/styles/styles.ios';
import Api from './src/api/api';

class AllAboard extends Component {
  constructor() {
    super();
    this.openMenu = this.openMenu.bind(this);
    UserActions.handleRouteSelection = UserActions.handleRouteSelection.bind(this);
    UserActions.updateDirection = UserActions.updateDirection.bind(this);
    UserActions.getPredictions = UserActions.getPredictions.bind(this);
    this.state = {
      isMenuOpen: true,
      isLoading: false,
    }
  }

  render() {
    const Dimensions = require('Dimensions');
    const deviceWidth = Dimensions.get('window').width;
    const deviceHeight = Dimensions.get('window').height;

    return (
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <SafeAreaView style={Styles.safeArea}>

        <SideMenu
          animation='spring'
          touchToClose={true}
          openMenuOffset={deviceWidth * 0.86}
          isOpen={this.state.isMenuOpen}
          menu={
            <Menu
              activeRoute={this.state.selectedRoute}
              onSelect={UserActions.handleRouteSelection}
              recentlyViewedRoutes={this.state.recentRoutes}
              />
          }
        >
          <ContentView
            onLeftButtonPress={this.openMenu}
            onChooseDirection={UserActions.updateDirection}
            activeRoute={this.state.selectedRoute}
            directions={this.state.directions}
            selectedDirection={this.state.selectedDirection}
            selectedStop={this.state.selectedStop}
            predictions={this.state.predictions}
            error={this.state.error}
          />
        </SideMenu>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    );
  }

  componentDidMount() {
    UserActions.listenForRefreshPredictions(((predictions) => {
      this.setState({
        predictions: predictions.prediction.prd
      });
    }).bind(this));

    Storage.getRecentlyViewedRoutes().then((recentlyViewedRoutes) => {
      this.setState({
        recentRoutes: recentlyViewedRoutes,
      });
    });
  }

  openMenu() {
    this.setState({
      isMenuOpen: true
    });
  }
}

AppRegistry.registerComponent('AllAboard', () => AllAboard);
