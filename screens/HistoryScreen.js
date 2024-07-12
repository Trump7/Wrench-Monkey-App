import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, FlatList } from 'react-native';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Header from '../components/header';
import placeholder from '../assets/placeholder.png';
import config from '../config';
import { eventSourceManager } from '../utilities/eventSourceManager';

const fetchFonts = () => {
  return Font.loadAsync({
    'custom-font': require('../assets/fonts/NicoMoji.ttf'),
  });
};

const formatHistory = (historyData) => {
  return historyData.map(item => ({
    ...item,
    toolName: item.toolId.name || 'Unknown Tool',
    userName: item.userId.name || 'Unknown User',
    checkOut: item.checkOut ? new Date(item.checkOut).toLocaleString() : 'N/A',
    checkIn: item.checkIn ? new Date(item.checkIn).toLocaleString() : 'N/A'
  })).sort((a, b) => new Date(b.checkOut) - new Date(a.checkOut));
};

const HistoryScreen = ({ navigation }) => {
  const [fontLoaded, setFontLoaded] = useState(false);
  const [userData, setUserData] = useState({
    name: 'John Doe',
    profilePicture: placeholder,
  });
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchFontsAsync = async () => {
      await fetchFonts();
      setFontLoaded(true);
      SplashScreen.hideAsync();
    };

    fetchFontsAsync();
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${config.apiURL}/history`);
        const historyData = await response.json();
        setHistory(formatHistory(historyData));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchHistory();

    const cleanupEventSource = eventSourceManager(() => {}, () => {}, (data) => {
      setHistory(formatHistory(data));
    });

    return () => {
      cleanupEventSource();
    };
  }, []);

  const handleSearchChange = (text) => {
    setSearchTerm(text);
  };

  const filteredHistory = history.filter(historyItem =>
    (historyItem.toolName || 'Unknown Tool').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (historyItem.userName || 'Unknown User').toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <Text style={styles.title}>History</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search History"
          value={searchTerm}
          onChangeText={handleSearchChange}
        />
        <ScrollView style={styles.scrollableBox}>
          {filteredHistory.map((historyItem, index) => (
            <View key={index} style={styles.historyItem}>
              <Text style={styles.historyText}>Tool: {historyItem.toolName}</Text>
              <Text style={styles.historyText}>User: {historyItem.userName}</Text>
              <Text style={styles.historyText}>Check Out: {historyItem.checkOut}</Text>
              <Text style={styles.historyText}>Check In: {historyItem.checkIn}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
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
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
  },
  title: {
    fontFamily: 'custom-font',
    fontSize: wp('8%'),
    marginTop: hp('2%'),
    marginBottom: hp('2%'),
    textAlign: 'center',
    color: '#fff',
  },
  searchInput: {
    fontFamily: 'custom-font',
    width: '100%',
    padding: hp('1.5%'),
    marginBottom: hp('2%'),
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  scrollableBox: {
    width: '100%',
    height: hp('60%'),  // Adjust the height as needed
  },
  historyItem: {
    width: '100%',
    padding: wp('4%'),
    marginBottom: hp('2%'),
    backgroundColor: '#242438',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fff',
  },
  historyText: {
    fontFamily: 'custom-font',
    fontSize: wp('4%'),
    color: '#fff',
  },
});

export default HistoryScreen;
