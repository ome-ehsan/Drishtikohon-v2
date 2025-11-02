// app/send-money.js - Send money with accessible input
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, Vibration, View } from 'react-native';
import { AppContext } from '../context/AppContext';
import { speak } from '../utils/speech';
import { t } from '../utils/translations';

export default function SendMoneyScreen() {
  const router = useRouter();
  const { language, isScreenReaderEnabled, getBalance } = useContext(AppContext);
  const errorRef = useRef(null);
  
  const [receiverNumber, setReceiverNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [receiverDigitCount, setReceiverDigitCount] = useState(0);
  const [amountDigitCount, setAmountDigitCount] = useState(0);

  // Announce screen on load
  useEffect(() => {
    speak(t('sendMoneyScreen', language), language);
  }, []);

  // Handle receiver number input
  const handleReceiverChange = (text) => {
    const numericText = text.replace(/[^0-9]/g, '');
    setReceiverNumber(numericText);
    setError('');

    if (numericText.length > receiverDigitCount) {
      Vibration.vibrate(30);
      speak(`${t('digitEntered', language)}. ${numericText.length} ${t('digitsEntered', language)}`, language);
    }
    setReceiverDigitCount(numericText.length);
  };

  // Handle amount input
  const handleAmountChange = (text) => {
    const numericText = text.replace(/[^0-9]/g, '');
    setAmount(numericText);
    setError('');

    if (numericText.length > amountDigitCount) {
      Vibration.vibrate(30);
      speak(`${t('digitEntered', language)}. ${numericText.length} ${t('digitsEntered', language)}`, language);
    }
    setAmountDigitCount(numericText.length);
  };

  // Validate and proceed
  const handleConfirmSend = () => {
    if (!receiverNumber || receiverNumber.length < 11) {
      const errorMsg = t('pleaseEnterReceiver', language);
      setError(errorMsg);
      Vibration.vibrate([0, 100, 100, 100]);
      speak(errorMsg, language);
      // Focus error message for TalkBack
      setTimeout(() => {
        if (errorRef.current) {
          errorRef.current.setNativeProps({ accessibilityLiveRegion: 'assertive' });
        }
      }, 100);
      return;
    }

    if (!amount || parseInt(amount) <= 0) {
      const errorMsg = t('pleaseEnterAmount', language);
      setError(errorMsg);
      Vibration.vibrate([0, 100, 100, 100]);
      speak(errorMsg, language);
      // Focus error message for TalkBack
      setTimeout(() => {
        if (errorRef.current) {
          errorRef.current.setNativeProps({ accessibilityLiveRegion: 'assertive' });
        }
      }, 100);
      return;
    }

    const amountValue = parseInt(amount);
    const balance = getBalance();

    if (amountValue > balance) {
      const errorMsg = t('insufficientBalance', language);
      setError(errorMsg);
      Vibration.vibrate([0, 100, 100, 100]);
      speak(errorMsg, language);
      // Focus error message for TalkBack
      setTimeout(() => {
        if (errorRef.current) {
          errorRef.current.setNativeProps({ accessibilityLiveRegion: 'assertive' });
        }
      }, 100);
      return;
    }

    // Proceed to OTP verification
    speak(t('processingTransaction', language), language);

    setTimeout(() => {
      router.push({
        pathname: '/otp-verification',
        params: {
          receiverNumber,
          amount: amountValue.toString(),
        }
      });
    }, 1000);
  };

  // Handle back
  const handleBackPress = () => {
    speak(t('backToDashboard', language), language);
    router.back();
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Title */}
        <Text 
          style={styles.title}
          accessible={true}
          accessibilityLabel={t('sendMoneyScreen', language)}
        >
          {t('sendMoneyScreen', language)}
        </Text>

        {/* Current Balance Display */}
        <View style={styles.balanceInfo}>
          <Text 
            style={styles.balanceLabel}
            accessible={true}
            accessibilityLabel={`${t('yourBalance', language)} ${getBalance()} ${t('taka', language)}`}
          >
            {t('yourBalance', language)}: ৳ {getBalance().toLocaleString()}
          </Text>
        </View>

        {/* Error Message */}
        {error && (
          <Text 
            ref={errorRef}
            style={styles.errorText}
            accessible={true}
            accessibilityLabel={error}
            accessibilityRole="alert"
            accessibilityLiveRegion="assertive"
          >
            {error}
          </Text>
        )}

        {/* Receiver Number Input */}
        <View style={styles.inputContainer}>
          <Text 
            style={styles.inputLabel}
            accessible={false}
            importantForAccessibility="no"
          >
            {t('receiverNumber', language)}
          </Text>
          <TextInput
            style={styles.input}
            value={receiverNumber}
            onChangeText={handleReceiverChange}
            placeholder="01XXXXXXXXX"
            placeholderTextColor="#555555"
            keyboardType="numeric"
            maxLength={11}
            accessible={true}
            accessibilityLabel={t('enterReceiverNumber', language)}
            accessibilityHint="Enter 11 digit mobile number"
            accessibilityRole="none"
          />
          {/* <Text style={styles.helperText}>{receiverNumber.length}/11 digits</Text> */}
        </View>

        {/* Amount Input */}
        <View style={styles.inputContainer}>
          <Text 
            style={styles.inputLabel}
            accessible={false}
            importantForAccessibility="no"
          >
            {t('amount', language)} (৳)
          </Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={handleAmountChange}
            placeholder="0"
            placeholderTextColor="#555555"
            keyboardType="numeric"
            accessible={true}
            accessibilityLabel={t('enterAmount', language)}
            accessibilityHint="Enter amount in taka"
            accessibilityRole="none"
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirmSend}
            accessible={true}
            accessibilityLabel={`${t('confirmAndSend', language)} button`}
            accessibilityRole="button"
            accessibilityHint="Proceed to OTP verification"
          >
            <Text style={styles.confirmButtonText}>{t('confirmAndSend', language)}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            accessible={true}
            accessibilityLabel={`${t('back', language)}`}
            accessibilityRole="button"
          >
            <MaterialCommunityIcons name="arrow-left" size={20} color="#FFFFFF" style={styles.backIcon} accessibilityElementsHidden importantForAccessibility="no" />
            <Text style={styles.backButtonText}>{t('back', language)}</Text>
          </TouchableOpacity>
        </View>

        {/* Test Hint */}
        
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f2027', // same gradient background logic can also be applied
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 24,
  },
  balanceInfo: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    marginBottom: 24,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  errorText: {
    fontSize: 16,
    color: '#FF4C4C',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '700',
  },
  inputContainer: {
    width: '100%',
    maxWidth: 320,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 18,
    color: '#B0C4DE',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 20,
    color: '#FFFFFF',
  },
  helperText: {
    fontSize: 14,
    color: '#A0A0A0',
    marginTop: 6,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 320,
    marginTop: 20,
    gap: 12,
  },
  confirmButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  backIcon: {
    marginRight: 4,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  testHint: {
    fontSize: 12,
    color: '#555555',
    marginTop: 20,
    textAlign: 'center',
  },
});

