import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
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

const ToolsScreen = ({ navigation }) => {
  const [fontLoaded, setFontLoaded] = useState(false);
  const [userData, setUserData] = useState({
    name: 'John Doe',
    profilePicture: placeholder,
  });
  const [tools, setTools] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [status, setStatus] = useState(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState(() => () => {});
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchFontsAsync = async () => {
      await fetchFonts();
      setFontLoaded(true);
      SplashScreen.hideAsync();
    };

    fetchFontsAsync();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [toolsResponse, jobsResponse, statusResponse] = await Promise.all([
          fetch(`${config.apiURL}/tools`),
          fetch(`${config.apiURL}/jobs`),
          fetch(`${config.apiURL}/status`)
        ]);

        const toolsData = await toolsResponse.json();
        const jobsData = await jobsResponse.json();
        const statusData = await statusResponse.json();

        setTools(toolsData);
        setJobs(jobsData);
        setStatus(statusData);
      } catch (error) {
        setErrorMessage('Error fetching data.');
        setErrorVisible(true);
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    const cleanupEventSource = eventSourceManager(
      setStatus,
      setTools,
      setJobs
    );

    return () => {
      cleanupEventSource();
    };
  }, []);

  if (!fontLoaded) {
    return null;
  }

  const handleToolPress = (tool) => {
    if (!status || !status.isConnected) {
      setErrorMessage('Robot is not connected.');
      setErrorVisible(true);
      return;
    }

    if (tool.status === '1') {
      // Prepare for checkout
      setConfirmMessage(<Text>Check out <Text style={styles.highlightText}>{tool.name}</Text>?</Text>);
      setConfirmAction(() => () => confirmToolCheckout(tool));
    } else {
      // Prepare for check-in
      setConfirmMessage(<Text>Check in <Text style={styles.highlightInText}>{tool.name}</Text>?</Text>);
      setConfirmAction(() => () => confirmToolCheckin(tool));
    }    
    setConfirmVisible(true);
  };

  const handleJobPress = (job) => {
    if (!status || !status.isConnected) {
      setErrorMessage('Robot is not connected.');
      setErrorVisible(true);
      return;
    }

    const toolsNotAvailable = job.tools.some(tool => tool.status !== '1');

    if (toolsNotAvailable) {
      setErrorMessage('Tools required for this job are not checked in.');
      setErrorVisible(true);
      return;
    }

    // Prepare for job checkout
    const toolNames = job.tools.map(tool => (
      <Text key={tool._id} style={styles.highlightText}>{tool.name}</Text>
    )).reduce((prev, curr) => [prev, '\n', curr]);
    setConfirmMessage(<Text>Check out Job? {'\n\n'}{toolNames}</Text>);
    setConfirmAction(() => () => confirmJobCheckout(job));
    setConfirmVisible(true);
  };

  const confirmToolCheckout = async (tool) => {
    try {
      await fetch(`${config.apiURL}/tools/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolId: tool._id,
          userId: userData.id,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      setErrorMessage('Error checking out tool.');
      setErrorVisible(true);
      console.error('Error checking out tool:', error);
    }
  };

  const confirmToolCheckin = async (tool) => {
    try {
      await fetch(`${config.apiURL}/tools/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolId: tool._id,
          userId: userData.id,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      setErrorMessage('Error checking in tool.');
      setErrorVisible(true);
      console.error('Error checking in tool:', error);
    }
  };

  const confirmJobCheckout = async (job) => {
    try {
      await fetch(`${config.apiURL}/jobs/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: job._id,
          userId: userData.id,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      setErrorMessage('Error checking out job.');
      setErrorVisible(true);
      console.error('Error checking out job:', error);
    }
  };

  const getToolBackgroundColor = (status) => {
    return status === '1' ? '#28a745' : '#dc3545'; // Green if available, red if not
  };

  return (
    <View style={styles.container}>
      <Header
        userName={userData.name}
        profilePicture={userData.profilePicture}
        logo={require('../assets/logo.jpg')}
        navigation={navigation}
      />
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Tools</Text>
        <View style={styles.toolsContainer}>
          {tools.map((tool, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.toolItem, { backgroundColor: getToolBackgroundColor(tool.status) }]}
              onPress={() => handleToolPress(tool)}
            >
              <Text style={styles.toolText}>{tool.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.sectionTitle}>Jobs</Text>
        <ScrollView style={styles.scrollableBox}>
          {jobs.map((job, index) => (
            <TouchableOpacity key={index} style={styles.jobItem} onPress={() => handleJobPress(job)}>
              <Text style={styles.jobText}>{job.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <Modal
        transparent={true}
        visible={confirmVisible}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>{confirmMessage}</Text>
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
                  confirmAction();
                  setConfirmVisible(false);
                }}
              >
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        visible={errorVisible}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.errorTitle}>Error</Text>
            <Text style={styles.modalText}>{errorMessage}</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setErrorVisible(false)}
              >
                <Text style={styles.modalButtonText}>OK</Text>
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
  toolsContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: hp('2%'),
  },
  toolItem: {
    borderRadius: 10,
    width: '48%',
    padding: wp('4%'),
    marginBottom: hp('2%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  toolText: {
    fontFamily: 'custom-font',
    fontSize: wp('4%'),
    color: '#fff',
  },
  scrollableBox: {
    width: '100%',
    height: hp('50%'), // Adjust the height as needed
  },
  jobItem: {
    backgroundColor: '#242438',
    borderRadius: 10,
    padding: wp('4%'),
    marginBottom: hp('2%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  jobText: {
    fontFamily: 'custom-font',
    fontSize: wp('4%'),
    color: '#fff',
  },
  highlightText: {
    fontFamily: 'custom-font',
    fontSize: wp('4%'),
    color: '#28a745',
  },
  highlightInText: {
    fontFamily: 'custom-font',
    fontSize: wp('4%'),
    color: '#dc3545',
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
  errorTitle: {
    fontFamily: 'custom-font',
    fontSize: wp('5%'),
    color: 'red',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
});

export default ToolsScreen;
