import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { Animated, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native';
import { AppContext } from '../context/AppContext';
import { playToneThenSpeak, stopAllAudio } from '../utils/audio';
import { registerInteraction, speak } from '../utils/speech';
import { t } from '../utils/translations';


export default function LoginScreen() {
  const router = useRouter();
  const { language, validatePin, voiceRate, isRegistered, hasPin, maskTalkBackDigits } = useContext(AppContext);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const PIN_LENGTH = 4;

  // Redirect to registration if first-time user
  useEffect(() => {
    if (isRegistered === null) return; // wait until loaded
    if (isRegistered === false) {
      router.replace('/register');
    } else if (isRegistered === true && !hasPin) {
      router.replace('/setup-pin');
    }
  }, [isRegistered, hasPin]);

  // Handle number press with tone + TTS (privacy-safe)
  const handleNumberPress = (number) => {
    if (pin.length < PIN_LENGTH) {
      const newPin = pin + number;
      setPin(newPin);
      setError('');

      Vibration.vibrate(50);
      const message = `${t('digitEntered', language)}. ${newPin.length} ${t('digitsEntered', language)}`;
      playToneThenSpeak(parseInt(number, 10), message, language, voiceRate);

      if (newPin.length === PIN_LENGTH) {
        setTimeout(() => handleSubmit(newPin), 1000);
      }
    }
  };

  // Handle backspace
  const handleBackspace = () => {
    if (pin.length > 0) {
      const newPin = pin.slice(0, -1);
      setPin(newPin);
      setError('');
      Vibration.vibrate(50);
      stopAllAudio();

      speak(`${t('digitRemoved', language)}. ${newPin.length} ${t('digitsRemaining', language)}`, language, {
        rate: voiceRate,
      });
    }
  };

  // Submit PIN (validate and navigate)
  const handleSubmit = (pinToSubmit) => {
    speak(t('pinSubmitted', language), language, {
      rate: voiceRate,
    });

    setTimeout(() => {
      if (validatePin(pinToSubmit)) {
        speak(t('pinAccepted', language), language, {
          rate: voiceRate,
        });
        setTimeout(() => router.replace('/dashboard'), 1500);
      } else {
        setError(t('incorrectPin', language));
        setPin('');
        Vibration.vibrate([0, 100, 100, 100]);
        speak(t('incorrectPin', language), language, {
          rate: voiceRate,
        });
      }
    }, 800);
  };

  // Animated Keypad Button Component
  const KeyButton = ({ label, icon, onPress, accessibilityLabel, hint, invisible }) => {
    const scale = new Animated.Value(1);
    const onPressIn = () => {
      registerInteraction(); // Register button interaction for TalkBack timing
      Animated.spring(scale, { toValue: 0.93, useNativeDriver: true }).start();
    };
    const onPressOut = () =>
      Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }).start();

    if (invisible) {
      return <View style={styles.keyButton} />;
    }

    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          accessible={true}
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
          accessibilityHint={hint}
          style={styles.keyButton}
        >
          {icon ? (
            <MaterialCommunityIcons
              name={icon}
              size={34}
              color="#021d3f"
              accessibilityElementsHidden
              importantForAccessibility="no"
            />
          ) : (
            <Text style={styles.keyButtonText}>{label}</Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <LinearGradient
      colors={['#0f2027', '#203a43', '#2c5364']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Header */}
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
              accessibilityLabel={t('appName', language)}
            >
              {t('appName', language)}
            </Text>
            <Text
              style={styles.subtitle}
              accessible={true}
              accessibilityLabel={t('enterPin', language)}
            >
              {t('enterPin', language)}
            </Text>
          </View>

          {/* Error message */}
          {error ? (
            <Text
              style={styles.errorText}
              accessible={true}
              accessibilityRole="alert"
            >
              {error}
            </Text>
          ) : null}

          {/* PIN Dots */}
          <View style={styles.pinDisplay}>
            {[...Array(PIN_LENGTH)].map((_, index) => (
              <View
                key={index}
                style={[styles.pinDot, index < pin.length && styles.pinDotFilled]}
              />
            ))}
          </View>

          {/* Numeric Keypad */}
          <View style={styles.keypadContainer}>
            <View style={styles.keypadRow}>
              <KeyButton
                label={1}
                onPress={() => handleNumberPress('1')}
                accessibilityLabel={maskTalkBackDigits ? t('digit', language) : `${t('number', language)} 1`}
                hint={t('enterPin', language)}
              />
              <KeyButton
                label={2}
                onPress={() => handleNumberPress('2')}
                accessibilityLabel={maskTalkBackDigits ? t('digit', language) : `${t('number', language)} 2`}
                hint={t('enterPin', language)}
              />
              <KeyButton
                label={3}
                onPress={() => handleNumberPress('3')}
                accessibilityLabel={maskTalkBackDigits ? t('digit', language) : `${t('number', language)} 3`}
                hint={t('enterPin', language)}
              />
            </View>

            <View style={styles.keypadRow}>
              <KeyButton
                label={4}
                onPress={() => handleNumberPress('4')}
                accessibilityLabel={maskTalkBackDigits ? t('digit', language) : `${t('number', language)} 4`}
                hint={t('enterPin', language)}
              />
              <KeyButton
                label={5}
                onPress={() => handleNumberPress('5')}
                accessibilityLabel={maskTalkBackDigits ? t('digit', language) : `${t('number', language)} 5`}
                hint={t('enterPin', language)}
              />
              <KeyButton
                label={6}
                onPress={() => handleNumberPress('6')}
                accessibilityLabel={maskTalkBackDigits ? t('digit', language) : `${t('number', language)} 6`}
                hint={t('enterPin', language)}
              />
            </View>

            <View style={styles.keypadRow}>
              <KeyButton
                label={7}
                onPress={() => handleNumberPress('7')}
                accessibilityLabel={maskTalkBackDigits ? t('digit', language) : `${t('number', language)} 7`}
                hint={t('enterPin', language)}
              />
              <KeyButton
                label={8}
                onPress={() => handleNumberPress('8')}
                accessibilityLabel={maskTalkBackDigits ? t('digit', language) : `${t('number', language)} 8`}
                hint={t('enterPin', language)}
              />
              <KeyButton
                label={9}
                onPress={() => handleNumberPress('9')}
                accessibilityLabel={maskTalkBackDigits ? t('digit', language) : `${t('number', language)} 9`}
                hint={t('enterPin', language)}
              />
            </View>

            <View style={styles.keypadRow}>
              <KeyButton invisible={true} />
              <KeyButton
                label={0}
                onPress={() => handleNumberPress('0')}
                accessibilityLabel={maskTalkBackDigits ? t('digit', language) : `${t('number', language)} 0`}
                hint={t('enterPin', language)}
              />
              <KeyButton
                icon="backspace"
                onPress={handleBackspace}
                accessibilityLabel={t('backspace', language)}
                hint={t('removeDigit', language)}
              />
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text
              style={styles.helpText}
              accessible={true}
              accessibilityLabel={t('securityNote', language)}
            >
              {t('securityNote', language)}
            </Text>

            <Text style={styles.testHint}>Test PIN: 1234</Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 36, // Increased
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 18, // Increased
    color: '#E0E0E0', // Brighter white/grey
    marginTop: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  errorText: {
    fontSize: 18, // Increased
    color: '#FF4C4C', // Keep red but maybe larger
    textAlign: 'center',
    fontWeight: '700',
    marginTop: -10,
    backgroundColor: 'rgba(0,0,0,0.5)', // Add background for readability on gradient?
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  pinDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20, // Increased gap
    marginVertical: 30, // Increased margin
  },
  pinDot: {
    width: 20, // Increased
    height: 20, // Increased
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
  },
  pinDotFilled: {
    backgroundColor: '#FFFFFF',
  },
  keypadContainer: {
    alignItems: 'center',
    gap: 16, // Increased gap
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20, // Increased gap
  },
  keyButton: {
    width: 90, // Increased size
    height: 90, // Increased size
    borderRadius: 45,
    backgroundColor: '#FFFFFF', // Solid White
    borderWidth: 0,
    // borderColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  keyButtonText: {
    fontSize: 34, // Increased
    fontWeight: '700',
    color: '#021d3f', // Dark Blue
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  helpText: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  testHint: {
    fontSize: 14,
    color: '#888888',
  },
});