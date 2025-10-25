import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native';
import { AppContext } from '../context/AppContext';
import { speak } from '../utils/speech';
import { t } from '../utils/translations';

export default function RegisterScreen() {
  const router = useRouter();
  const { language, mockOtp, completeRegistration, voiceRate } = useContext(AppContext);

  const [phone, setPhone] = useState('');
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');
  const [otp, setOtp] = useState('');
  const [otpAutoFilled, setOtpAutoFilled] = useState(false);

  const PHONE_LENGTH = 11;
  const OTP_LENGTH = 4;

  useEffect(() => {
    speak(t('registration', language), language);
  }, []);

  // Animated Keypad Button
  const KeyButton = ({ label, onPress, accessibilityLabel }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const onPressIn = () => Animated.spring(scale, { toValue: 0.93, useNativeDriver: true }).start();
    const onPressOut = () => Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }).start();
    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          accessible={true}
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
          style={styles.keyButton}
        >
          <Text style={styles.keyButtonText}>{label}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const handlePhoneDigit = (digit) => {
    if (otp.length > 0) return; // prevent input during OTP stage
    if (phone.length < PHONE_LENGTH) {
      const newVal = phone + digit;
      setPhone(newVal);
      setError('');
      Vibration.vibrate(50);
      speak(`${t('digitEntered', language)}. ${newVal.length} ${t('digitsEntered', language)}`, language, { rate: voiceRate });
    }
  };

  const handleBackspace = () => {
    if (otp.length > 0) {
      if (otp.length === 0) return;
      const newOtp = otp.slice(0, -1);
      setOtp(newOtp);
      Vibration.vibrate(50);
      speak(`${t('digitRemoved', language)}. ${newOtp.length} ${t('digitsRemaining', language)}`, language, { rate: voiceRate });
      return;
    }
    if (phone.length > 0) {
      const newVal = phone.slice(0, -1);
      setPhone(newVal);
      Vibration.vibrate(50);
      speak(`${t('digitRemoved', language)}. ${newVal.length} ${t('digitsRemaining', language)}`, language, { rate: voiceRate });
    }
  };

  const sendOtp = () => {
    if (phone.length < 10) {
      setError(t('enterPhoneNumber', language));
      return;
    }
    setInfo(t('sendingOtp', language));
    speak(`${t('sendingOtp', language)}. ${t('otpWillAutofill', language)}`, language);

    // After 3 seconds, auto-fill OTP if user hasn't entered anything
    setTimeout(() => {
      if (otp.length === 0) {
        setOtp(mockOtp);
        setOtpAutoFilled(true);
        Vibration.vibrate(50);
        speak(t('otpAutoFilled', language), language);

        // Simulate verification automatically
        setTimeout(() => verifyOtp(mockOtp), 800);
      }
    }, 3000);
  };

  const handleOtpDigit = (digit) => {
    if (otp.length < OTP_LENGTH) {
      const newOtp = otp + digit;
      setOtp(newOtp);
      Vibration.vibrate(50);
      speak(`${t('digitEntered', language)}. ${newOtp.length} ${t('digitsEntered', language)}`, language, { rate: voiceRate });
      if (newOtp.length === OTP_LENGTH) setTimeout(() => verifyOtp(newOtp), 500);
    }
  };

  const verifyOtp = async (code) => {
    // In mock flow, accept any 4-digit code
    if (code && code.length === 4) {
      const ok = await completeRegistration();
      if (ok) {
        speak(t('registrationSuccessful', language), language);
        setTimeout(() => router.replace('/setup-pin'), 800);
      }
    } else {
      setError(t('invalidOtp', language));
      setOtp('');
    }
  };

  const renderRow = (digits) => (
    <View style={styles.keypadRow}>
      {digits.map((d) => (
        <KeyButton
          key={d}
          label={d}
          onPress={() => (otp.length > 0 ? handleOtpDigit(String(d)) : handlePhoneDigit(String(d)))}
          accessibilityLabel={`${t('number', language)} ${d}`}
        />
      ))}
    </View>
  );

  return (
    <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title} accessible={true} accessibilityLabel={t('registration', language)}>
          {t('registration', language)}
        </Text>
        <Text style={styles.subtitle} accessibilityLabel={t('enterPhoneNumber', language)}>
          {t('enterPhoneNumber', language)}
        </Text>
      </View>

      {info ? (
        <Text style={styles.infoText} accessibilityRole="alert">{info}</Text>
      ) : null}
      {error ? (
        <Text style={styles.errorText} accessibilityRole="alert">{error}</Text>
      ) : null}

      {/* Phone/OTP dots */}
      <View style={styles.pinDisplay}>
        {[...Array(otp.length > 0 ? OTP_LENGTH : PHONE_LENGTH)].map((_, i) => (
          <View
            key={i}
            style={[styles.pinDot, (otp.length > 0 ? i < otp.length : i < phone.length) && styles.pinDotFilled]}
          />
        ))}
      </View>

      {/* Keypad */}
      <View style={styles.keypadContainer}>
        {renderRow([1, 2, 3])}
        {renderRow([4, 5, 6])}
        {renderRow([7, 8, 9])}
        <View style={styles.keypadRow}>
          <KeyButton label={"↻"} onPress={() => { setOtp(''); setOtpAutoFilled(false); setInfo(''); }} accessibilityLabel={t('resendOtp', language)} />
          <KeyButton label={0} onPress={() => (otp.length > 0 ? handleOtpDigit('0') : handlePhoneDigit('0'))} accessibilityLabel={`${t('number', language)} 0`} />
          <KeyButton label={"←"} onPress={handleBackspace} accessibilityLabel={t('backspace', language)} />
        </View>
      </View>

      {/* Send OTP button appears after sufficient phone digits and before OTP entry */}
      {otp.length === 0 && phone.length >= 10 && (
        <TouchableOpacity style={styles.sendButton} onPress={sendOtp} accessibilityRole="button">
          <Text style={styles.sendButtonText}>{t('verifyOtp', language)}</Text>
        </TouchableOpacity>
      )}

      {otpAutoFilled && (
        <Text style={styles.autoFillText}>✓ {t('otpAutoFilled', language)}</Text>
      )}

      <Text style={styles.testHint}>Test OTP: {mockOtp}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  headerContainer: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 36, fontWeight: '900', color: '#FFFFFF', letterSpacing: 2, textTransform: 'uppercase' },
  subtitle: { fontSize: 16, color: '#B0C4DE', marginTop: 8, textAlign: 'center', letterSpacing: 0.5 },
  infoText: { fontSize: 14, color: '#A0A0A0', textAlign: 'center', marginBottom: 8 },
  errorText: { fontSize: 16, color: '#FF4C4C', textAlign: 'center', fontWeight: '700', marginBottom: 8 },
  pinDisplay: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginVertical: 16 },
  pinDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#FFFFFF', backgroundColor: 'transparent' },
  pinDotFilled: { backgroundColor: '#FFFFFF' },
  keypadContainer: { alignItems: 'center', gap: 12 },
  keypadRow: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  keyButton: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center' },
  keyButtonText: { fontSize: 28, fontWeight: '700', color: '#FFFFFF' },
  autoFillText: { fontSize: 14, color: '#44FF44', textAlign: 'center', marginTop: 8 },
  sendButton: { marginTop: 16, alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.12)', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, borderColor: 'rgba(255,255,255,0.25)', borderWidth: 1 },
  sendButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  testHint: { fontSize: 12, color: '#555555', textAlign: 'center', marginTop: 10 },
});


