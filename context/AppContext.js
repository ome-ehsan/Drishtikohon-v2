// context/AppContext.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { setGlobalVoiceRate, setTalkBackStatus } from '../utils/speech';

export const AppContext = createContext();

// Mock user data
const MOCK_USER = {
  pin: '1234', // Mock PIN for testing
  balance: 1500,
  name: 'User',
  phoneNumber: '01712345678',
};

// Mock OTP
const MOCK_OTP = '1234';

export const AppProvider = ({ children }) => {
  const [language, setLanguage] = useState('en'); // 'en' or 'bn'
  const [isScreenHidden, setIsScreenHidden] = useState(false);
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
  const [userBalance, setUserBalance] = useState(MOCK_USER.balance);
  const [transactions, setTransactions] = useState([]);
  const [voiceRate, setVoiceRate] = useState(0.9); // TTS speed 0.1 - 1.5
  const [isRegistered, setIsRegistered] = useState(null); // null until loaded
  const [savedPin, setSavedPin] = useState(null);
  const [maskTalkBackDigits, setMaskTalkBackDigits] = useState(false); // Mask TalkBack digit announcements

  // Check if TalkBack is enabled
  useEffect(() => {
    const checkScreenReader = async () => {
      const enabled = await AccessibilityInfo.isScreenReaderEnabled();
      console.log('TalkBack status detected:', enabled);
      setIsScreenReaderEnabled(enabled);
      setTalkBackStatus(enabled); // Sync with speech utility
    };

    checkScreenReader();

    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      (enabled) => {
        console.log('TalkBack status changed:', enabled);
        setIsScreenReaderEnabled(enabled);
        setTalkBackStatus(enabled); // Sync with speech utility
      }
    );

    return () => subscription.remove();
  }, []);

  // Load saved language preference
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const saved = await AsyncStorage.getItem('app_language');
        if (saved) setLanguage(saved);
      } catch (error) {
        console.log('Error loading language:', error);
      }
    };
    loadLanguage();
  }, []);

  // Load saved voice rate
  useEffect(() => {
    const loadVoiceRate = async () => {
      try {
        const saved = await AsyncStorage.getItem('voice_rate');
        if (saved) {
          const parsed = parseFloat(saved);
          if (!Number.isNaN(parsed) && parsed > 0 && parsed <= 2) {
            setVoiceRate(parsed);
          }
            setGlobalVoiceRate(parsed);
          }
      } catch (error) {
        console.log('Error loading voice rate:', error);
      }
    };
    loadVoiceRate();
  }, []);

  // Load saved maskTalkBackDigits preference
  useEffect(() => {
    const loadMaskTalkBackDigits = async () => {
      try {
        const saved = await AsyncStorage.getItem('mask_talkback_digits');
        if (saved !== null) {
          setMaskTalkBackDigits(saved === 'true');
        }
      } catch (error) {
        console.log('Error loading maskTalkBackDigits:', error);
      }
    };
    loadMaskTalkBackDigits();
  }, []);

  // Load registration status and PIN
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const reg = await AsyncStorage.getItem('is_registered');
        const pinValue = await AsyncStorage.getItem('user_pin');
        setIsRegistered(reg === 'true');
        setSavedPin(pinValue || null);
      } catch (e) {
        console.log('Error loading auth state:', e);
      }
    };
    loadAuthState();
  }, []);

  // Save language preference
  const changeLanguage = async (newLang) => {
    try {
      await AsyncStorage.setItem('app_language', newLang);
      setLanguage(newLang);
    } catch (error) {
      console.log('Error saving language:', error);
    }
  };

  // Save voice rate preference
  const changeVoiceRate = async (newRate) => {
    try {
      const clamped = Math.max(0.1, Math.min(2, Number(newRate)));
      await AsyncStorage.setItem('voice_rate', String(clamped));
      setVoiceRate(clamped);
      setGlobalVoiceRate(clamped);
    } catch (error) {
      console.log('Error saving voice rate:', error);
    }
  };

  // Save maskTalkBackDigits preference
  const changeMaskTalkBackDigits = async (enabled) => {
    try {
      await AsyncStorage.setItem('mask_talkback_digits', String(enabled));
      setMaskTalkBackDigits(enabled);
    } catch (error) {
      console.log('Error saving maskTalkBackDigits:', error);
    }
  };

  // Validate PIN
  const validatePin = (enteredPin) => {
    if (savedPin) return enteredPin === savedPin;
    return enteredPin === MOCK_USER.pin; // fallback for demo
  };

  // Mark registration complete
  const completeRegistration = async () => {
    try {
      await AsyncStorage.setItem('is_registered', 'true');
      setIsRegistered(true);
      return true;
    } catch (e) {
      console.log('Error saving registration flag:', e);
      return false;
    }
  };

  // Set and persist user PIN
  const setUserPin = async (pin) => {
    try {
      await AsyncStorage.setItem('user_pin', String(pin));
      setSavedPin(String(pin));
      return true;
    } catch (e) {
      console.log('Error saving user pin:', e);
      return false;
    }
  };

  // ✅ Validate OTP
  const validateOtp = (enteredOtp) => {
    return enteredOtp === MOCK_OTP;
  };

  // ✅ Process Transaction
  const processTransaction = (receiverNumber, amount, type = 'send') => {
    if (amount > userBalance) {
      return { success: false, error: 'insufficientBalance' };
    }

    const newBalance = userBalance - amount;
    setUserBalance(newBalance);

    const newTransaction = {
      id: Date.now().toString(),
      receiver: receiverNumber,
      amount,
      date: new Date().toISOString(),
      type: type, // 'send' or 'recharge'
    };
    setTransactions((prev) => [newTransaction, ...prev]);

    return { success: true };
  };

  // ✅ Process Mobile Recharge Transaction
  const processRechargeTransaction = (phoneNumber, amount, operator) => {
    if (amount > userBalance) {
      return { success: false, error: 'insufficientBalance' };
    }

    const newBalance = userBalance - amount;
    setUserBalance(newBalance);

    const newTransaction = {
      id: Date.now().toString(),
      phoneNumber: phoneNumber,
      operator: operator,
      amount,
      date: new Date().toISOString(),
      type: 'recharge',
    };
    setTransactions((prev) => [newTransaction, ...prev]);

    return { success: true };
  };

  // Get balance
  const getBalance = () => {
    return userBalance;
  };

  return (
    <AppContext.Provider
      value={{
        language,
        changeLanguage,
        isScreenHidden,
        setIsScreenHidden,
        isScreenReaderEnabled,
        validatePin,
        validateOtp,       // ✅ added
        processTransaction,// ✅ added
        processRechargeTransaction, // ✅ added
        getBalance,
        userBalance,
        mockOtp: MOCK_OTP, // ✅ added
        userPhoneNumber: MOCK_USER.phoneNumber, // ✅ added
        voiceRate,
        changeVoiceRate,
        // Registration state
        isRegistered,
        completeRegistration,
        setUserPin,
        hasPin: !!savedPin,
        // TalkBack digit masking
        maskTalkBackDigits,
        changeMaskTalkBackDigits,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
