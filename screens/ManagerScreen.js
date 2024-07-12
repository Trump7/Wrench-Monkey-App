import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import axios from 'axios';
import config from '../config';
import Header from '../components/header';
import placeholder from '../assets/placeholder.png';

const fetchFonts = () => {
  return Font.loadAsync({
    'custom-font': require('../assets/fonts/NicoMoji.ttf'),
  });
};

const ManagerScreen = ({ navigation }) => {
  const [fontLoaded, setFontLoaded] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    fetchFonts().then(() => {
      setFontLoaded(true);
      SplashScreen.hideAsync();
    });

    const fetchUserData = async () => {
      const token = await AsyncStorage.getItem('token');
      try {
        const response = await axios.get(`${config.apiURL}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Use default data for testing
        setUserData({
          name: 'John Doe',
          profilePicture: placeholder, // Use local placeholder image
        });
      }
    };

    fetchUserData();
  }, []);

  if (!fontLoaded) {
    return null; // Return null until the font is loaded
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {userData && (
        <Header 
          userName={userData.name}
          profilePicture={userData.profilePicture} // Use local placeholder image
          logo={require('../assets/logo.jpg')}
          navigation={navigation}
        />
      )}
      <View style={styles.content}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Tools')}>
            <Text style={styles.buttonText}>Tools/Jobs</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('History')}>
            <Text style={styles.buttonText}>History</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.statusContainer}>
          <Text style={styles.statusHeader}>Robot Status</Text>
          {/* Add status information here */}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#00001B', // Background color
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: '1%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: hp('2%'),
  },
  button: {
    backgroundColor: '#242438', // Button color
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('5%'),
    borderRadius: 20,
    alignItems: 'center',
    width: wp('45%'),
    borderWidth: 2,
    borderColor: '#fff',
  },
  buttonText: {
    color: '#fff',
    fontSize: wp('4%'),
    fontFamily: 'custom-font',
  },
  statusContainer: {
    backgroundColor: '#242438',
    borderRadius: 40,
    width: '95%',
    padding: wp('5%'),
    borderWidth: 2,
    borderColor: '#fff',
  },
  statusHeader: {
    fontFamily: 'custom-font',
    fontSize: wp('5%'),
    color: '#fff',
    marginBottom: hp('5%'),
    textAlign: 'center',
  },
  title: {
    fontFamily: 'custom-font',
    fontSize: wp('8%'),
    marginBottom: hp('3%'),
    textAlign: 'center',
    color: '#fff',
  },
  userInfo: {
    marginBottom: hp('3%'),
    alignItems: 'center',
  },
  userText: {
    fontFamily: 'custom-font',
    fontSize: wp('4%'),
    color: '#fff',
    marginBottom: hp('1%'),
  },
});

export default ManagerScreen;
