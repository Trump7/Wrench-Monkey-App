import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import FirstTimeUserScreen from './screens/FirstTimeUserScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ManagerScreen from './screens/ManagerScreen';
import ToolsScreen from './screens/ToolsScreen';
import HistoryScreen from './screens/HistoryScreen';
import UserManagementScreen from './screens/UserManagementScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  const [initialRoute, setInitialRoute] = useState('FirstTimeUser');

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        setInitialRoute('Manager');
      }
    };

    checkToken();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen
          name="FirstTimeUser"
          component={FirstTimeUserScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Manager"
          component={ManagerScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Tools"
          component={ToolsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="UserManagement"
          component={UserManagementScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;