import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import config from '../config';

const fetchFonts = () => {
  return Font.loadAsync({
    'custom-font': require('../assets/fonts/NicoMoji.ttf'),
  });
};

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fontLoaded, setFontLoaded] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchFonts().then(() => {
      setFontLoaded(true);
      SplashScreen.hideAsync();
    });
  }, []);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePasswordComplexity = (password) => {
    return password.length >= 8;
  };

  const handleLogin = async () => {
    const newErrors = {};
    if (!validateEmail(email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!validatePasswordComplexity(password)) {
      newErrors.password = 'Invalid password';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
        try {
          const response = await axios.post(`${config.apiURL}/auth/login`, { email, pass: password });
          const { token, userId } = response.data;
          console.log('Login successful:', token, userId);
          // Save token and userId using AsyncStorage
          await AsyncStorage.setItem('token', token);
          await AsyncStorage.setItem('userId', userId.toString());
          const userResponse = await axios.get(`${config.apiURL}/users/${userId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const user = userResponse.data;
          await AsyncStorage.setItem('name', user.name.toString());
          
          console.log("token stored");
          setEmail('');
          setPassword('');
          navigation.navigate('Manager');
        } catch (error) {
          console.error('Login error:', error.response?.data || error.message);
          setErrors({ ...newErrors, api: 'Invalid email or password' });
        }
    }
  };

  if (!fontLoaded) {
    return null; // Return null until the font is loaded
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Image source={require('../assets/logo.jpg')} style={styles.logo} />
        <Text style={styles.title}>Log In</Text>
        <View style={styles.loginContainer}>
            <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none" // Prevent auto-capitalization
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            <View style={styles.passwordContainer}>
            <TextInput
                style={[styles.input, errors.password && styles.inputError, styles.passwordInput]}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!passwordVisible}
                autoCapitalize="none" // Prevent auto-capitalization
            />
            <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setPasswordVisible(!passwordVisible)}
            >
                <Ionicons
                name={passwordVisible ? "eye-off" : "eye"}
                size={24}
                color="#000"
                />
            </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            {errors.api && <Text style={styles.errorText}>{errors.api}</Text>}
            <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            >
            <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
        </View>
        <TouchableOpacity
        style={styles.link}
        onPress={() => {
          navigation.navigate('Register');
          setEmail('');
          setPassword('');
        }}
        >
        <Text style={styles.linkText}>Create Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
  loginContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#242438',
    borderRadius: 40,
    width: '95%',
    padding: wp('2%'),
    borderWidth: 2,
    borderColor: '#fff',
  },
  title: {
    fontFamily: 'custom-font',
    fontSize: wp('8%'),
    marginBottom: hp('3%'),
    textAlign: 'center',
    color: '#fff',
  },
  input: {
    fontFamily: 'custom-font',
    width: wp('80%'),
    padding: hp('1.5%'),
    marginVertical: hp('1%'),
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  logo: {
    width: wp('30%'), // Increase logo size
    height: undefined,
    aspectRatio: 1, // Keep the aspect ratio
  },
  button: {
    backgroundColor: '#242438', // Button color
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('5%'),
    marginVertical: hp('1%'),
    //marginTop: hp('1%'),
    height: hp('7%'),
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  buttonText: {
    color: '#fff',
    fontSize: wp('5%'),
    fontFamily: 'custom-font',
  },
  link: {
    marginTop: hp('2%'),
  },
  linkText: {
    color: '#fff',
    fontSize: wp('4%'),
    fontFamily: 'custom-font',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: wp('80%'),
    height: hp('7%'),
    marginVertical: hp('1%'),
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  passwordInput: {
    flex: 1,
  },
  eyeIcon: {
    padding: hp('1.5%'),
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    width: wp('80%'),
    color: 'red',
    fontSize: wp('3.5%'),
    marginBottom: hp('1%'),
    fontFamily: 'custom-font',
  },
});

export default LoginScreen;
