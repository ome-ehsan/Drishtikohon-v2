# Welcome to Drishtikohon

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Features

- **Accessibility-First Design**: Full TalkBack/VoiceOver support with TTS feedback
- **Bilingual Support**: English and Bangla language support
- **Mobile Banking**: Send money, check balance, mobile recharge
- **PIN Security**: Secure PIN-based authentication
- **Screen Reader Optimized**: Designed specifically for visually impaired users
 - **Tone-based PIN Entry**: Privacy-safe tones + spoken progress feedback

## Mobile Recharge Flow

The app includes a comprehensive mobile recharge feature with:

1. **Dashboard Integration**: Mobile Recharge button on the main dashboard
2. **Phone Number Input**: Accessible text input with TTS feedback for each digit entered
3. **Operator Selection**: Modal with 5 Bangladeshi operators (Grameenphone, Robi, Banglalink, Airtel, Teletalk)
4. **Amount Input**: Numeric input for recharge amount
5. **PIN Verification**: Secure PIN entry using the existing PIN component
6. **Transaction Processing**: Mock transaction processing with balance updates
7. **Success Feedback**: TTS announcement with transaction details

### Accessibility Features

- All inputs have proper `accessibilityLabel` attributes
- TTS feedback for every user interaction
- TalkBack/VoiceOver optimized navigation
- Visual feedback for sighted users when screen reader is disabled
- Proper error handling with both TTS and visual feedback

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

## Testing

- **Test PIN**: 1234
- **Mock Balance**: 1500 taka
- **Mock OTP**: 1234

The app is designed to work seamlessly with screen readers and provides comprehensive accessibility features for visually impaired users.
