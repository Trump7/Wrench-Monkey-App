import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Header from '../components/header';
import placeholder from '../assets/placeholder.png';

const fetchFonts = () => {
  return Font.loadAsync({
    'custom-font': require('../assets/fonts/NicoMoji.ttf'),
  });
};

const UserManagementScreen = ({ navigation }) => {
  const [fontLoaded, setFontLoaded] = useState(false);
  const [userData, setUserData] = useState({
    name: 'John Doe',
    profilePicture: placeholder,
  });
  const [confirmVisible, setConfirmVisible] = useState(false);

  useEffect(() => {
    const fetchFontsAsync = async () => {
      await fetchFonts();
      setFontLoaded(true);
      SplashScreen.hideAsync();
    };

    fetchFontsAsync();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.navigate('Login');
  };

  if (!fontLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Header
        userName={userData.name}
        profilePicture={userData.profilePicture}
        logo={require('../assets/logo.jpg')}
        navigation={navigation}
      />
      <View style={styles.content}>
        <Text style={styles.noteText}>User data stored on the device will be deleted if you continue to log out.</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setConfirmVisible(true)}
        >
          <Text style={styles.buttonText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      <Modal
        transparent={true}
        visible={confirmVisible}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Logout</Text>
            <Text style={styles.modalText}>Are you sure you want to log out?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setConfirmVisible(false)}
              >
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  handleLogout();
                  setConfirmVisible(false);
                }}
              >
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#00001B',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
  },
  noteText: {
    fontFamily: 'custom-font',
    fontSize: wp('4%'),
    textAlign: 'center',
    color: '#fff',
    marginBottom: hp('2%'),
  },
  button: {
    backgroundColor: '#242438',
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('5%'),
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  buttonText: {
    color: '#fff',
    fontSize: wp('4%'),
    fontFamily: 'custom-font',
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
    textAlign: 'left',
    color: 'red',
    marginBottom: 10,
    width: '100%',
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

export default UserManagementScreen;
