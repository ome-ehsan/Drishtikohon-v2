import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useContext, useEffect } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppContext } from '../context/AppContext';
import { registerInteraction, speak } from '../utils/speech';
import { t } from '../utils/translations';

export default function BalanceScreen() {
  const router = useRouter();
  const {
    language,
    isScreenHidden,
    setIsScreenHidden,
    isScreenReaderEnabled,
    getBalance,
  } = useContext(AppContext);

  const balance = getBalance();

  // Announce balance on screen load
  useEffect(() => {
    const announceMessage = isScreenReaderEnabled
      ? `${t('yourBalance', language)} ${balance} ${t('taka', language)}`
      : `${balance} ${t('taka', language)}`;
    setTimeout(() => speak(announceMessage, language, { rate: 0.85 }), 500);
  }, []);

  const handleToggleScreenHide = () => {
    const newState = !isScreenHidden;
    setIsScreenHidden(newState);
    const message = newState ? t('screenHidden', language) : t('screenVisible', language);
    speak(message, language);
  };

  const handleBackPress = () => {
    if (isScreenHidden) setIsScreenHidden(false);
    speak(t('backToDashboard', language), language);
    router.back();
  };

  // Animated button component (reuse dashboard style)
  const ActionButton = ({ icon, label, onPress, accessibilityLabel, hint, secondary }) => {
    const scale = new Animated.Value(1);
    const onPressIn = () => {
      registerInteraction(); // Register button interaction for TalkBack timing
      Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
    };
    const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          accessible
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={hint}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.button,
            secondary ? styles.buttonSecondary : styles.buttonPrimary,
            pressed && { backgroundColor: 'rgba(255,255,255,0.15)' },
          ]}
        >
          <MaterialCommunityIcons
            name={icon}
            size={36} // Increased from 32
            color="#021d3f" // Changed from #FFFFFF
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
          <Text style={styles.buttonText}>{label}</Text>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <LinearGradient colors={['#0f2027', '#203a43', '#2c5364']} style={styles.container}>
      {!isScreenHidden ? (
        <>
          <Text
            style={styles.title}
            accessible={true}
            accessibilityLabel={t('checkBalance', language)}
          >
            {t('checkBalance', language)}
          </Text>

          {/* Balance Display */}
          <View style={styles.balanceCard}>
            <MaterialCommunityIcons
              name="wallet"
              size={42}
              color="#FFFFFF"
              style={{ marginBottom: 10 }}
              accessibilityElementsHidden
            />

            <Text
              style={styles.balanceAmount}
              accessibilityLabel={`${t('yourBalance', language)} ${balance} ${t('taka', language)}`}
            >
              ৳ {balance.toLocaleString()}
            </Text>
            {/* <Text style={styles.balanceCurrency}>{t('taka', language)}</Text> */}
          </View>
        </>
      ) : (
        // Hidden screen mode
        <View style={styles.hiddenIndicator}>
          <MaterialCommunityIcons name="eye-off" size={48} color="#777" />
          <Text style={styles.hiddenModeText}>🔒 {t('screenHidden', language)}</Text>
          <Text style={styles.hiddenSubtext}>
            {language === 'en' ? 'Tap Show Screen to reveal' : 'স্ক্রিন দেখতে ট্যাপ করুন'}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <ActionButton
          icon={isScreenHidden ? 'eye' : 'eye-off'}
          label={isScreenHidden ? t('showScreen', language) : t('hideScreen', language)}
          onPress={handleToggleScreenHide}
          accessibilityLabel={
            isScreenHidden
              ? `${t('showScreen', language)}`
              : `${t('hideScreen', language)}`
          }
          hint="Toggle screen visibility for privacy"
        />

        <ActionButton
          icon="arrow-left"
          label={t('back', language)}
          onPress={handleBackPress}
          accessibilityLabel={`${t('back', language)}`}
          secondary
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 50,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 40,
    textAlign: 'center',
  },
  balanceCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    marginBottom: 60,
  },
  balanceLabel: {
    fontSize: 18,
    color: '#CCCCCC',
    marginBottom: 10,
  },
  balanceAmount: {
    fontSize: 56,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  balanceCurrency: {
    fontSize: 18,
    color: '#B0C4DE',
    marginTop: 5,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 360,
    gap: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    paddingVertical: 24,
    paddingHorizontal: 22,
    elevation: 5,
  },
  buttonPrimary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
  },
  buttonSecondary: {
    backgroundColor: '#FFFFFF', // Changed from secondary transparent
    borderWidth: 0,
    marginTop: 10, // Add spacing if they are stacked
  },
  buttonText: {
    fontSize: 28, // Increased from 20
    fontWeight: '700',
    color: '#021d3f', // Changed from #FFFFFF
    marginLeft: 14,
    letterSpacing: 0.5,
  },
  hiddenIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 60,
  },
  hiddenModeText: {
    fontSize: 22,
    color: '#AAAAAA',
    marginTop: 10,
    marginBottom: 6,
  },
  hiddenSubtext: {
    fontSize: 14,
    color: '#777777',
  },
});
