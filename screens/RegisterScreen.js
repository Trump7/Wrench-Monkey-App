import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Modal, Button, Animated, Image } from 'react-native';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import config from '../config';

const fetchFonts = () => {
  return Font.loadAsync({
    'custom-font': require('../assets/fonts/NicoMoji.ttf'),
  });
};

const RegisterScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [robotNumber, setRobotNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fontLoaded, setFontLoaded] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalYPosition] = useState(new Animated.Value(-100));



  useEffect(() => {
    fetchFonts().then(() => {
      setFontLoaded(true);
      SplashScreen.hideAsync();
    }).catch(error => {
      console.error('Error loading fonts', error);
    });
  }, []);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePasswordComplexity = (password) => {
    return password.length >= 8;
  };

  const registerUser = async () => {
    const newErrors = {};

    if (!fullName) newErrors.fullName = 'Full Name is required';
    if (!robotNumber) newErrors.robotNumber = 'Robot Number is required';
    if (!email) newErrors.email = 'Email is required';
    else if (!validateEmail(email)) newErrors.email = 'Invalid email address';
    if (!password) newErrors.password = 'Password is required';
    else if (!validatePasswordComplexity(password)) newErrors.password = 'Password must be at least 8 characters long';
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        await axios.post(`${config.apiURL}/auth/register`, {
          name: fullName,
          email,
          pass: password,
        });
        setErrors({});
        setModalVisible(true);
        Animated.timing(modalYPosition, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
        }).start();
      } catch (error) {
        if (error.response && error.response.status === 400) {
          setErrors({ email: 'Email already in use' });
        } else {
          setErrors({ api: 'Error registering user' });
        }
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
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => {
              setEmail('');
              setPassword('');
              setConfirmPassword('');
              setFullName('');
              setRobotNumber('');
              navigation.navigate('Login')
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
        <Image source={require('../assets/logo.jpg')} style={styles.logo} />
        <Text style={styles.title}>Register</Text>
        <View style={styles.regContainer}>
          <TextInput
            style={[styles.input, errors.fullName && styles.inputError]}
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
          />
          {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
          <TextInput
            style={[styles.input, errors.robotNumber && styles.inputError]}
            placeholder="Robot Number"
            value={robotNumber}
            onChangeText={setRobotNumber}
            keyboardType="numeric"
          />
          {errors.robotNumber && <Text style={styles.errorText}>{errors.robotNumber}</Text>}
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, errors.password && styles.inputError, styles.passwordInput]}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!passwordVisible}
              autoCapitalize="none"
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
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, errors.confirmPassword && styles.inputError, styles.passwordInput]}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!confirmPasswordVisible}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
            >
              <Ionicons
                name={confirmPasswordVisible ? "eye-off" : "eye"}
                size={24}
                color="#000"
              />
            </TouchableOpacity>
          </View>
          {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
          {errors.api && <Text style={styles.errorText}>{errors.api}</Text>}
          <TouchableOpacity
            style={styles.button}
            onPress={registerUser}
          >
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
        <Modal
        animationType="none"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
            setModalVisible(!isModalVisible);
        }}
        >
        <View style={styles.modalOverlay}>
            <Animated.View style={[styles.modalView, { transform: [{ translateY: modalYPosition }] }]}>
            <Text style={styles.modalText}>Registration Successful!</Text>
            <TouchableOpacity
                style={styles.button}
                onPress={() => {
                setModalVisible(false);
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setFullName('');
                setRobotNumber('');
                navigation.navigate('Login');
                }}
            >
                <Text style={styles.buttonText}>Go to Login</Text>
            </TouchableOpacity>
            </Animated.View>
        </View>
        </Modal>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp('4%'),
    backgroundColor: '#00001B', // Background color
  },
  regContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#242438',
    borderRadius: 40,
    width: '95%',
    padding: wp('5%'),
    borderWidth: 2,
    borderColor: '#fff',
  },
  logo: {
    width: wp('30%'), // Increase logo size
    marginTop: hp('7%'),
    height: undefined,
    aspectRatio: 1, // Keep the aspect ratio
  },
  header: {
    width: '100%',
    position: 'absolute',
    top: hp('4%'),
    left: wp('4%'),
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: wp('4%'),
    fontFamily: 'custom-font',
    marginLeft: wp('1%'),
  },
  title: {
    fontFamily: 'custom-font',
    fontSize: wp('8%'),
    //marginTop: hp('10%'), // Add margin to avoid overlap
    marginBottom: hp('3%'),
    textAlign: 'center',
    color: '#fff',
  },
  input: {
    width: wp('80%'),
    padding: hp('1.5%'),
    marginVertical: hp('1%'),
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 20,
    backgroundColor: '#fff',
    fontFamily: 'custom-font',
  },
  inputError: {
    borderColor: 'red',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: wp('80%'),
    marginVertical: hp('1%'),
    height: hp('7%'),
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  passwordInput: {
    flex: 1,
  },
  eyeIcon: {
    padding: hp('1.5%'),
  },
  errorText: {
    width: wp('80%'),
    color: 'red',
    fontSize: wp('3.5%'),
    marginBottom: hp('1%'),
    fontFamily: 'custom-font',
  },
  button: {
    backgroundColor: '#242438', // Button color
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('5%'),
    marginVertical: hp('1%'),
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: wp('90%'),
    //margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontFamily: 'custom-font',
    fontSize: wp('4.5%'),
  }
  
});

export default RegisterScreen;
