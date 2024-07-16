import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Image } from 'react-native';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Header from '../components/header';
import placeholder from '../assets/placeholder.png';
import spinningGearGif from '../assets/gear.gif';
import config from '../config';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const fetchFonts = () => {
  return Font.loadAsync({
    'custom-font': require('../assets/fonts/NicoMoji.ttf'),
  });
};

const ManagerScreen = ({ navigation }) => {
  const [fontLoaded, setFontLoaded] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    profilePicture: placeholder,
    id: '',
  });
  const [status, setStatus] = useState(null);
  const [selectedStation, setSelectedStation] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  useEffect(() => {
    const fetchFontsAsync = async () => {
      await fetchFonts();
      setFontLoaded(true);
      SplashScreen.hideAsync();
    };

    const fetchUserData = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        const name = await AsyncStorage.getItem('name');
        if (name !== null && userId !== null) {
          setUserData({
            ...userData,
            name: name,
            id: userId,
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
    fetchFontsAsync();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          const statusResponse = await fetch(`${config.apiURL}/status`);
          const statusData = await statusResponse.json();
          setStatus(statusData);
          console.log('Fetched initial status:', statusData);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

      fetchData();

      const intervalId = setInterval(fetchData, 1000); // Poll every 5 seconds

      return () => clearInterval(intervalId); // Clean up on component unmount
    }, [])
  );
  

  if (!fontLoaded) {
    return null;
  }

  const handleStationClick = (station) => {
    if (!status || !status.isConnected) {
      setErrorMessage('Cannot travel to station. Robot is not connected.');
      setShowErrorPopup(true);
      return;
    }
    setSelectedStation(station);
    setShowPrompt(true);
  };

  const handleConfirmTravel = async () => {
    if (status.currentStation === selectedStation) {
      setErrorMessage('Robot is already at the selected station.');
      setShowErrorPopup(true);
      setShowPrompt(false);
      return;
    }

    try {
      await fetch(`${config.apiURL}/status/updateStation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentStation: status.currentStation,
          isTraveling: true,
          destinationStation: selectedStation,
        }),
      });
    } catch (error) {
      console.error('Error updating status:', error);
    }

    setShowPrompt(false);
  };

  const handleEmergencyStop = async () => {
    try {
      await fetch(`${config.apiURL}/status/updateTraveling`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isTraveling: false,
          destinationStation: null,
          currentStation: 'Unknown',
        }),
      });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStationLetter = (station) => {
    if (station === 'Unknown') {
      return '?';
    }
    return station.split(' ')[1];
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header
        userName={userData.name}
        profilePicture={userData.profilePicture}
        logo={require('../assets/logo.jpg')}
        navigation={navigation}
      />
      <View style={styles.content}>
        <View style={styles.navigationButtons}>
          <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Tools')}>
            <Text style={styles.navButtonText}>Tools/Jobs</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('History')}>
            <Text style={styles.navButtonText}>History</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionTitle}>Current Status</Text>
        {status && (
          <>
            <View style={styles.statusContainer}>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Connected:</Text>
                <View style={[styles.statusIndicator, { backgroundColor: status.isConnected ? '#28a745' : '#dc3545' }]} />
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Updated:</Text>
                <Text style={styles.statusValue}>{new Date(status.lastChecked).toLocaleString()}</Text>
              </View>
            </View>
            <View style={styles.travelContainer}>
              <View style={[styles.travelColumn, !status.isTraveling && styles.centeredColumn]}>
                {!status.isTraveling && (
                  <View style={styles.centeredContent}>
                    <Text style={styles.travelLabel}>{'Currently at'}</Text>
                  </View>
                )}
                {status.isTraveling && (
                  <View style={styles.centeredContent}>
                    <Text style={styles.travelLabel}>{'Traveling to...'}</Text>
                    <Image source={spinningGearGif} style={styles.gearGif} />
                  </View>
                )}
              </View>
              <View style={styles.stationColumn}>
                <View style={[styles.stationCircle, { backgroundColor: status.isTraveling ? '#28a745' : '#dc3545' }]}>
                  <Text style={styles.stationText}>
                    {getStationLetter(status.isTraveling ? status.destinationStation : status.currentStation)}
                  </Text>
                </View>
              </View>
            </View>
            {!status.isTraveling && (
              <>
                <Text style={styles.travelTitle}>Travel to a Station?</Text>
                <View style={styles.travelButtonsContainer}>
                  <TouchableOpacity style={styles.button} onPress={() => handleStationClick('Station A')}>
                    <Text style={styles.buttonText}>A</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.button} onPress={() => handleStationClick('Station B')}>
                    <Text style={styles.buttonText}>B</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.button} onPress={() => handleStationClick('Station C')}>
                    <Text style={styles.buttonText}>C</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
            {status.isTraveling && (
              <View style={styles.emergencyButtonContainer}>
                <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyStop}>
                  <Text style={styles.emergencyButtonText}>EMERGENCY STOP</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>

      <Modal
        transparent={true}
        visible={showPrompt}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Travel</Text>
            <Text style={styles.modalText}>Travel to {selectedStation}?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowPrompt(false)}
              >
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleConfirmTravel}
              >
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        visible={showErrorPopup}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Error</Text>
            <Text style={styles.modalText}>{errorMessage}</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowErrorPopup(false)}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#00001B',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
  },
  sectionTitle: {
    fontFamily: 'custom-font',
    fontSize: wp('8%'),
    marginTop: hp('2%'),
    marginBottom: hp('2%'),
    textAlign: 'center',
    color: '#fff',
  },
  statusContainer: {
    width: '100%',
    padding: wp('4%'),
    backgroundColor: '#242438',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
    marginBottom: hp('2%'),
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  statusLabel: {
    fontFamily: 'custom-font',
    fontSize: wp('4%'),
    color: '#fff',
  },
  statusValue: {
    fontFamily: 'custom-font',
    fontSize: wp('4%'),
    color: '#fff',
  },
  statusIndicator: {
    width: wp('45%'),
    height: hp('2.5%'),
    borderRadius: 10,
  },
  travelContainer: {
    width: '100%',
    padding: wp('4%'),
    backgroundColor: '#242438',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
    marginBottom: hp('2%'),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  travelColumn: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  centeredColumn: {
    justifyContent: 'center',
  },
  centeredContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  stationColumn: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  travelLabel: {
    fontFamily: 'custom-font',
    fontSize: wp('5%'),
    color: '#fff',
  },
  stationCircle: {
    width: wp('30%'),
    height: wp('30%'),
    borderRadius: wp('15%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  stationText: {
    fontFamily: 'custom-font',
    fontSize: wp('8%'),
    color: '#fff',
  },
  travelTitle: {
    fontFamily: 'custom-font',
    fontSize: wp('5%'),
    color: '#fff',
    marginBottom: hp('2%'),
    textAlign: 'center',
  },
  travelButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: hp('2%'),
  },
  button: {
    backgroundColor: '#242438',
    paddingVertical: hp('2.5%'),
    paddingHorizontal: wp('7%'),
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  buttonText: {
    fontFamily: 'custom-font',
    fontSize: wp('7%'),
    color: '#fff',
  },
  emergencyButtonContainer: {
    marginTop: hp('2%'),
    marginBottom: hp('2%'),
  },
  emergencyButton: {
    backgroundColor: '#dc3545',
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('5%'),
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  emergencyButtonText: {
    fontFamily: 'custom-font',
    fontSize: wp('7%'),
    color: '#fff',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: hp('1%'),
  },
  navButton: {
    backgroundColor: '#242438',
    paddingVertical: hp('2%'),
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
    width: '45%',
  },
  navButtonText: {
    fontFamily: 'custom-font',
    fontSize: wp('4%'),
    color: '#fff',
    textAlign: 'center',
  },
  gearGif: {
    width: wp('20%'),
    height: wp('20%'),
    marginTop: hp('1%'),
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: {
    fontFamily: 'custom-font',
    fontSize: wp('6%'),
    textAlign: 'center',
    marginBottom: 20,
    color: '#dc3545',
  },
  modalText: {
    fontFamily: 'custom-font',
    fontSize: wp('4%'),
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    backgroundColor: '#242438',
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('5%'),
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: wp('4%'),
    fontFamily: 'custom-font',
  },
});

export default ManagerScreen;
