// utils/speech.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import { AccessibilityInfo } from 'react-native';

let cachedVoiceRate = 0.9;
let isTalkBackEnabled = false;

// TTS Queue and timing management for TalkBack compatibility
let ttsQueue = [];
let isTtsQueued = false;
let lastInteractionTime = 0;
let talkBackGracePeriod = 800; // ms to wait after interaction before allowing TTS

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
  // Clear queue if TalkBack is disabled
  if (!enabled) {
    ttsQueue = [];
    isTtsQueued = false;
  }
};

// Function to check if TalkBack is likely speaking
const isLikelyTalkBackSpeaking = () => {
  if (!isTalkBackEnabled) return false;
  const timeSinceLastInteraction = Date.now() - lastInteractionTime;
  return timeSinceLastInteraction < talkBackGracePeriod;
};

// Function to register an interaction (button press, input focus, etc.)
export const registerInteraction = () => {
  lastInteractionTime = Date.now();
};

// Process TTS queue with delay between messages
const processQueue = async () => {
  if (isTtsQueued || ttsQueue.length === 0) return;
  
  isTtsQueued = true;
  
  while (ttsQueue.length > 0) {
    // Wait for TalkBack to finish if needed
    while (isLikelyTalkBackSpeaking()) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const { text, langCode, options } = ttsQueue.shift();
    
    // Final check - if TalkBack is enabled, wait a bit more
    if (isTalkBackEnabled) {
      // Wait for any residual TalkBack announcements
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Actually speak the text
    const language = langCode === 'bn' ? 'bn-BD' : 'en-US';
    const defaultOptions = {
      language,
      rate: options.rate ?? cachedVoiceRate,
      pitch: 1.0,
    };
    
    const { rate, ...rest } = options;
    
    // Calculate estimated speech duration (rough estimate: 150 words per minute at normal rate)
    const words = text.split(/\s+/).length;
    const avgWordsPerMinute = 150;
    const adjustedRate = defaultOptions.rate;
    const estimatedDuration = (words / avgWordsPerMinute) * 60 * 1000 / adjustedRate;
    
    Speech.speak(text, { ...defaultOptions, ...rest, rate: defaultOptions.rate });
    
    // Wait for estimated speech duration + buffer before processing next in queue
    await new Promise(resolve => setTimeout(resolve, estimatedDuration + 200));
  }
  
  isTtsQueued = false;
};

export const speak = (text, langCode = 'en', options = {}) => {
  // Always cancel previous utterance immediately (queue will handle properly)
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
  const finalOptions = { ...defaultOptions, ...rest, rate: defaultOptions.rate };
  
  // If TalkBack is enabled, use queue system
  if (isTalkBackEnabled) {
    // Check if we should wait for TalkBack first
    if (isLikelyTalkBackSpeaking()) {
      console.log('TTS queued: Waiting for TalkBack to finish');
      ttsQueue.push({ text, langCode, options: finalOptions });
      processQueue();
    } else {
      // TalkBack is likely not speaking, speak immediately
      console.log('TTS speaking immediately (TalkBack idle)');
      Speech.speak(text, finalOptions);
    }
  } else {
    // TalkBack is off, speak normally
    Speech.speak(text, finalOptions);
  }
};

/**
 * Stop ongoing speech immediately
 */
export const stopSpeak = () => {
  Speech.stop();
};
