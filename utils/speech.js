// utils/speech.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import { AccessibilityInfo } from 'react-native';

let cachedVoiceRate = 0.9;
let isTalkBackEnabled = false;

// Load saved voice rate and check TalkBack status once at module load
(async () => {
  try {
    const saved = await AsyncStorage.getItem('voice_rate');
    if (saved) {
      const parsed = parseFloat(saved);
      if (!Number.isNaN(parsed) && parsed > 0 && parsed <= 2) {
        cachedVoiceRate = parsed;
      }
    }
    
    // Check TalkBack status
    const talkBackStatus = await AccessibilityInfo.isScreenReaderEnabled();
    isTalkBackEnabled = talkBackStatus;
  } catch {}
})();

export const setGlobalVoiceRate = (newRate) => {
  const clamped = Math.max(0.1, Math.min(2, Number(newRate)));
  cachedVoiceRate = clamped;
};

// Function to update TalkBack status from AppContext
export const setTalkBackStatus = (enabled) => {
  isTalkBackEnabled = enabled;
};

export const speak = (text, langCode = 'en', options = {}) => {
  // Don't speak if TalkBack is enabled
  if (isTalkBackEnabled) {
    console.log('TTS blocked: TalkBack is enabled');
    return;
  }
  
  // Cancel previous utterance immediately
  Speech.stop();
  // Pick correct locale
  const language = langCode === 'bn' ? 'bn-BD' : 'en-US';

  // Defaults
  const defaultOptions = {
    language,
    rate: options.rate ?? cachedVoiceRate,
    pitch: 1.0,
  };

  // Ensure explicit rate wins but keep language & pitch defaults
  const { rate, ...rest } = options;
  Speech.speak(text, { ...defaultOptions, ...rest, rate: defaultOptions.rate });
};

/**
 * Stop ongoing speech immediately
 */
export const stopSpeak = () => {
  Speech.stop();
};
