import React, {
  ActivityIndicatorIOS,
  AppRegistry,
  AppStateIOS,
  AsyncStorage,
  Component,
  Image,
  ListView,
  RefreshControl,
  ScrollView,
  StatusBarIOS,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native';
import Api from '/../src/api/api';
import _ from 'lodash';
import SideMenu from 'react-native-side-menu';
import DismissKeyboard from 'dismissKeyboard';
import Styles from '/../src/styles/styles.ios'

// TODO move all component vars to classes
var Menu = React.createClass({
  componentDidMount: function() {
    this.getAllRoutes(),
    AppStateIOS.addEventListener('change', this.handleAppStateChange);

    AsyncStorage.getItem("recentRoutes").then((value) => {
      this.setState({recentRoutes: value});
    }).done();
  },

  componentWillUnmount: function() {
    AppStateIOS.removeEventListener('change', this.handleAppStateChange);
  },

  handleAppStateChange: function(state) {
    if (!this.state.loaded) {
      this.getAllRoutes()
    }
  },

  getInitialState: function() {
    return {
      selectedRoute: null,
      prediction: null,
      userLocation: '',
      inputFocused: false,
      allRoutes: [],
      routeDataSource: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}),
      filterText: ''
      // recentRoutes:
    }
  },

  getAllRoutes: function() {
    Api.getAllRoutes()
      .then((responseData) => responseData['bustime-response']['routes'])
      .then((routes) => this.setState({
        allRoutes: routes,
      }));
  },

  render: function() {
    let { allRoutes, filterText } = this.state;

    let filteredRoutes = filterText.length > 0
      ? this._filterRoutes(allRoutes, filterText)
      : allRoutes;

    return (
      <View style={Styles.menuContainer}>
        <SearchBar onChange={this._onChange} />
        <ListView
          // renderHeader={{
          //   // <RecentlyViewedRoutes routes={this.props.recentlyViewedRoutes} />
          // }}
          dataSource={this.state.routeDataSource.cloneWithRows(filteredRoutes)}
          renderRow={this.renderRoute}
        />
      </View>
    );
  },

  _onChange: function(text) {
    this.setState({
      filterText: text,
    });
  },

  _filterRoutes: function(routes, filterText) {
    return _.filter(routes, (route) => {
      let filterTextLowercase = filterText.toLowerCase();
      let routeNameLowercase = route.rtnm.toLowerCase();

      if (route.rt.indexOf(filterTextLowercase) > -1) {
        return true;
      }

      if (routeNameLowercase.indexOf(filterTextLowercase) > -1) {
        return true;
      }

      return false;
    });
  },

  renderRoute: function(route) {
    return (
      <TouchableHighlight
        onPress={() => this.props.onSelect(route)
                    // && this.refs.searchInput.blur()
                    && UserActions.viewRoute(route)}
        underlayColor='#0D1F42'
      >
        <View style={Styles.row}>
          <View style={Styles.menuRouteNumberContainer}>
            <Text style={Styles.menuRouteNumber}>
              {route.rt}
            </Text>
          </View>
          <Text style={Styles.menuRouteName}>
            {route.rtnm}
          </Text>
        </View>
      </TouchableHighlight>
    );
  }

});



