import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

SplashScreen.preventAutoHideAsync();

const fetchFonts = () => {
  return Font.loadAsync({
    'custom-font': require('../assets/fonts/NicoMoji.ttf'),
  });
};

const FirstTimeUserScreen = ({ navigation }) => {
  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    fetchFonts().then(() => {
      setFontLoaded(true);
      SplashScreen.hideAsync();
    });
  }, []);

  if (!fontLoaded) {
    return null; // Return null until the font is loaded
  }

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.jpg')} style={styles.logo} />
      <Text style={styles.title}>Welcome new user!</Text>
      <Text style={styles.description}>
        This app is used to communicate with the Wrench Monkey system from anywhere!
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.buttonText}>New user? Sign Up</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp('4%'),
    backgroundColor: '#00001B', // Background color
  },
  logo: {
    width: wp('50%'), // Increase logo size
    height: undefined,
    aspectRatio: 1, // Keep the aspect ratio
    marginBottom: hp('3%'), // Adjust margin to bring buttons up
  },
  title: {
    fontFamily: 'custom-font',
    fontSize: wp('8%'),
    fontWeight: 'bold',
    marginBottom: hp('2%'),
    textAlign: 'center',
    color: '#fff',
  },
  description: {
    fontFamily: 'custom-font',
    fontSize: wp('4%'),
    textAlign: 'center',
    marginBottom: hp('2%'),
    color: '#fff',
  },
  button: {
    backgroundColor: '#242438', // Button color
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('5%'),
    marginVertical: hp('1%'),
    width: wp('80%'),
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: wp('4%'),
    fontFamily: 'custom-font',
  },
});

export default FirstTimeUserScreen;
