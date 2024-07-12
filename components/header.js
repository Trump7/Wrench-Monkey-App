import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

const Header = ({ userName, profilePicture, logo, navigation }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.userInfo} onPress={() => navigation.navigate('UserManagement')}>
        <Image source={profilePicture} style={styles.profilePicture} />
        <View style={styles.textContainer}>
          <Text style={styles.loggedInText}>Logged in as</Text>
          <Text style={styles.userName}>{userName}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Manager')}>
        <Image source={logo} style={styles.logo} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: wp('4%'),
    backgroundColor: '#00001B',
    width: '100%',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePicture: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    backgroundColor: '#fff',
  },
  textContainer: {
    marginLeft: wp('4%'),
  },
  loggedInText: {
    color: '#fff',
    fontSize: wp('4%'),
    fontFamily: 'custom-font',
  },
  userName: {
    color: '#fff',
    fontSize: wp('5%'),
    fontFamily: 'custom-font',
    fontWeight: 'bold',
  },
  logo: {
    width: wp('15%'),
    height: wp('15%'),
  },
});

export default Header;
