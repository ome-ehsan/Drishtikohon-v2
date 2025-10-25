import React, { useContext, useRef, useState } from 'react';
import { Image, PanResponder, StyleSheet, Text, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { MagnifierContext } from '../context/MagnifierContext';

export default function MagnifierOverlay() {
  const { captureRef: rootRef } = useContext(MagnifierContext);
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [imageUri, setImageUri] = useState(null);
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });
  const lensRadius = 70;
  const zoom = 2.5;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: async (evt) => {
        const { pageX, pageY } = evt.nativeEvent;
        setIsActive(true);
        await captureScreen(pageX, pageY);
      },
      onPanResponderMove: (evt) => {
        const x = evt.nativeEvent.pageX;
        const y = evt.nativeEvent.pageY;
        setPosition({ x, y });
      },
      onPanResponderRelease: () => {
        setIsActive(false);
      },
      onPanResponderTerminate: () => {
        setIsActive(false);
      },
    })
  ).current;

  const captureScreen = async (pageX, pageY) => {
    try {
      if (!rootRef?.current) return;
      
      setPosition({ x: pageX, y: pageY });
      
      const uri = await captureRef(rootRef, {
        format: 'png',
        quality: 0.8,
        result: 'tmpfile',
      });
      
      setImageUri(uri);
    } catch (e) {
      console.warn('Capture failed:', e);
    }
  };

  return (
    <View pointerEvents="box-none" style={styles.container}>
      {/* FAB Button - only visible when not active */}
      {!isActive && (
        <View
          style={styles.fab}
          {...panResponder.panHandlers}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Magnifier tool"
          accessibilityHint="Press and drag to magnify screen content"
        >
          <Text style={styles.fabIcon}>🔍</Text>
          <Text style={styles.fabText}>Magnifier</Text>
        </View>
      )}

      {/* Full-screen gesture layer when active */}
      {isActive && (
        <View
          style={styles.gestureLayer}
          {...panResponder.panHandlers}
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            setScreenSize({ width, height });
          }}
        />
      )}

      {/* Circular magnifying lens */}
      {isActive && imageUri && screenSize.width > 0 && (
        <View
          style={[
            styles.lens,
            {
              width: lensRadius * 3,
              height: lensRadius * 3,
              borderRadius: lensRadius,
              left: position.x - lensRadius,
              top: position.y - lensRadius,
            },
          ]}
          pointerEvents="none"
        >
          {/* The magnified image */}
          <Image
            source={{ uri: imageUri }}
            style={{
              position: 'absolute',
              width: screenSize.width * zoom,
              height: screenSize.height * zoom,
              left: lensRadius - position.x * zoom,
              top: lensRadius - position.y * zoom,
            }}
            resizeMode="stretch"
          />
          {/* Crosshair at center */}
          <View style={styles.crosshair}>
            <View style={styles.crosshairH} />
            <View style={styles.crosshairV} />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    backgroundColor: '#1A1A1A',
    borderColor: '#FFFFFF',
    borderWidth: 2,
    borderRadius: 28,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  fabText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  gestureLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  lens: {
    position: 'absolute',
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: '#000000',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },
  crosshair: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  crosshairH: {
    position: 'absolute',
    width: 20,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  crosshairV: {
    position: 'absolute',
    width: 2,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
});