// utils/audio.js
import { Audio } from 'expo-av';
//import { Audio } from 'expo-audio';
import { speak, stopSpeak } from './speech';

let currentSound = null;

const digitToSound = {
  0: require('../assets/sounds/tone0.wav'),
  1: require('../assets/sounds/tone1.mp3'),
  2: require('../assets/sounds/tone2.mp3'),
  3: require('../assets/sounds/tone3.wav'),
  4: require('../assets/sounds/tone4.wav'),
  5: require('../assets/sounds/tone5.wav'),
  6: require('../assets/sounds/tone6.wav'),
  7: require('../assets/sounds/tone7.wav'),
  8: require('../assets/sounds/tone8.wav'),
  9: require('../assets/sounds/tone9.mp3'),
};

export async function stopAllAudio() {
  try {
    stopSpeak();
    if (currentSound) {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
      currentSound = null;
    }
  } catch {}
}

export async function playToneThenSpeak(digit, ttsText, langCode, rateOverride) {
  // Stop any ongoing audio or speech
  await stopAllAudio();

  // Load and play tone for the digit
  try {
    const { sound } = await Audio.Sound.createAsync(digitToSound[digit], {
      shouldPlay: true,
      volume: 1.0,
    });
    currentSound = sound;

    // Wait for tone to finish
    await new Promise((resolve) => {
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          resolve();
        }
      });
    });
  } catch (e) {
    // If tone fails, still proceed to TTS
  } finally {
    if (currentSound) {
      try {
        await currentSound.unloadAsync();
      } catch {}
      currentSound = null;
    }
  }

  // Speak progress feedback after tone (will be blocked by TalkBack check in speak function)
  speak(ttsText, langCode, { rate: rateOverride ?? 0.9 });
}
