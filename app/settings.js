import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppContext } from '../context/AppContext';
import { registerInteraction, speak } from '../utils/speech';
import { t } from '../utils/translations';

export default function SettingsScreen() {
  const router = useRouter();
  const { language, changeLanguage, voiceRate, changeVoiceRate } = useContext(AppContext);

  // Announce screen on load
  useEffect(() => {
    speak(t('settingsScreen', language), language, { rate: voiceRate });
  }, []);

  const handleLanguageChange = (newLang) => {
    changeLanguage(newLang);
    const message = `${t('languageChanged', language)} ${
      newLang === 'en' ? t('english', language) : t('bangla', language)
    }`;
    speak(message, newLang, { rate: voiceRate });
  };

  const handleBackPress = () => {
    speak(t('backToDashboard', language), language, { rate: voiceRate });
    router.back();
  };

  // Animated button reusable component
  const OptionButton = ({ icon, label, active, onPress, accessibilityLabel, hint }) => {
    const scale = new Animated.Value(1);

    const onPressIn = () => {
      registerInteraction(); // Register button interaction for TalkBack timing
      Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
    };
    const onPressOut = () =>
      Animated.spring(scale, { toValue: 1, friction: 3, tension: 80, useNativeDriver: true }).start();

    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          accessible={true}
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
          accessibilityHint={hint}
          accessibilityState={{ selected: active }}
          style={({ pressed }) => [
            styles.languageButton,
            active && styles.languageButtonActive,
            pressed && { backgroundColor: 'rgba(255,255,255,0.12)' },
          ]}
        >
          <MaterialCommunityIcons
            name={icon}
            size={32}
            color={active ? '#FFFFFF' : '#AAAAAA'}
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
          <Text
            style={[
              styles.languageButtonText,
              active && styles.languageButtonTextActive,
            ]}
          >
            {label} {active && '✓'}
          </Text>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <LinearGradient
      colors={['#0f2027', '#203a43', '#2c5364']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text
          style={styles.title}
          accessible={true}
          accessibilityLabel={t('settings', language)}
        >
          {t('settings', language)}
        </Text>
        <Text style={styles.subtitle}>{t('selectLanguage', language)}</Text>
      </View>

      {/* Language Options */}
      <View style={styles.languageContainer}>
        <OptionButton
          icon="translate"
          label="English"
          active={language === 'en'}
          onPress={() => handleLanguageChange('en')}
          accessibilityLabel={`${t('english', language)} ${
            language === 'en' ? 'selected' : ''
          }`}
          hint="Switch to English language"
        />

        <OptionButton
          //icon="alphabetical-variant"
          label="বাংলা"
          active={language === 'bn'}
          onPress={() => handleLanguageChange('bn')}
          accessibilityLabel={`${t('bangla', language)} ${
            language === 'bn' ? 'selected' : ''
          }`}
          hint="Switch to Bangla language"
        />
      </View>

      {/* Voice Speed Controller */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('voiceSpeed', language)}</Text>
        <View style={styles.speedRow}>
          <OptionButton
            icon="turtle"
            label={language === 'bn' ? 'ধীর' : 'Slow'}
            active={voiceRate <= 0.7}
            onPress={async () => {
              await changeVoiceRate(0.6);
              speak(language === 'bn' ? 'ধীর গতি নির্বাচন করা হয়েছে' : 'Slow speed selected', language, {
                rate: 0.6,
              });
            }}
            accessibilityLabel={`${t('voiceSpeed', language)} ${language === 'bn' ? 'ধীর' : 'Slow'}`}
            hint={language === 'bn' ? 'ভয়েস ধীরে পড়বে' : 'Voice will speak slower'}
          />
          <OptionButton
            icon="gauge"
            label={language === 'bn' ? 'স্বাভাবিক' : 'Normal'}
            active={voiceRate > 0.7 && voiceRate < 1.1}
            onPress={async () => {
              await changeVoiceRate(0.9);
              speak(language === 'bn' ? 'স্বাভাবিক গতি নির্বাচন করা হয়েছে' : 'Normal speed selected', language, {
                rate: 0.9,
              });
            }}
            accessibilityLabel={`${t('voiceSpeed', language)} ${language === 'bn' ? 'স্বাভাবিক' : 'Normal'}`}
            hint={language === 'bn' ? 'ভয়েস স্বাভাবিক গতিতে পড়বে' : 'Voice will speak at normal speed'}
          />
          <OptionButton
            icon="rabbit"
            label={language === 'bn' ? 'দ্রুত' : 'Fast'}
            active={voiceRate >= 1.1}
            onPress={async () => {
              await changeVoiceRate(1.2);
              speak(language === 'bn' ? 'দ্রুত গতি নির্বাচন করা হয়েছে' : 'Fast speed selected', language, {
                rate: 1.2,
              });
            }}
            accessibilityLabel={`${t('voiceSpeed', language)} ${language === 'bn' ? 'দ্রুত' : 'Fast'}`}
            hint={language === 'bn' ? 'ভয়েস দ্রুত পড়বে' : 'Voice will speak faster'}
          />
        </View>
      </View>

      {/* Back Button */}
      <Animated.View>
        <Pressable
          onPress={handleBackPress}
          accessible={true}
          accessibilityLabel={`${t('back', language)} button`}
          accessibilityRole="button"
          accessibilityHint="Navigate back to dashboard"
          style={({ pressed }) => [
            styles.backButton,
            pressed && { backgroundColor: 'rgba(255,255,255,0.1)' },
          ]}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={28}
            color="#FFFFFF"
            style={{ marginRight: 10 }}
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
          <Text style={styles.backButtonText}>{t('back', language)}</Text>
        </Pressable>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'flex-start',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 50,
    marginTop: 40,
  },
  title: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 18,
    color: '#B0C4DE',
    marginTop: 10,
    textAlign: 'center',
  },
  languageContainer: {
    width: '100%',
    maxWidth: 380,
    alignSelf: 'center',
    gap: 20,
    marginBottom: 60,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingVertical: 22,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  languageButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: '#FFFFFF',
  },
  languageButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#CCCCCC',
    marginLeft: 16,
  },
  languageButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  section: {
    alignItems: 'flex-start',
    paddingHorizontal: 10,
    marginBottom: 60,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 14,
  },
  speedRow: {
    flexDirection: 'row',
    gap: 14,
  },
  placeholderText: {
    fontSize: 16,
    color: '#AAAAAA',
    lineHeight: 28,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});
