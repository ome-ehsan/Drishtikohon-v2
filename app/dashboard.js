import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppContext } from '../context/AppContext';
import { speak } from '../utils/speech';
import { t } from '../utils/translations';

export default function DashboardScreen() {
  const router = useRouter();
  const { language, isScreenReaderEnabled } = useContext(AppContext);

  useEffect(() => {
    const message = isScreenReaderEnabled
      ? t('youAreOnDashboard', language)
      : `${t('dashboard', language)}. ${t('welcome', language)}`;
    speak(message, language);
  }, []);

  // Navigation Handlers
  const navigateWithSpeech = (screen, messageKey) => {
    speak(t(messageKey, language), language);
    setTimeout(() => router.push(screen), 800);
  };

  // Reusable button component with animation
  const ActionButton = ({ icon, label, onPress, accessibilityLabel, hint }) => {
    const scale = new Animated.Value(1);

    const onPressIn = () => {
      Animated.spring(scale, {
        toValue: 0.96,
        useNativeDriver: true,
      }).start();
    };

    const onPressOut = () => {
      Animated.spring(scale, {
        toValue: 1,
        friction: 3,
        tension: 80,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          accessible={true}
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
          accessibilityHint={hint}
          style={({ pressed }) => [
            styles.button,
            pressed && { backgroundColor: '#2c3e50' },
          ]}
        >
          <MaterialCommunityIcons
            name={icon}
            size={36}
            color="#FFFFFF"
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
          <Text style={styles.buttonText}>{label}</Text>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <LinearGradient
      colors={['#0f2027', '#203a43', '#2c5364']}
      style={styles.container}
    >
      <View style={styles.headerContainer}>
      <Image
  source={require("../assets/images/appIcon2.png")}
  style={{
    width: 40,
    height: 40,
    marginBottom: 8,
    //tintColor: "#FFFFFF", // optional if you want to colorize like the icon
  }}
  accessibilityElementsHidden
/>
        <Text
          style={styles.title}
          accessible={true}
          accessibilityLabel={t('dashboard', language)}
        >
          {t('dashboard', language)}
        </Text>
        <Text
          style={styles.subtitle}
          accessible={false}
          importantForAccessibility="no"
        >
          {t('welcome', language)}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <ActionButton
          icon="wallet"
          label={t('checkBalance', language)}
          onPress={() => navigateWithSpeech('/balance', 'openingBalance')}
          accessibilityLabel={`${t('checkBalance', language)} button`}
          hint="Tap to check your account balance"
        />

        <ActionButton
          icon="send"
          label={t('sendMoney', language)}
          onPress={() => navigateWithSpeech('/send-money', 'openingSendMoney')}
          accessibilityLabel={`${t('sendMoney', language)} button`}
          hint="Tap to send money"
        />

        <ActionButton
          icon="cellphone"
          label={t('mobileRecharge', language)}
          onPress={() => navigateWithSpeech('/mobile-recharge', 'openingMobileRecharge')}
          accessibilityLabel={`${t('mobileRecharge', language)} button`}
          hint="Tap to recharge mobile"
        />

        <ActionButton
          icon="cog"
          label={t('settings', language)}
          onPress={() => navigateWithSpeech('/settings', 'openingSettings')}
          accessibilityLabel={`${t('settings', language)} button`}
          hint="Tap to open settings"
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    marginBottom: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 18,
    color: '#B0C4DE',
    marginTop: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 380,
    gap: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 18,
    paddingVertical: 22,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 16,
    letterSpacing: 1,
  },
});
