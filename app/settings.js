import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useContext, useEffect } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppContext } from '../context/AppContext';
import { registerInteraction, speak } from '../utils/speech';
import { t } from '../utils/translations';

export default function SettingsScreen() {
  const router = useRouter();
  const { language, changeLanguage, voiceRate, changeVoiceRate, maskTalkBackDigits, changeMaskTalkBackDigits } = useContext(AppContext);

  useEffect(() => {
    const hint = language === 'bn' ? 'এক্সপ্লোর করতে নিচে সোয়াইপ করুন' : 'Swipe down to explore';
    speak(`${t('settingsScreen', language)}. ${hint}`, language, { rate: voiceRate });
  }, []);

  const handleLanguageChange = (newLang) => {
    changeLanguage(newLang);
    const message = `${t('languageChanged', language)} ${newLang === 'en' ? t('english', language) : t('bangla', language)
      }`;
    speak(message, newLang, { rate: voiceRate });
  };

  const handleBackPress = () => {
    speak(t('backToDashboard', language), language, { rate: voiceRate });
    router.back();
  };

  const OptionButton = ({ icon, label, active, onPress, accessibilityLabel, hint, small }) => {
    const scale = new Animated.Value(1);

    const onPressIn = () => {
      registerInteraction();
      Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
    };
    const onPressOut = () =>
      Animated.spring(scale, { toValue: 1, friction: 4, tension: 100, useNativeDriver: true }).start();

    return (
      <Animated.View style={[{ transform: [{ scale }] }, small && { flex: 1 }]}>
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
            small ? styles.smallButton : styles.optionButton,
            active && styles.optionButtonActive,
            pressed && { transform: [{ scale: 0.98 }] },
          ]}
        >
          {icon && (
            <MaterialCommunityIcons
              name={icon}
              size={small ? 18 : 22}
              color={active ? '#021d3f' : '#666666'}
              accessibilityElementsHidden
              importantForAccessibility="no"
            />
          )}
          <Text style={[small ? styles.smallButtonText : styles.optionButtonText, active && styles.activeText]}>
            {label}
          </Text>
          {active && <Text style={styles.checkmark}>✓</Text>}
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <LinearGradient colors={['#0f2027', '#203a43', '#2c5364']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContainer}
      >

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title} accessible={true} accessibilityLabel={t('settings', language)}>
            {t('settings', language)}
          </Text>
        </View>

        {/* Language Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Language</Text>
          <View style={styles.optionsGroup}>
            <OptionButton
              icon="translate"
              label="English"
              active={language === 'en'}
              onPress={() => handleLanguageChange('en')}
              accessibilityLabel={`${t('english', language)} ${language === 'en' ? 'selected' : ''}`}
              hint="Switch to English language"
            />
            <OptionButton
              icon="translate"
              label="বাংলা"
              active={language === 'bn'}
              onPress={() => handleLanguageChange('bn')}
              accessibilityLabel={`${t('bangla', language)} ${language === 'bn' ? 'selected' : ''}`}
              hint="Switch to Bangla language"
            />
          </View>
        </View>

        {/* Voice Speed */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('voiceSpeed', language)}</Text>
          <View style={styles.rowGroup}>
            <OptionButton
              icon="turtle"
              label={language === 'bn' ? 'ধীর' : 'Slow'}
              active={voiceRate <= 0.7}
              onPress={async () => {
                await changeVoiceRate(0.6);
                speak(language === 'bn' ? 'ধীর গতি নির্বাচন করা হয়েছে' : 'Slow speed selected', language, { rate: 0.6 });
              }}
              accessibilityLabel={`${t('voiceSpeed', language)} ${language === 'bn' ? 'ধীর' : 'Slow'}`}
              hint={language === 'bn' ? 'ভয়েস ধীরে পড়বে' : 'Voice will speak slower'}
              small
            />
            <OptionButton
              icon="gauge"
              label={language === 'bn' ? 'স্বাভাবিক' : 'Normal'}
              active={voiceRate > 0.7 && voiceRate < 1.1}
              onPress={async () => {
                await changeVoiceRate(0.9);
                speak(language === 'bn' ? 'স্বাভাবিক গতি নির্বাচন করা হয়েছে' : 'Normal speed selected', language, { rate: 0.9 });
              }}
              accessibilityLabel={`${t('voiceSpeed', language)} ${language === 'bn' ? 'স্বাভাবিক' : 'Normal'}`}
              hint={language === 'bn' ? 'ভয়েস স্বাভাবিক গতিতে পড়বে' : 'Voice will speak at normal speed'}
              small
            />
            <OptionButton
              icon="rabbit"
              label={language === 'bn' ? 'দ্রুত' : 'Fast'}
              active={voiceRate >= 1.1}
              onPress={async () => {
                await changeVoiceRate(1.2);
                speak(language === 'bn' ? 'দ্রুত গতি নির্বাচন করা হয়েছে' : 'Fast speed selected', language, { rate: 1.2 });
              }}
              accessibilityLabel={`${t('voiceSpeed', language)} ${language === 'bn' ? 'দ্রুত' : 'Fast'}`}
              hint={language === 'bn' ? 'ভয়েস দ্রুত পড়বে' : 'Voice will speak faster'}
              small
            />
          </View>
        </View>

        {/* TalkBack Digit Masking */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('maskTalkBackDigits', language)}</Text>
          <Text style={styles.sectionHint}>{t('maskTalkBackDigitsDescription', language)}</Text>
          <View style={styles.rowGroup}>
            <OptionButton
              icon="check-circle-outline"
              label={language === 'bn' ? 'সক্রিয়' : 'On'}
              active={maskTalkBackDigits}
              onPress={async () => {
                await changeMaskTalkBackDigits(true);
                speak(language === 'bn' ? 'টকব্যাক ডিজিট মাস্কিং সক্রিয় করা হয়েছে' : 'TalkBack digit masking enabled', language, { rate: voiceRate });
              }}
              accessibilityLabel={`${t('maskTalkBackDigits', language)} ${maskTalkBackDigits ? (language === 'bn' ? 'সক্রিয়' : 'enabled') : ''}`}
              hint={t('maskTalkBackDigitsDescription', language)}
              small
            />
            <OptionButton
              icon="close-circle-outline"
              label={language === 'bn' ? 'নিষ্ক্রিয়' : 'Off'}
              active={!maskTalkBackDigits}
              onPress={async () => {
                await changeMaskTalkBackDigits(false);
                speak(language === 'bn' ? 'টকব্যাক ডিজিট মাস্কিং নিষ্ক্রিয় করা হয়েছে' : 'TalkBack digit masking disabled', language, { rate: voiceRate });
              }}
              accessibilityLabel={`${t('maskTalkBackDigits', language)} ${!maskTalkBackDigits ? (language === 'bn' ? 'সক্রিয়' : 'enabled') : ''}`}
              hint={t('maskTalkBackDigitsDescription', language)}
              small
            />
          </View>
        </View>

        {/* Back Button */}
        <Pressable
          onPress={handleBackPress}
          accessible={true}
          accessibilityLabel={`${t('back', language)} button`}
          accessibilityRole="button"
          accessibilityHint="Navigate back to dashboard"
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#021d3f" accessibilityElementsHidden importantForAccessibility="no" />
          <Text style={styles.backButtonText}>{t('back', language)}</Text>
        </Pressable>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 36, // Increased
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 22, // Increased
    fontWeight: '700',
    color: '#FFFFFF', // Pure White
    marginBottom: 14,
    opacity: 1,
  },
  sectionHint: {
    fontSize: 16, // Increased
    color: '#DDDDDD',
    marginBottom: 14,
    lineHeight: 22,
  },
  optionsGroup: {
    gap: 16,
  },
  rowGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // Solid White
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 0,
    // borderColor: 'rgba(255, 255, 255, 0.15)',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  smallButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF', // Solid White
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderWidth: 0,
    // borderColor: 'rgba(255, 255, 255, 0.15)',
    gap: 8,
    minHeight: 90,
    elevation: 4,
  },
  optionButtonActive: {
    backgroundColor: '#E6F0FF', // Very light blue to indicate active? Or just keep white.
    borderWidth: 2,
    borderColor: '#021d3f', // distinct border for active
  },
  optionButtonText: {
    fontSize: 20, // Increased
    fontWeight: '600',
    color: '#021d3f', // Dark Blue
    flex: 1,
  },
  smallButtonText: {
    fontSize: 18, // Increased
    fontWeight: '600',
    color: '#021d3f', // Dark Blue
    textAlign: 'center',
  },
  activeText: {
    color: '#021d3f',
    fontWeight: '800',
  },
  checkmark: {
    fontSize: 24,
    color: '#021d3f', // Dark Blue
    fontWeight: '700',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF', // Solid White
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderWidth: 0,
    // borderColor: 'rgba(255, 255, 255, 0.2)',
    marginTop: 20,
    gap: 10,
    elevation: 4,
  },
  backButtonText: {
    fontSize: 20, // Increased
    fontWeight: '700',
    color: '#021d3f', // Dark Blue
  },
});