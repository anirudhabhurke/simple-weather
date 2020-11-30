import React, { Component } from 'react';
import {
      View,
      Text,
      StyleSheet,
      TextInput,
      TouchableOpacity,
      Alert,
      Image,
      StatusBar,
      Platform,
      PermissionsAndroid,
      ImageBackground,
      ActivityIndicator,
      ToastAndroid,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NetInfo from '@react-native-community/netinfo';

export default class App extends Component {
      constructor(props) {
            super(props);
            this.state = {
                  hasloaded: false,
                  cityName: '--',
                  data: {},
                  location: {},
                  permissionDenied: false,
                  icon: 'my-location',
                  dataLoaded: true,
                  connectionStatus: null,
            };
      }

      componentDidMount = () => {
            NetInfo.fetch().then((status) => {
                  this.setState({
                        connectionStatus: status.isInternetReachable,
                  });
                  if (status.isInternetReachable) {
                        this.getLocation();
                  } else {
                        ToastAndroid.show('Network error', ToastAndroid.SHORT);
                        this.setState({
                              hasloaded: true,
                              dataLoaded: false,
                        });
                  }
            });
            this.checkConnection();
      };

      checkConnection = () => {
            NetInfo.addEventListener((status) => {
                  console.log('Internet Available: ', status.isInternetReachable);
                  this.setState({
                        connectionStatus: status.isInternetReachable,
                  });
            });
      };

      getWeather = async () => {
            if (this.state.connectionStatus) {
                  if (this.state.cityName === '' || this.state.cityName === '--') {
                        Alert.alert('Please Enter City');
                  } else
                        return await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${this.state.cityName}&appid={YOUR_API_KEY}`)
                              .then((response) => response.json())
                              .then((responseJSON) => {
                                    if (responseJSON.cod == 404) {
                                          Alert.alert('Oops...City not found');
                                    } else
                                          this.setState({
                                                hasloaded: true,
                                                data: responseJSON,
                                                dataLoaded: true,
                                          });
                              })
                              .catch((error) => {
                                    console.log(error);
                              });
            } else {
                  ToastAndroid.show('Network error', ToastAndroid.SHORT);
                  this.setState({
                        hasloaded: true,
                        dataLoaded: false,
                  });
            }
      };
      getWeatherfromLocation = async () => {
            return await fetch(
                  `https://api.openweathermap.org/data/2.5/weather?lat=${this.state.location.coords.latitude}&lon=${this.state.location.coords.longitude}&appid={YOUR_API_KEY}`
            )
                  .then((response) => response.json())
                  .then((responseJSON) => {
                        this.setState({
                              hasloaded: true,
                              data: responseJSON,
                              dataLoaded: true,
                        });
                  })
                  .catch((error) => {
                        console.log(error);
                  });
      };

      getTime = (sec) => {
            let date = new Date(sec * 1000);
            return (timestr = date.toLocaleTimeString());
      };

      hasLocationPermission = async () => {
            if (Platform.OS === 'ios' || (Platform.OS === 'android' && Platform.Version < 23)) {
                  return true;
            }
            const hasPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
            if (hasPermission) {
                  return true;
            }
            const status = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
            if (status === PermissionsAndroid.RESULTS.GRANTED) {
                  this.setState({
                        icon: 'my-location',
                  });
                  return true;
            }
            if (status === PermissionsAndroid.RESULTS.DENIED) {
                  this.setState({
                        cityName: 'Mumbai',
                        icon: 'location-disabled',
                  });
                  this.getWeather();
                  ToastAndroid.show('Location permission denied.', ToastAndroid.LONG);
            } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
                  this.setState({
                        cityName: 'Mumbai',
                        icon: 'location-disabled',
                  });
                  this.getWeather();
                  ToastAndroid.show('Location permission revoked.', ToastAndroid.LONG);
            }
            return false;
      };

      getLocation = async () => {
            if (this.state.connectionStatus) {
                  const hasLocationPermission = await this.hasLocationPermission();
                  if (!hasLocationPermission) return;
                  else {
                        this.setState({ loading: true }, () => {
                              Geolocation.getCurrentPosition(
                                    (location) => {
                                          this.setState({ location, dataLoaded: true });
                                          this.getWeatherfromLocation();
                                    },
                                    (error) => {
                                          ToastAndroid.show(error.message, ToastAndroid.SHORT);
                                          this.setState({
                                                hasloaded: true,
                                                dataLoaded: false,
                                          });
                                    },
                                    {
                                          enableHighAccuracy: false,
                                          timeout: 10000,
                                          maximumAge: 20000,
                                          distanceFilter: 50,
                                          forceRequestLocation: true,
                                    }
                              );
                        });
                  }
            } else {
                  ToastAndroid.show('Network error', ToastAndroid.SHORT);
                  this.setState({
                        hasloaded: true,
                        dataLoaded: false,
                  });
            }
      };

      render() {
            if (!this.state.hasloaded) {
                  return (
                        <ImageBackground
                              source={require('./assets/sunsetImage.jpg')}
                              style={{
                                    flex: 1,
                                    backgroundColor: '#212121',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                              }}
                        >
                              <StatusBar backgroundColor="#1A1237" barStyle="light-content" />
                              <ActivityIndicator size={'large'} color={'#FFF'}></ActivityIndicator>
                              <Text style={{ fontSize: 20, marginTop: 10, color: '#FFF' }}>Fetching weather...</Text>
                        </ImageBackground>
                  );
            } else
                  return (
                        <ImageBackground source={require('./assets/sunsetImage.jpg')} style={styles.container}>
                              <StatusBar backgroundColor="#1A1237" barStyle="light-content" />
                              <Text style={styles.header}>Eloquent Weather</Text>
                              <View style={styles.form}>
                                    <TextInput
                                          placeholder={' Enter City...'}
                                          placeholderTextColor={'#c1c1c1'}
                                          onChangeText={(cityName) => {
                                                this.setState({ cityName });
                                          }}
                                          style={styles.textinput}
                                    ></TextInput>
                                    <TouchableOpacity
                                          onPress={() => {
                                                this.getWeather();
                                          }}
                                          style={{ margin: 10 }}
                                    >
                                          <Icon name={'search'} color={'#FFF'} size={30}></Icon>
                                    </TouchableOpacity>
                              </View>
                              <View style={styles.weatherCard}>
                                    <View style={styles.mainStatus}>
                                          <Text style={styles.mainText}>
                                                {this.state.dataLoaded == false ? '--' : `${this.state.data.name}, ${this.state.data.sys.country}`}
                                          </Text>
                                    </View>
                                    <View style={styles.description}>
                                          <Text style={styles.mainText}>
                                                {this.state.dataLoaded == false
                                                      ? '--'
                                                      : `${(this.state.data.main.temp - 273.15).toFixed(0)} °C / ${(
                                                              (this.state.data.main.temp - 273.15) * (9 / 5) +
                                                              32
                                                        ).toFixed(0)} °F`}
                                          </Text>
                                          <Image
                                                source={{
                                                      uri:
                                                            this.state.dataLoaded == false
                                                                  ? null
                                                                  : `https://openweathermap.org/img/wn/${this.state.data.weather[0].icon}@2x.png`,
                                                }}
                                                style={styles.statusImage}
                                          ></Image>
                                    </View>
                                    <View style={styles.moreInfo}>
                                          <Text style={styles.descriptionText}>
                                                {this.state.dataLoaded == false ? '--' : this.state.data.weather[0].description}
                                          </Text>
                                          <Text style={styles.moreInfoText}>
                                                Wind: {this.state.dataLoaded == false ? '--' : this.state.data.wind.speed.toFixed(0)} m/s
                                          </Text>
                                          <Text style={styles.moreInfoText}>
                                                Pressure: {this.state.dataLoaded == false ? '--' : this.state.data.main.pressure.toFixed(2)} hpa
                                          </Text>
                                          <Text style={styles.moreInfoText}>
                                                Humidity: {this.state.dataLoaded == false ? '--' : this.state.data.main.humidity.toFixed(0)} %
                                          </Text>
                                          <Text style={styles.moreInfoText}>
                                                Sunrise: {this.state.dataLoaded == false ? '--' : this.getTime(this.state.data.sys.sunrise)}
                                          </Text>
                                          <Text style={styles.moreInfoText}>
                                                Sunset: {this.state.dataLoaded == false ? '--' : this.getTime(this.state.data.sys.sunset)}
                                          </Text>
                                          <Text style={styles.moreInfoText}>
                                                Geo coords:{' '}
                                                {this.state.dataLoaded == false
                                                      ? '--'
                                                      : `[${this.state.data.coord.lat}, ${this.state.data.coord.lon}]`}
                                          </Text>
                                    </View>
                              </View>
                              <TouchableOpacity
                                    style={styles.locationButton}
                                    onPress={() => {
                                          this.setState({
                                                hasloaded: !this.state.hasloaded,
                                                dataLoaded: !this.state.dataLoaded,
                                          });
                                          this.getLocation();
                                    }}
                              >
                                    <Icon name={this.state.icon} color={'#3C40C6'} size={30}></Icon>
                              </TouchableOpacity>
                        </ImageBackground>
                  );
      }
}

