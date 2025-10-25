// app/otp-verification.js - OTP verification with matching login style
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import { Animated, SafeAreaView, StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native';
import { AppContext } from '../context/AppContext';
import { speak } from '../utils/speech';
import { t } from '../utils/translations';

export default function OTPVerificationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { receiverNumber, amount } = params;

  const { 
    language, 
    validateOtp, 
    processTransaction, 
    mockOtp,
    userPhoneNumber 
  } = useContext(AppContext);

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const OTP_LENGTH = 4;

  // Auto-fill OTP after 2 seconds (simulating SMS receive)
  useEffect(() => {
    console.log('OTP verification screen loaded, starting auto-fill process...');
    speak(`${t('otpSentTo', language)} ${userPhoneNumber}`, language);

    const autoFillTimer = setTimeout(() => {
      console.log('Auto-filling OTP:', mockOtp);
      setOtp(mockOtp);
      setIsAutoFilled(true);
      Vibration.vibrate(50);
      
      speak(t('otpAutoFilled', language), language);

      setTimeout(() => {
        console.log('Auto-verifying OTP after auto-fill...');
        handleVerifyOtp(mockOtp);
      }, 1500);
    }, 2000);

    return () => clearTimeout(autoFillTimer);
  }, []);

  // Handle number press
  const handleNumberPress = (number) => {
    if (otp.length < OTP_LENGTH) {
      const newOtp = otp + number;
      setOtp(newOtp);
      setError('');
      
      Vibration.vibrate(30);

      speak(
        `${t('digitEntered', language)}. ${newOtp.length} ${t('digitsEntered', language)}`,
        language
      );

      if (newOtp.length === OTP_LENGTH) {
        setTimeout(() => handleVerifyOtp(newOtp), 500);
      }
    }
  };

  // Handle backspace
  const handleBackspace = () => {
    if (otp.length > 0) {
      const newOtp = otp.slice(0, -1);
      setOtp(newOtp);
      setError('');
      
      Vibration.vibrate(30);
      speak(
        `${t('digitRemoved', language)}. ${newOtp.length} ${t('digitsRemaining', language)}`,
        language
      );
    }
  };

  // Verify OTP and process transaction
  const handleVerifyOtp = (otpToVerify) => {
    console.log('Verifying OTP:', otpToVerify);
    if (validateOtp(otpToVerify)) {
      console.log('OTP is valid, processing transaction...');
      const result = processTransaction(receiverNumber, parseInt(amount));
      console.log('Transaction result:', result);

      if (result.success) {
        console.log('Transaction successful, announcing success message...');
        Vibration.vibrate([0, 50, 50, 50]);
        
        const successMessage = `${t('transactionSuccessful', language)}. ${t('youSent', language)} ${amount} ${t('taka', language)}`;
        console.log('Success message:', successMessage);
        speak(successMessage, language, { rate: 0.85 });
        
        setTimeout(() => {
          console.log('Navigating to dashboard...');
          router.replace('/dashboard');
        }, 3000);

      } else {
        console.log('Transaction failed:', result.error);
        setError(t(result.error, language));
        setOtp('');
        Vibration.vibrate([0, 100, 100, 100]);
        speak(t(result.error, language), language);
      }
    } else {
      console.log('Invalid OTP');
      setError(t('invalidOtp', language));
      setOtp('');
      Vibration.vibrate([0, 100, 100, 100]);
      speak(t('invalidOtp', language), language);
    }
  };

  // Resend OTP
  const handleResendOtp = () => {
    setOtp('');
    setError('');
    setIsAutoFilled(false);

    speak(t('otpResent', language), language);

    setTimeout(() => {
      setOtp(mockOtp);
      setIsAutoFilled(true);
      Vibration.vibrate(50);
      speak(t('otpAutoFilled', language), language);
    }, 2000);
  };

  // Animated Keypad Button Component
  const KeyButton = ({ label, icon, onPress, accessibilityLabel, hint, invisible }) => {
    const scale = new Animated.Value(1);
    const onPressIn = () =>
      Animated.spring(scale, { toValue: 0.93, useNativeDriver: true }).start();
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
              color="#FFFFFF"
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
            <Text
              style={styles.title}
              accessible={true}
              accessibilityLabel={t('otpVerification', language)}
            >
              {t('otpVerification', language)}
            </Text>
            
            {/* Transaction Info */}
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>
                {t('sendMoneyScreen', language)}
              </Text>
              <Text style={styles.infoAmount}>
                ৳ {parseInt(amount).toLocaleString()}
              </Text>
              <Text style={styles.infoReceiver}>
                {t('to', language)}: {receiverNumber}
              </Text>
            </View>

            <Text
              style={styles.subtitle}
              accessible={true}
              accessibilityLabel={t('enterOtp', language)}
            >
              {t('enterOtp', language)}
            </Text>

            {/* Auto-fill indicator */}
            {isAutoFilled && (
              <Text 
                style={styles.autoFillText}
                accessible={true}
                accessibilityLabel={t('otpAutoFilled', language)}
              >
                ✓ {t('otpAutoFilled', language)}
              </Text>
            )}
          </View>

          {/* Error Message */}
          {error ? (
            <Text
              style={styles.errorText}
              accessible={true}
              accessibilityRole="alert"
            >
              {error}
            </Text>
          ) : null}

          {/* OTP Display */}
          <View style={styles.otpDisplay}>
            {[...Array(OTP_LENGTH)].map((_, index) => (
              <View
                key={index}
                style={[styles.otpDot, index < otp.length && styles.otpDotFilled]}
                accessible={false}
              />
            ))}
          </View>

          {/* Numeric Keypad */}
          <View style={styles.keypadContainer}>
            <View style={styles.keypadRow}>
              <KeyButton
                label={1}
                onPress={() => handleNumberPress('1')}
                accessibilityLabel={`${t('number', language)} 1`}
                hint={t('enterOtp', language)}
              />
              <KeyButton
                label={2}
                onPress={() => handleNumberPress('2')}
                accessibilityLabel={`${t('number', language)} 2`}
                hint={t('enterOtp', language)}
              />
              <KeyButton
                label={3}
                onPress={() => handleNumberPress('3')}
                accessibilityLabel={`${t('number', language)} 3`}
                hint={t('enterOtp', language)}
              />
            </View>

            <View style={styles.keypadRow}>
              <KeyButton
                label={4}
                onPress={() => handleNumberPress('4')}
                accessibilityLabel={`${t('number', language)} 4`}
                hint={t('enterOtp', language)}
              />
              <KeyButton
                label={5}
                onPress={() => handleNumberPress('5')}
                accessibilityLabel={`${t('number', language)} 5`}
                hint={t('enterOtp', language)}
              />
              <KeyButton
                label={6}
                onPress={() => handleNumberPress('6')}
                accessibilityLabel={`${t('number', language)} 6`}
                hint={t('enterOtp', language)}
              />
            </View>

            <View style={styles.keypadRow}>
              <KeyButton
                label={7}
                onPress={() => handleNumberPress('7')}
                accessibilityLabel={`${t('number', language)} 7`}
                hint={t('enterOtp', language)}
              />
              <KeyButton
                label={8}
                onPress={() => handleNumberPress('8')}
                accessibilityLabel={`${t('number', language)} 8`}
                hint={t('enterOtp', language)}
              />
              <KeyButton
                label={9}
                onPress={() => handleNumberPress('9')}
                accessibilityLabel={`${t('number', language)} 9`}
                hint={t('enterOtp', language)}
              />
            </View>

            <View style={styles.keypadRow}>
              <KeyButton
                icon="refresh"
                onPress={handleResendOtp}
                accessibilityLabel={t('resendOtp', language)}
                hint="Resend OTP code"
              />
              <KeyButton
                label={0}
                onPress={() => handleNumberPress('0')}
                accessibilityLabel={`${t('number', language)} 0`}
                hint={t('enterOtp', language)}
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
              accessibilityLabel="OTP will auto-fill from SMS"
            >
              {language === 'en' 
                ? 'OTP will auto-fill from SMS' 
                : 'ওটিপি এসএমএস থেকে স্বয়ংক্রিয়ভাবে পূরণ হবে'}
            </Text>

            <Text style={styles.testHint}>Test OTP: {mockOtp}</Text>
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
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 13,
    color: '#B0C4DE',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  infoAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  infoReceiver: {
    fontSize: 14,
    color: '#B0C4DE',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#B0C4DE',
    marginTop: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  autoFillText: {
    fontSize: 14,
    color: '#4ADE80',
    marginTop: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  errorText: {
    fontSize: 16,
    color: '#FF4C4C',
    textAlign: 'center',
    fontWeight: '700',
    marginTop: -10,
  },
  otpDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginVertical: 20,
  },
  otpDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
  },
  otpDotFilled: {
    backgroundColor: '#FFFFFF',
  },
  keypadContainer: {
    alignItems: 'center',
    gap: 12,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  keyButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  keyButtonText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  helpText: {
    fontSize: 13,
    color: '#A0A0A0',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  testHint: {
    fontSize: 12,
    color: '#555555',
  },
});