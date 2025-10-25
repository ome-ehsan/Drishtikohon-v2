// App.js - Main entry point with navigation and TTS greeting
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import DashboardScreen from './screens/DashboardScreen';
import LoginScreen from './screens/LoginScreen';
import SettingsScreen from './screens/SettingsScreen';
import { speak } from './utils/speech';

const Stack = createNativeStackNavigator();

export default function App() {
  // Play welcome greeting on app start
  useEffect(() => {
    const playWelcomeMessage = async () => {
      // Wait a brief moment for app to fully load
      setTimeout(() => {
        speak('স্বাগতম Drishtikohon এ। Welcome to Drishtikohon', 'bn', {
          pitch: 1.0,
          rate: 0.85, // Slightly slower for clarity
        });
      }, 1000);
    };

    playWelcomeMessage();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false, // clean ui 
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ title: 'Login' }}
        />
        <Stack.Screen 
          name="Dashboard" 
          component={DashboardScreen}
          options={{ title: 'Dashboard' }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{ title: 'Settings' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}