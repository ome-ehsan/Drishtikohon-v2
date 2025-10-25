// app/_layout.js - Root layout with context and welcome message
import { Stack } from 'expo-router';
import React, { useContext, useEffect, useRef } from 'react';
import { BackHandler, Platform, View } from 'react-native';
import ViewShot from 'react-native-view-shot';
import MagnifierOverlay from '../components/MagnifierOverlay';
import { AppContext, AppProvider } from '../context/AppContext';
import { MagnifierContext, MagnifierProvider } from '../context/MagnifierContext';
import { speak } from '../utils/speech';

function RootLayout() {
  const rootCaptureRef = useRef(null);
  const { voiceRate } = useContext(AppContext) || { voiceRate: 0.9 };
  // Play welcome greeting on app start
  useEffect(() => {
    setTimeout(() => {
      speak('স্বাগতম দৃষ্টিকোণে। Welcome to Drishtikohon', 'bn', {
        pitch: 1.0,
        rate: voiceRate,
      });
    }, 1000);
  }, []);

  // Three-finger quick tap to exit (Android only). Implemented with RN Responder system
  const gestureStateRef = useRef({
    isTracking: false,
    firstDownAt: 0,
    maxTouches: 0,
  });

  const resetGestureTracking = () => {
    gestureStateRef.current.isTracking = false;
    gestureStateRef.current.firstDownAt = 0;
    gestureStateRef.current.maxTouches = 0;
  };

  const handleStartShouldSetResponder = () => {
    return true; // Capture touches globally
  };

  const handleResponderGrant = (evt) => {
    const touches = evt.nativeEvent.touches ? evt.nativeEvent.touches.length : 1;
    const now = Date.now();
    if (!gestureStateRef.current.isTracking) {
      gestureStateRef.current.isTracking = true;
      gestureStateRef.current.firstDownAt = now;
      gestureStateRef.current.maxTouches = touches;
    } else {
      gestureStateRef.current.maxTouches = Math.max(gestureStateRef.current.maxTouches, touches);
    }
  };

  const handleResponderMove = (evt) => {
    const touches = evt.nativeEvent.touches ? evt.nativeEvent.touches.length : 0;
    gestureStateRef.current.maxTouches = Math.max(gestureStateRef.current.maxTouches, touches);
    // Cancel if more than 3 touches to avoid false positives
    if (gestureStateRef.current.maxTouches > 3) {
      resetGestureTracking();
    }
  };

  const handleResponderRelease = () => {
    if (!gestureStateRef.current.isTracking) return;
    const duration = Date.now() - gestureStateRef.current.firstDownAt;
    const isQuick = duration <= 250;
    const isExactlyThree = gestureStateRef.current.maxTouches === 3;
    resetGestureTracking();
    if (isQuick && isExactlyThree && Platform.OS === 'android') {
      BackHandler.exitApp();
    }
  };

  return (
    <MagnifierContext.Consumer>
      {({ captureRef }) => (
        <View
          style={{ flex: 1 }}
          onStartShouldSetResponder={handleStartShouldSetResponder}
          onResponderGrant={handleResponderGrant}
          onResponderMove={handleResponderMove}
          onResponderRelease={handleResponderRelease}
          onResponderTerminate={resetGestureTracking}
        >
          <ViewShot ref={captureRef} style={{ flex: 1 }} options={{ format: 'png', quality: 0.9 }}>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            />
          </ViewShot>
          <MagnifierOverlay />
        </View>
      )}
    </MagnifierContext.Consumer>
  );
}

export default function Layout() {
  return (
    <AppProvider>
      <MagnifierProvider>
        <RootLayout />
      </MagnifierProvider>
    </AppProvider>
  );
}