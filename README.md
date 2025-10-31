# Drishtikohon - Accessible Mobile Banking App

<div align="center">
  <img src="assets/images/appIcon2.png" alt="Drishtikohon Logo" width="120" height="120">
  
  **An accessibility-first mobile banking application designed specifically for visually impaired users**
  
  [![Expo](https://img.shields.io/badge/Expo-000020.svg?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev)
  [![React Native](https://img.shields.io/badge/React_Native-20232A.svg?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
</div>

## 🌟 Overview

Drishtikohon (দৃষ্টিকোণ) is a comprehensive mobile banking application built with accessibility as the core principle. The app provides a seamless banking experience for visually impaired users through advanced TalkBack/VoiceOver integration, text-to-speech (TTS) feedback, haptic responses, and privacy-safe audio cues.

## ✨ Key Features

### 🔐 **Authentication & Security**
- **Tone based PIN entry**: Secure tone based 4-digit PIN authentication.
- **Tone Mode feature**: If turned on, TalkBack will refrain from announcing digits out loud.
- **User Registration**: Phone number verification with OTP auto-fill simulation
- **PIN Setup**: Guided PIN creation and confirmation process
- **Screen Privacy**: Hide screen content for privacy while maintaining voice guidance

### 💰 **Banking Operations**
- **Balance Inquiry**: Check account balance with voice announcements
- **Send Money**: Transfer funds to other mobile numbers with OTP verification (Visual Simulation)
- **Mobile Recharge**: Recharge any mobile number with 5 major Bangladeshi operators (Visual Simulation)

### 🎯 **Accessibility Features**
- **TalkBack/VoiceOver Integration**: Full screen reader support with automatic detection
- **Smart TTS Control**: Automatically disables in-app TTS when TalkBack is enabled
- **Audio Feedback**: Privacy-safe digit tones + spoken progress for PIN entry
- **Haptic Feedback**: Vibration patterns for different interactions
- **Screen Magnifier**: Drag-to-zoom overlay for low-vision users
- **High Contrast UI**: Large, clear interface elements with proper color contrast

### 🌍 **Multilingual Support**
- **Bilingual Interface**: Complete English and Bangla (বাংলা) language support
- **Voice Localization**: TTS announcements in both languages
- **Cultural Adaptation**: Region-specific operator support and currency display

### ⚙️ **Customization**
- **Voice Speed Control**: Adjustable in-app TTS rate.
- **Language Switching**: Real-time language change with persistence
- **Accessibility Settings**: Comprehensive accessibility preferences

## 🏗️ **Technical Architecture**

### **Tech Stack**
- **Framework**: Expo + React Native with expo-router
- **Language**: JavaScript/TypeScript hybrid
- **Navigation**: File-based routing with expo-router
- **State Management**: React Context API
- **Storage**: AsyncStorage for persistence

### **Key Dependencies**
- `expo-speech`: Text-to-speech functionality
- `expo-haptics`: Haptic feedback
- `expo-av`: Audio playback for digit tones
- `react-native-reanimated`: Smooth animations
- `react-native-view-shot`: Screen capture for magnifier
- `@react-native-async-storage/async-storage`: Data persistence

### **Project Structure**
```
drishtikohon/
├── app/                          # Main application screens
│   ├── _layout.js               # Root layout with providers
│   ├── index.js                 # PIN login screen
│   ├── dashboard.js             # Main dashboard
│   ├── balance.js               # Balance inquiry
│   ├── send-money.js            # Money transfer
│   ├── mobile-recharge.js       # Mobile recharge
│   ├── otp-verification.js      # OTP verification
│   ├── register.js              # User registration
│   ├── setup-pin.js             # PIN setup
│   └── settings.js              # App settings
├── components/                   # Reusable components
│   ├── MagnifierOverlay.js      # Screen magnifier
│   └── ui/                      # UI components
├── context/                     # State management
│   ├── AppContext.js            # Main app state
│   └── MagnifierContext.js      # Magnifier state
├── utils/                       # Utility functions
│   ├── speech.js                # TTS utilities
│   ├── audio.js                 # Audio feedback
│   └── translations.js          # Bilingual support
└── assets/                      # Static assets
    ├── images/                  # App icons and images
    ├── operators/               # Mobile operator logos
    └── sounds/                  # Digit tone audio files
```

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/ome-ehsan/Drishtikohon-v2.git
   cd Drishtikohon-v2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on device/simulator**
   - **Android**: `npx expo run:android`
   - **iOS**: `npx expo run:ios`
   - **Web**: `npx expo start --web`

## 🧪 **Testing**

### **Test Credentials**
- **Test PIN**: `1234`
- **Mock Balance**: `1500` taka
- **Test OTP**: `1234`
- **Test Phone**: `01812345678`

### **Accessibility Testing**
1. Enable TalkBack (Android) or VoiceOver (iOS)
2. Navigate through all screens using screen reader
3. Test TTS announcements and haptic feedback
4. Verify screen magnifier functionality
5. Test language switching

## 🎨 **UI/UX Design**

### **Design Principles**
- Accessibility-first approach
- High contrast visual design
- Large, touch-friendly elements
- Consistent navigation patterns
- Clear visual hierarchy

### **Color Scheme**
- Dark theme with high contrast
- Gradient backgrounds
- Clear text visibility
- Accessible color combinations

## 🚀 **Deployment**

### **Building for Production**
```bash
# Android
npx expo build:android

# iOS
npx expo build:ios
```

### **Environment Setup**
- Configure app.json for production
- Set up proper signing certificates
- Configure deep linking if needed
- Set up analytics and crash reporting


## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


<div align="center">
  <p><strong>Drishtikohon</strong> - Making mobile banking accessible for everyone</p>
  <p>Built with ❤️ for the visually impaired community</p>
</div>
