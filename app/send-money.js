// app/send-money.js - Send money with accessible input
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useContext, useEffect, useRef, useState } from 'react';
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
            placeholderTextColor="#999999"
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
            placeholderTextColor="#999999"
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
            <MaterialCommunityIcons name="arrow-left" size={24} color="#021d3f" style={styles.backIcon} accessibilityElementsHidden importantForAccessibility="no" />
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
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 24,
  },
  balanceInfo: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF', // Solid White
    borderRadius: 18,
    padding: 24,
    borderWidth: 0,
    // borderColor: 'rgba(255,255,255,0.25)',
    marginBottom: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
  },
  balanceLabel: {
    fontSize: 26,
    color: '#021d3f', // Dark Blue
    fontWeight: '700',
  },
  errorText: {
    fontSize: 26,
    color: '#FF4C4C', // Keep red for error, maybe brighter?
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '700',
    backgroundColor: 'rgba(0,0,0,0.2)', // Add background for readability?
    padding: 10,
    borderRadius: 8,
  },
  inputContainer: {
    width: '100%',
    maxWidth: 340,
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 20,
    color: '#FFFFFF', // Pure White
    marginBottom: 10,
    fontWeight: '600',
  },
  input: {
    width: '100%',
    backgroundColor: '#FFFFFF', // Solid White
    borderRadius: 16,
    borderWidth: 0,
    // borderColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 22,
    color: '#021d3f', // Dark Blue
    fontWeight: '600',
    elevation: 4,
  },
  helperText: {
    fontSize: 14,
    color: '#DDDDDD',
    marginTop: 6,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 340,
    marginTop: 30,
    gap: 16,
  },
  confirmButton: {
    backgroundColor: '#FFFFFF', // Solid White
    borderWidth: 0,
    // borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 18,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  confirmButtonText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#021d3f', // Dark Blue
  },
  backButton: {
    backgroundColor: '#FFFFFF', // Solid White
    borderWidth: 0,
    // borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    elevation: 4,
  },
  backIcon: {
    marginRight: 4,
    // Icon color handled in component prop
  },
  backButtonText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#021d3f', // Dark Blue
  },
  testHint: {
    fontSize: 14,
    color: '#BBBBBB',
    marginTop: 20,
    textAlign: 'center',
  },
});

