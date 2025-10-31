import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native';
import { AppContext } from '../context/AppContext';
import { playToneThenSpeak, stopAllAudio } from '../utils/audio';
import { speak } from '../utils/speech';
import { t } from '../utils/translations';

export default function SetupPinScreen() {
  const router = useRouter();
  const { language, setUserPin, voiceRate, maskTalkBackDigits } = useContext(AppContext);

  const [stage, setStage] = useState('create'); // 'create' | 'confirm'
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const PIN_LENGTH = 4;

  useEffect(() => {
    // TTS prompt per requirement
    speak(t('pinSetupTtsPrompt', language), language, { rate: voiceRate });
  }, []);

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

  const verifyPins = async (createdPin, confirmedPin) => {
    if (createdPin === confirmedPin) {
      const ok = await setUserPin(createdPin);
      if (ok) {
        setError('');
        speak(t('pinSetSuccess', language), language);
        setTimeout(() => router.replace('/'), 800);
      }
    } else {
      setError(t('pinsDoNotMatch', language));
      setPin('');
      setConfirmPin('');
      setStage('create');
      Vibration.vibrate([0, 100, 100, 100]);
    }
  };

  const handleDigit = (d) => {
    setError('');
    if (stage === 'create') {
      if (pin.length < PIN_LENGTH) {
        const newVal = pin + d;
        setPin(newVal);
        Vibration.vibrate(50);
        const msg = `${t('digitEntered', language)}. ${newVal.length} ${t('digitsEntered', language)}`;
        playToneThenSpeak(parseInt(d, 10), msg, language, voiceRate);
        if (newVal.length === PIN_LENGTH) {
          setTimeout(() => setStage('confirm'), 500);
        }
      }
    } else {
      if (confirmPin.length < PIN_LENGTH) {
        const newVal = confirmPin + d;
        setConfirmPin(newVal);
        Vibration.vibrate(50);
        const msg = `${t('digitEntered', language)}. ${newVal.length} ${t('digitsEntered', language)}`;
        playToneThenSpeak(parseInt(d, 10), msg, language, voiceRate);
        if (newVal.length === PIN_LENGTH) {
          setTimeout(() => verifyPins(pin, newVal), 400);
        }
      }
    }
  };

  const handleBackspace = () => {
    if (stage === 'create' && pin.length > 0) {
      const newVal = pin.slice(0, -1);
      setPin(newVal);
      Vibration.vibrate(50);
      stopAllAudio();
      speak(`${t('digitRemoved', language)}. ${newVal.length} ${t('digitsRemaining', language)}`, language, { rate: voiceRate });
    } else if (stage === 'confirm' && confirmPin.length > 0) {
      const newVal = confirmPin.slice(0, -1);
      setConfirmPin(newVal);
      Vibration.vibrate(50);
      stopAllAudio();
      speak(`${t('digitRemoved', language)}. ${newVal.length} ${t('digitsRemaining', language)}`, language, { rate: voiceRate });
    }
  };

  const renderRow = (digits) => (
    <View style={styles.keypadRow}>
      {digits.map((d) => (
        <KeyButton 
          key={d} 
          label={d} 
          onPress={() => handleDigit(String(d))} 
          accessibilityLabel={maskTalkBackDigits ? t('digit', language) : `${t('number', language)} ${d}`} 
        />
      ))}
    </View>
  );

  const currentLength = stage === 'create' ? pin.length : confirmPin.length;

  return (
    <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title} accessible={true} accessibilityLabel={t('setupPin', language)}>
          {t('setupPin', language)}
        </Text>
        <Text style={styles.subtitle} accessibilityLabel={stage === 'create' ? t('createPin', language) : t('confirmPin', language)}>
          {stage === 'create' ? t('createPin', language) : t('confirmPin', language)}
        </Text>
      </View>

      {error ? <Text style={styles.errorText} accessibilityRole="alert">{error}</Text> : null}

      <View style={styles.pinDisplay}>
        {[...Array(PIN_LENGTH)].map((_, i) => (
          <View key={i} style={[styles.pinDot, i < currentLength && styles.pinDotFilled]} />
        ))}
      </View>

      <View style={styles.keypadContainer}>
        {renderRow([1, 2, 3])}
        {renderRow([4, 5, 6])}
        {renderRow([7, 8, 9])}
        <View style={styles.keypadRow}>
          <View style={styles.keyButtonPlaceholder} />
          <KeyButton label={0} onPress={() => handleDigit('0')} accessibilityLabel={maskTalkBackDigits ? t('digit', language) : `${t('number', language)} 0`} />
          <KeyButton label={'←'} onPress={handleBackspace} accessibilityLabel={t('backspace', language)} />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  headerContainer: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 36, fontWeight: '900', color: '#FFFFFF', letterSpacing: 2, textTransform: 'uppercase' },
  subtitle: { fontSize: 16, color: '#B0C4DE', marginTop: 8, textAlign: 'center', letterSpacing: 0.5 },
  errorText: { fontSize: 16, color: '#FF4C4C', textAlign: 'center', fontWeight: '700', marginBottom: 8 },
  pinDisplay: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginVertical: 20 },
  pinDot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#FFFFFF', backgroundColor: 'transparent' },
  pinDotFilled: { backgroundColor: '#FFFFFF' },
  keypadContainer: { alignItems: 'center', gap: 12 },
  keypadRow: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  keyButton: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center' },
  keyButtonText: { fontSize: 28, fontWeight: '700', color: '#FFFFFF' },
  keyButtonPlaceholder: { width: 80, height: 80 },
});