var SearchBar = React.createClass({
  // when a route is selected or the menu button is tapped
  // we should
  // 1) blur the field
  // 2) reset the filtertext

  // when the textinput is focused
  // we should
  // 1) reset the filtertext

  render: function() {

    let { onChange } = this.props;
    return (
      <TextInput
        ref='searchInput'
        style={Styles.menuSearch}
        autoCapitalize='words'
        autoCorrect={false}
        blurOnSubmit={true}
        clearButtonMode='while-editing'
        placeholder='Search for a route'
        placeholderTextColor='#BABABA'
        clearTextOnFocus={true}
        returnKeyType='default'
        onChangeText={onChange} />
    );
  }
});
// var RecentlyViewedRoutes = React.createClass({
//   render: function() {
//     return (
//       <Text>
//         66
//       </Text>
//       <Text>
//         56
//       </Text>
//       <Text>
//         12-B
//       </Text>
//     );
//   }
// });
var Directions = React.createClass({
  render: function() {
    var directions = this.props.directions || [];

    return (
      <View style={Styles.directions}>
        { directions.map((direction, i) =>
          <TouchableOpacity key={i} style={Styles.direction} onPress={() => this.props.onChooseDirection(direction)}>
            <Text style={direction.dir == this.props.selectedDirection.dir ? Styles.directionTextActive : Styles.directionText}>
              {this._prettyName(direction.dir)}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  },

  _prettyName: function(fullDirectionName) {
    var DIRECTION_NAME_MAP = {
      "Northbound" : "North",
      "Southbound" : "South",
      "Eastbound"  : "East",
      "Westbound"  : "West",
      "North Bound" : "North",
      "South Bound" : "South",
      "East Bound"  : "East",
      "West Bound"  : "West",
    };

    return DIRECTION_NAME_MAP[fullDirectionName];
  }
});

var ContentViewHeader = React.createClass({
  render: function() {
    var activeRoute = this.props.activeRoute || { rtnm: "Choose Route", rt: "" };

    return (
      <View style={Styles.contentViewHeader}>
        <Button onPress={this.props.onLeftButtonPress}  />
        <View style={Styles.contentViewHeaderRouteNumberAndNameContainer}>
          <View style={activeRoute.rt && Styles.contentViewHeaderRouteNumberContainer}>
            <Text style={Styles.contentViewHeaderRouteNumber}>
              {activeRoute.rt}
            </Text>
          </View>
          <Text style={Styles.contentViewHeaderRouteName}>
            {activeRoute.rtnm}
          </Text>
        </View>
        <View style={Styles.contentViewHeaderDummyRightSpace}></View>
      </View>
    );
  }
});

class Button extends React.Component  {
  render() {
    return (
      <TouchableOpacity onPress={this.props.onPress}>
        <Image style={Styles.contentViewHeaderIcon} source={require('./assets/images/contentViewHeaderIcon.png')} />
      </TouchableOpacity>
    );
  }
}


var Minutes = React.createClass({
  render: function() {
    var prediction = this.props.predictions && this.props.predictions[0];
    if (!prediction) { return null };

    return (
      <View>
        <Text style={Styles.minutes}>{prediction.prdctdn}</Text>
        <Text style={Styles.minutesLabel}>minutes</Text>
      </View>
      );
  }
});

var Stop = React.createClass({
  render: function() {
    var stop = this.props.stop;
    if (!stop) { return null; }

    return (
      <Text style={Styles.stop}>{stop.stpnm}</Text>
    );
  }
});

var Destination = React.createClass({
  render: function() {
    var prediction = this.props.predictions && this.props.predictions[0];
    if (!prediction) { return null; }

    return(
      <Text style={Styles.destination}>To {prediction.des}</Text>
    );
  }
});

var NextPrediction = React.createClass({
  render: function() {

    var prediction = this.props.prediction;
    if (!prediction) { return null };

    return(
      <Text style={Styles.nextPrediction}>{prediction.prdctdn} minutes</Text>
    );
  }
});

var Error = React.createClass({

  render: function() {
    let { error } = this.props;

    return (
      <Text style={Styles.nextPrediction}>
        {error.msg}
      </Text>
    )
  }
});

var ContentView = React.createClass({
  getInitialState: function() {
    return {
        predictions: this.props.predictions,
        isRefreshing: false,
      }
  },

  render: function() {
    let { activeRoute, error } = this.props;

    return (
      <View style={Styles.contentView}>
        <ContentViewHeader activeRoute={activeRoute} onLeftButtonPress={this.props.onLeftButtonPress} />
          <ScrollView
            style={Styles.container}
            activeRoute={activeRoute}
            refreshControl={
              <RefreshControl
                refreshing={this.state.isRefreshing}
                onRefresh={this._onRefresh}
                tintColor="#FFF"
                title=""
              />
            }
          >

            <Directions directions={this.props.directions} selectedDirection={this.props.selectedDirection} onChooseDirection={this.props.onChooseDirection} />
            {error &&
              <Error error={error} />
            }

            {!error &&
              <View>
                <Minutes predictions={this.props.predictions} />
                <Stop stop={this.props.selectedStop} />
                <Destination predictions={this.props.predictions} />
                <NextPrediction prediction={this.props.predictions && this.props.predictions[1]} />
                <NextPrediction prediction={this.props.predictions && this.props.predictions[2]} />
              </View>
            }
          </ScrollView>
      </View>

      );
  },

  _onRefresh() {
    this.setState({
      isRefreshing: true
    });

    UserActions.refreshPredictions(this.props.activeRoute, this.props.selectedDirection)
      .then(() => {
        this.setState({
          isRefreshing: false,
        });
      })
      .catch(() => {
        alert("Oops! Please try again.");

        this.setState({
          isRefreshing: false,
        });
      });

  }
});

var AllAboardReact = React.createClass({
  render: function() {

    var menu = (
      <Menu activeRoute={this.state.selectedRoute} onSelect={this.handleRouteSelection} />
    );

    // TODO refactor this into a module that styles can use, too
    // make sure Dimensions are set in render function, in case we support
    // landscape orientation or something in the future
    const Dimensions = require('Dimensions');
    const deviceWidth = Dimensions.get('window').width;
    const deviceHeight = Dimensions.get('window').height;

    return (
      <SideMenu
        animation='spring'
        touchToClose={true}
        openMenuOffset={deviceWidth * 0.86}
        isOpen={this.state.isMenuOpen}
        menu={menu}
        >
        <ContentView
          onLeftButtonPress={this.openMenu}
          onChooseDirection={this.updateDirection}
          activeRoute={this.state.selectedRoute}
          directions={this.state.directions}
          selectedDirection={this.state.selectedDirection}
          selectedStop={this.state.selectedStop}
          predictions={this.state.predictions}
          error={this.state.error}
          />
      </SideMenu>
    );
  },

  componentDidMount() {
    UserActions.listenForRefreshPredictions(((predictions) => {
      this.setState({
        predictions: predictions.prediction.prd
      });
    }).bind(this));


    // UserActions.listenForRouteViewed(() => {
    //   //
    //   // AsyncStorage.setItem(...);
    // });
  },

  getInitialState: function() {
    return {
      isMenuOpen: true,
    };
  },

  openMenu: function() {
    this.setState({
      filterText: '',
      isMenuOpen: true
    });

  },

  handleRouteSelection: function(route) {
    // TODO blur the text input & reset the filter text
    this.setState({
      selectedRoute: route,
      filterText: '', // this isn't working
      isMenuOpen: false,
      inputFocused: false,
      selectedStop: null,
      predictions: null // Hide the predictions but we should show a loader
    });

    Api.getDirections(route).then((directions) => {
      this.setState({
        directions: directions,
        selectedDirection: directions[0],
      });
      console.log(this.state.selectedDirection);
      this.getNearestStop();
    });
  },

  updateDirection: function(direction) {
    this.setState({
      selectedDirection: direction,
      selectedStop: null,
      predictions: null // Hide the predictions but we should show a loader
    });
    console.log(this.state.selectedDirection);
    this.getNearestStop();
  },

  getNearestStop: function() {
    Api.getNearestStop(this.state.selectedRoute, this.state.selectedDirection, (selectedStop) => {
      this.setState({
        selectedStop: selectedStop,
      });

      this.getPredictions();
    });
  },

  getPredictions: function() {
    Api.getPredictions(this.state.selectedRoute, this.state.selectedStop).then((response) => {
      if (response.hasOwnProperty('error')) {
        this.setState({
          predictions: null,
          error: response['error'][0],
        });
      }
      else {
        this.setState({
          predictions: response['prd'],
          error: null,
        });
      }
    });
  }
});

const UserActions = {
  refreshPredictions(route, direction, prediction) {
    return new Promise((resolve, reject) => {
      console.log('refreshing prediction for... ' + route.rtnm + ' - ' + direction.dir);

      // Skipping state to just grab this from the API call down there
      // This is probably bad
      var selectedStop;


      setTimeout(() => {
      // Get the nearest stop because the user may have moved
        Api.getNearestStop(route, direction, (selectedStop) => {
          console.log(route, direction);
          console.log(selectedStop);
        Api.getPredictions(route, selectedStop).then((response) => {
            if (response.hasOwnProperty('error')) {
              console.log('getPredictions response has an error!');
              // TODO handle error

            }
            else {
              console.log('getPredictions response seems ok');
              console.log(response.prd[0].prdctdn + ' minutes until the bus arrives');
              // Should we use that listener callback?
              this.callback({ prediction: response });
            }
          });
        });


      resolve('success');
    }, 500);
    });
  },

  listenForRefreshPredictions(callback) {
    this.callback = callback;
  }
};




AppRegistry.registerComponent('AllAboardReact', () => AllAboardReact);