const styles = StyleSheet.create({
      container: {
            flex: 1,
      },
      header: {
            marginTop: 10,
            fontSize: 30,
            fontFamily: 'sans-serif-light',
            alignSelf: 'center',
            marginBottom: 10,
            color: '#FFF',
      },
      form: {
            backgroundColor: 'rgba(60, 64, 198, 0.4)',
            borderRadius: 10,
            marginHorizontal: 20,
            alignItems: 'center',
            justifyContent: 'space-between',
            flexDirection: 'row',
      },
      textinput: {
            width: '80%',
            borderRadius: 10,
            fontFamily: 'sans-serif-light',
            fontSize: 20,
            color: '#FFF',
            padding: 5,
            paddingHorizontal: 10,
      },
      weatherCard: {
            borderRadius: 10,
            backgroundColor: 'rgba(60, 64, 198, 0.4)',
            marginHorizontal: 20,
            marginTop: 10,
            padding: 15,
      },
      mainStatus: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            borderBottomWidth: 1,
            borderColor: '#FFF',
            borderRadius: 5,
            paddingVertical: 5,
            flexGrow: 1,
      },
      statusImage: {
            height: 60,
            width: 60,
      },
      mainText: {
            fontSize: 30,
            fontFamily: 'sans-serif',
            color: '#FFF',
      },
      description: {
            alignItems: 'center',
            borderBottomWidth: 1,
            borderColor: '#FFF',
            flexDirection: 'row',
            justifyContent: 'space-between',
      },
      descriptionText: {
            fontSize: 25,
            fontFamily: 'sans-serif',
            color: '#FFF',
            alignSelf: 'center',
            fontStyle: 'italic',
      },
      moreInfo: {
            marginTop: 10,
            marginHorizontal: 5,
      },
      moreInfoText: {
            fontSize: 20,
            fontFamily: 'sans-serif-light',
            color: '#FFF',
            marginTop: 4,
      },
      locationButton: {
            height: 55,
            width: 55,
            borderRadius: 30,
            position: 'absolute',
            backgroundColor: '#EAF0F1',
            bottom: 15,
            right: 10,
            alignItems: 'center',
            justifyContent: 'center',
      },
      creditText: {
            marginVertical: 5,
            color: '#FFF',
            alignSelf: 'center',
      },
});
