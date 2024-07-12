import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Header from '../components/header';
import placeholder from '../assets/placeholder.png';
import config from '../config';
import { initializeEventSource, closeEventSource } from '../utilities/eventSourceManager';

const fetchFonts = () => {
  return Font.loadAsync({
    'custom-font': require('../assets/fonts/NicoMoji.ttf'),
  });
};

const ToolsScreen = ({ navigation }) => {
  const [fontLoaded, setFontLoaded] = useState(false);
  const [userData, setUserData] = useState({
    name: 'John Doe',
    profilePicture: placeholder,
  });
  const [tools, setTools] = useState([]);

  useEffect(() => {
    const fetchFontsAsync = async () => {
      await fetchFonts();
      setFontLoaded(true);
      SplashScreen.hideAsync();
    };

    fetchFontsAsync();
  }, []);

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await fetch(`${config.apiURL}/tools`);
        const toolsData = await response.json();
        setTools(toolsData);
      } catch (error) {
        console.error('Error fetching tools:', error);
      }
    };

    fetchTools();

    const handlers = {
      tools: (data) => {
        setTools(data);
      },
      error: (error) => {
        console.error('EventSource error:', error);
      },
    };

    initializeEventSource(`${config.apiURL}/stream`, handlers);

    return () => {
      closeEventSource();
    };
  }, []);

  if (!fontLoaded) {
    return null;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header 
        userName={userData.name}
        profilePicture={userData.profilePicture} 
        logo={require('../assets/logo.jpg')}
        navigation={navigation}
      />
      <View style={styles.content}>
        <Text style={styles.title}>Tools/Jobs</Text>
        {tools.map((tool, index) => (
          <View key={index} style={styles.toolItem}>
            <Text style={styles.toolText}>{tool.name}</Text>
            <Text style={styles.toolText}>{tool.status}</Text>
          </View>
        ))}
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
  title: {
    fontFamily: 'custom-font',
    fontSize: wp('8%'),
    marginBottom: hp('3%'),
    textAlign: 'center',
    color: '#fff',
  },
  toolItem: {
    width: '90%',
    padding: wp('4%'),
    marginBottom: hp('2%'),
    backgroundColor: '#242438',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fff',
  },
  toolText: {
    fontFamily: 'custom-font',
    fontSize: wp('4%'),
    color: '#fff',
  },
});

export default ToolsScreen;
