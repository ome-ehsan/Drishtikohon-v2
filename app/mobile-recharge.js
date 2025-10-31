// app/mobile-recharge.js - Mobile Recharge Screen with matching style
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import {
  Animated,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View
} from 'react-native';
import airtel from '../assets/operators/airtel.png';
import banglalink from '../assets/operators/banglalink.png';
import gp from '../assets/operators/gp.png';
import robi from '../assets/operators/robi.png';
import teletalk from '../assets/operators/teletalk.png';
import { AppContext } from '../context/AppContext';
import { playToneThenSpeak, stopAllAudio } from '../utils/audio';
import { registerInteraction, speak } from '../utils/speech';
import { t } from '../utils/translations';

const OPERATORS = [
  { id: 'gp', name: 'grameenphone', logo: gp },
  { id: 'robi', name: 'robi', logo: robi },
  { id: 'banglalink', name: 'banglalink', logo: banglalink },
  { id: 'airtel', name: 'airtel', logo: airtel },
  { id: 'teletalk', name: 'teletalk', logo: teletalk },
];

export default function MobileRechargeScreen() {
  const router = useRouter();
  const { 
    language, 
    isScreenReaderEnabled, 
    validatePin, 
    userBalance,
    processRechargeTransaction,
    maskTalkBackDigits 
  } = useContext(AppContext);
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [showOperatorModal, setShowOperatorModal] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  // Announce screen on load
  useEffect(() => {
    const message = isScreenReaderEnabled
      ? t('mobileRechargeScreen', language)
      : `${t('mobileRechargeScreen', language)}. ${t('enterRechargeNumber', language)}`;
    
    speak(message, language);
  }, []);

  // Back button handler
  const handleBackPress = () => {
    speak(t('back', language), language);
    router.back();
  };

  // Handle phone number input with TTS feedback
  const handlePhoneNumberChange = (text) => {
    registerInteraction(); // Register input interaction for TalkBack timing
    const cleanText = text.replace(/[^0-9]/g, '');
    setPhoneNumber(cleanText);
    setError('');
    
    if (cleanText.length > phoneNumber.length && cleanText.length <= 11) {
      speak(t('digitEntered', language), language);
    }
  };

  // Validate phone number (Bangladesh mobile numbers)
  const isValidPhoneNumber = (number) => {
    const bangladeshMobileRegex = /^01[3-9]\d{8}$/;
    return bangladeshMobileRegex.test(number);
  };

  // Handle operator selection
  const handleOperatorSelect = (operator) => {
    setSelectedOperator(operator);
    setShowOperatorModal(false);
    
    const message = `${t(operator.name, language)} ${t('operatorSelected', language)}`;
    speak(message, language);
  };

  // Handle proceed to operator selection
  const handleProceedToOperator = () => {
    if (!phoneNumber.trim()) {
      setError(t('pleaseEnterReceiver', language));
      speak(t('pleaseEnterReceiver', language), language);
      Vibration.vibrate([0, 100, 100, 100]);
      return;
    }
    
    if (!isValidPhoneNumber(phoneNumber)) {
      setError('Please enter a valid 11-digit mobile number');
      speak('Please enter a valid 11-digit mobile number', language);
      Vibration.vibrate([0, 100, 100, 100]);
      return;
    }
    
    setShowOperatorModal(true);
    speak(t('operatorListOpened', language), language);
  };

  // Handle amount input
  const handleAmountChange = (text) => {
    registerInteraction(); // Register input interaction for TalkBack timing
    const cleanText = text.replace(/[^0-9]/g, '');
    setRechargeAmount(cleanText);
    setError('');
    
    if (cleanText.length > rechargeAmount.length && cleanText.length > 0) {
      speak(t('digitEntered', language), language);
    }
  };

  // Handle confirm recharge
  const handleConfirmRecharge = () => {
    if (!rechargeAmount.trim()) {
      setError(t('pleaseEnterAmount', language));
      speak(t('pleaseEnterAmount', language), language);
      Vibration.vibrate([0, 100, 100, 100]);
      return;
    }
    
    const amount = parseInt(rechargeAmount);
    
    if (isNaN(amount) || amount <= 0) {
      setError(t('amountMustBePositive', language));
      speak(t('amountMustBePositive', language), language);
      Vibration.vibrate([0, 100, 100, 100]);
      return;
    }

    if (amount < 10) {
      setError(language === 'en' ? 'Minimum recharge amount is 10 taka' : 'সর্বনিম্ন রিচার্জ ১০ টাকা');
      speak(language === 'en' ? 'Minimum recharge amount is 10 taka' : 'সর্বনিম্ন রিচার্জ ১০ টাকা', language);
      Vibration.vibrate([0, 100, 100, 100]);
      return;
    }

    if (amount > 1000) {
      setError(language === 'en' ? 'Maximum recharge amount is 1000 taka' : 'সর্বোচ্চ রিচার্জ ১০০০ টাকা');
      speak(language === 'en' ? 'Maximum recharge amount is 1000 taka' : 'সর্বোচ্চ রিচার্জ ১০০০ টাকা', language);
      Vibration.vibrate([0, 100, 100, 100]);
      return;
    }
    
    if (amount > userBalance) {
      setError(t('insufficientBalance', language));
      speak(t('insufficientBalance', language), language);
      Vibration.vibrate([0, 100, 100, 100]);
      return;
    }
    
    setShowPinModal(true);
    speak(t('enterPin', language), language);
  };

  // Animated Keypad Button Component for PIN
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

  // Handle PIN input with tone + TTS
  const handleNumberPress = (number) => {
    if (pin.length < 4) {
      const newPin = pin + number;
      setPin(newPin);
      setError('');
      
      Vibration.vibrate(50);
      
      const message = `${t('digitEntered', language)}. ${newPin.length} ${t('digitsEntered', language)}`;
      playToneThenSpeak(parseInt(number, 10), message, language);
      
      if (newPin.length === 4) {
        setTimeout(() => {
          handlePinSubmit(newPin);
        }, 1000);
      }
    }
  };

  const handleBackspace = () => {
    if (pin.length > 0) {
      const newPin = pin.slice(0, -1);
      setPin(newPin);
      setError('');
      
      Vibration.vibrate(50);
      stopAllAudio();
      speak(
        `${t('digitRemoved', language)}. ${newPin.length} ${t('digitsRemaining', language)}`,
        language
      );
    }
  };

  const handlePinSubmit = (pinToSubmit) => {
    speak(t('pinSubmitted', language), language);
    
    setTimeout(() => {
      if (validatePin(pinToSubmit)) {
        const result = processRechargeTransaction(phoneNumber, parseInt(rechargeAmount), selectedOperator.name);
        
        if (result.success) {
          Vibration.vibrate([0, 50, 50, 50]);
          const successMessage = `${t('rechargeSuccessful', language)}. ${rechargeAmount} ${t('taka', language)} ${t('onOperator', language)} ${t(selectedOperator.name, language)}`;
          speak(successMessage, language);
          
          setTimeout(() => {
            router.replace('/dashboard');
          }, 6000);
        } else {
          setError(result.error);
          speak(t(result.error, language), language);
          setShowPinModal(false);
          setPin('');
          Vibration.vibrate([0, 100, 100, 100]);
        }
      } else {
        setError(t('incorrectPin', language));
        setPin('');
        Vibration.vibrate([0, 100, 100, 100]);
        speak(t('incorrectPin', language), language);
      }
    }, 800);
  };

  // Action Button Component (for Back button)
  const ActionButton = ({ icon, label, onPress, accessibilityLabel, secondary }) => {
    const scale = new Animated.Value(1);
    const onPressIn = () =>
      Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();
    const onPressOut = () =>
      Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }).start();

    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity
          style={[styles.actionButton, secondary && styles.actionButtonSecondary]}
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          accessible={true}
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
        >
          <MaterialCommunityIcons name={icon} size={24} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>{label}</Text>
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
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.headerContainer}>
            <Text 
              style={styles.title}
              accessible={true}
              accessibilityLabel={t('mobileRechargeScreen', language)}
            >
              {t('mobileRechargeScreen', language)}
            </Text>
            <Text style={styles.subtitle}>
              {language === 'en' ? 'Recharge any mobile number' : 'যেকোনো মোবাইল নম্বর রিচার্জ করুন'}
            </Text>
          </View>

          {/* Phone Number Input */}
          <View style={styles.inputContainer}>
            <Text 
              style={styles.label}
              accessible={true}
              accessibilityLabel={t('enterRechargeNumber', language)}
            >
              {t('enterRechargeNumber', language)}
            </Text>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={handlePhoneNumberChange}
              placeholder="01XXXXXXXXX"
              placeholderTextColor="#666666"
              keyboardType="phone-pad"
              maxLength={11}
              accessible={true}
              accessibilityLabel={t('enterRechargeNumber', language)}
              accessibilityHint="Enter 11 digit mobile number"
            />
          </View>

          {/* Error Message */}
          {error && !showPinModal ? (
            <Text 
              style={styles.errorText}
              accessible={true}
              accessibilityLabel={error}
              accessibilityRole="alert"
            >
              {error}
            </Text>
          ) : null}

          {/* Select Operator Button */}
          {!selectedOperator && (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleProceedToOperator}
              accessible={true}
              accessibilityLabel={`${t('selectOperator', language)} button`}
              accessibilityRole="button"
            >
              <Text style={styles.primaryButtonText}>{t('selectOperator', language)}</Text>
            </TouchableOpacity>
          )}

          {/* Selected Operator Display */}
          {selectedOperator && (
            <>
              <View style={styles.selectedOperatorCard}>
                <Image 
                  source={selectedOperator.logo}
                  style={styles.selectedOperatorLogo}
                  accessible={false}
                />
                <Text style={styles.selectedOperatorText}>
                  {t(selectedOperator.name, language)}
                </Text>
                <TouchableOpacity
                  style={styles.changeOperatorButton}
                  onPress={() => {
                    setShowOperatorModal(true);
                    speak(t('operatorListOpened', language), language);
                  }}
                  accessible={true}
                  accessibilityLabel={language === 'en' ? 'Change operator' : 'অপারেটর পরিবর্তন করুন'}
                  accessibilityRole="button"
                >
                  <MaterialCommunityIcons name="pencil" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Amount Input */}
              <View style={styles.inputContainer}>
                <Text 
                  style={styles.label}
                  accessible={true}
                  accessibilityLabel={t('enterRechargeAmount', language)}
                >
                  {t('rechargeAmount', language)}
                </Text>
                <TextInput
                  style={styles.input}
                  value={rechargeAmount}
                  onChangeText={handleAmountChange}
                  placeholder={language === 'en' ? 'Enter amount (10-1000)' : 'পরিমাণ লিখুন (১০-১০০০)'}
                  placeholderTextColor="#666666"
                  keyboardType="numeric"
                  accessible={true}
                  accessibilityLabel={t('enterRechargeAmount', language)}
                  accessibilityHint="Enter recharge amount in taka"
                />
              </View>
              
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleConfirmRecharge}
                accessible={true}
                accessibilityLabel={`${t('confirmRecharge', language)} button`}
                accessibilityRole="button"
              >
                <Text style={styles.primaryButtonText}>{t('confirmRecharge', language)}</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Back Button - Always at the bottom */}
          <View style={styles.backButtonContainer}>
            <ActionButton
              icon="arrow-left"
              label={t('back', language)}
              onPress={handleBackPress}
              accessibilityLabel={`${t('back', language)} button`}
              secondary
            />
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Operator Selection Modal */}
      <Modal
        visible={showOperatorModal}
        transparent={true}
        animationType="slide"
        accessible={true}
        accessibilityLabel={t('operatorSelection', language)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text 
              style={styles.modalTitle}
              accessible={true}
              accessibilityLabel={t('operatorSelection', language)}
            >
              {t('operatorSelection', language)}
            </Text>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {OPERATORS.map((operator) => (
                <Pressable
                  key={operator.id}
                  style={({ pressed }) => [
                    styles.operatorButton,
                    pressed && styles.operatorButtonPressed,
                    selectedOperator?.id === operator.id && styles.operatorButtonSelected
                  ]}
                  onPress={() => handleOperatorSelect(operator)}
                  accessible={true}
                  accessibilityLabel={`${t(operator.name, language)} operator button`}
                  accessibilityRole="button"
                >
                  <Image 
                    source={operator.logo}
                    style={styles.operatorLogo}
                    accessible={false}
                  />
                  <Text style={styles.operatorText}>{t(operator.name, language)}</Text>
                  {selectedOperator?.id === operator.id && (
                    <MaterialCommunityIcons name="check-circle" size={24} color="#4ADE80" />
                  )}
                </Pressable>
              ))}
            </ScrollView>
            
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowOperatorModal(false)}
              accessible={true}
              accessibilityLabel={language === 'en' ? 'Close' : 'বন্ধ করুন'}
              accessibilityRole="button"
            >
              <Text style={styles.closeModalButtonText}>
                {language === 'en' ? 'Close' : 'বন্ধ করুন'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* PIN Modal */}
      <Modal
        visible={showPinModal}
        transparent={true}
        animationType="slide"
        accessible={true}
        accessibilityLabel={t('enterPin', language)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pinModalContent}>
            <Text 
              style={styles.modalTitle}
              accessible={true}
              accessibilityLabel={t('enterPin', language)}
            >
              {t('enterPin', language)}
            </Text>
            
            {/* Transaction Summary */}
            <View style={styles.transactionSummary}>
              <Text style={styles.summaryLabel}>
                {language === 'en' ? 'Recharge Amount' : 'রিচার্জ পরিমাণ'}
              </Text>
              <Text style={styles.summaryAmount}>৳ {rechargeAmount}</Text>
              <Text style={styles.summaryReceiver}>
                {phoneNumber} • {t(selectedOperator?.name || '', language)}
              </Text>
            </View>

            {/* Error in PIN modal */}
            {error && showPinModal ? (
              <Text style={styles.errorText} accessible={true} accessibilityRole="alert">
                {error}
              </Text>
            ) : null}
            
            {/* PIN Display */}
            <View style={styles.pinDisplay}>
              {[0, 1, 2, 3].map((index) => (
                <View
                  key={index}
                  style={[
                    styles.pinDot,
                    pin.length > index && styles.pinDotFilled
                  ]}
                />
              ))}
            </View>
            
            {/* Keypad */}
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
          </View>
        </View>
      </Modal>
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
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#B0C4DE',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 15,
    color: '#B0C4DE',
    marginBottom: 8,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    fontSize: 17,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  selectedOperatorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    gap: 12,
  },
  selectedOperatorLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    resizeMode: 'contain',
  },
  selectedOperatorText: {
    flex: 1,
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  changeOperatorButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  backButtonContainer: {
    marginTop: 20,
    alignItems: 'flex-start',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  actionButtonSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  errorText: {
    fontSize: 15,
    color: '#FF4C4C',
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'rgba(30, 30, 30, 0.95)',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  pinModalContent: {
    backgroundColor: 'rgba(30, 30, 30, 0.95)',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 1,
  },
  operatorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  operatorButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  operatorButtonSelected: {
    borderColor: 'rgba(74, 222, 128, 0.5)',
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
  },
  operatorLogo: {
    width: 40,
    height: 40,
    marginRight: 16,
    borderRadius: 8,
    resizeMode: 'contain',
  },
  operatorText: {
    flex: 1,
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  closeModalButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  closeModalButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  transactionSummary: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#B0C4DE',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  summaryReceiver: {
    fontSize: 14,
    color: '#B0C4DE',
    letterSpacing: 0.5,
  },
  pinDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
    gap: 16,
  },
  pinDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
  },
  pinDotFilled: {
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
});