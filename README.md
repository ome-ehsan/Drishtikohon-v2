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
- **PIN-based Login**: Secure 4-digit PIN authentication with privacy-safe audio feedback
- **User Registration**: Phone number verification with OTP auto-fill simulation
- **PIN Setup**: Guided PIN creation and confirmation process
- **Screen Privacy**: Hide screen content for privacy while maintaining voice guidance

### 💰 **Banking Operations**
- **Balance Inquiry**: Check account balance with voice announcements
- **Send Money**: Transfer funds to other mobile numbers with OTP verification
- **Mobile Recharge**: Recharge any mobile number with 5 major Bangladeshi operators
- **Transaction History**: Track all transactions with detailed records

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
- **Voice Speed Control**: Adjustable TTS rate (0.1x - 2.0x)
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
   git clone https://github.com/your-username/drishtikohon.git
   cd drishtikohon
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

## 📱 **Screens & Features**

### **1. Login Screen (`app/index.js`)**
- PIN entry with audio tones and spoken progress
- Privacy-safe digit entry (no spoken digits)
- Auto-submit on 4-digit completion
- Error handling with TTS feedback

### **2. Dashboard (`app/dashboard.js`)**
- Main navigation hub
- Quick access to all banking features
- Clean, accessible button layout
- Voice announcements for navigation

### **3. Balance Inquiry (`app/balance.js`)**
- Current account balance display
- Screen hide/show functionality
- Voice announcements of balance
- High-contrast visual design

### **4. Send Money (`app/send-money.js`)**
- Receiver number input with validation
- Amount entry with balance checking
- OTP verification process
- Transaction confirmation

### **5. Mobile Recharge (`app/mobile-recharge.js`)**
- Phone number input for recharge
- Operator selection (5 Bangladeshi operators)
- Amount input with validation
- PIN verification for transaction

### **6. OTP Verification (`app/otp-verification.js`)**
- Auto-fill OTP simulation
- Manual OTP entry with keypad
- Transaction processing
- Success/failure feedback

### **7. Settings (`app/settings.js`)**
- Language selection (English/Bangla)
- Voice speed adjustment
- Accessibility preferences
- Real-time setting updates

### **8. Registration (`app/register.js`)**
- Phone number registration
- OTP verification
- User account setup
- PIN creation guidance

### **9. PIN Setup (`app/setup-pin.js`)**
- Secure PIN creation
- PIN confirmation
- Privacy-focused design
- Audio guidance for setup

## 🔧 **Accessibility Implementation**

### **TalkBack/VoiceOver Integration**
- Automatic detection of screen reader status
- Smart TTS control (disables in-app TTS when TalkBack is active)
- Proper accessibility labels and roles
- Focus management and navigation

### **Audio Feedback System**
- Privacy-safe digit tones for PIN entry
- Spoken progress announcements
- Error message announcements
- Success confirmation feedback

### **Visual Accessibility**
- High contrast color schemes
- Large, clear button designs
- Screen magnifier overlay
- Proper text sizing and spacing

### **Haptic Feedback**
- Vibration patterns for different interactions
- Confirmation feedback for button presses
- Error indication through haptics

## 🌐 **Internationalization**

### **Supported Languages**
- **English**: Complete interface and voice support
- **Bangla (বাংলা)**: Full localization including TTS

### **Cultural Adaptations**
- Bangladeshi mobile operators
- Local currency (Taka - ৳)
- Regional phone number formats
- Cultural UI considerations

## 🔒 **Security Features**

### **PIN Security**
- Privacy-safe PIN entry (no spoken digits)
- Secure PIN storage with AsyncStorage
- PIN validation and confirmation
- Session management

### **Transaction Security**
- OTP verification for all transactions
- Balance validation before transfers
- Transaction logging and history
- Error handling and rollback

## 📊 **State Management**

### **AppContext Features**
- User authentication state
- Language preferences
- Voice settings
- Transaction history
- Balance management
- TalkBack detection

### **Persistent Storage**
- User preferences (language, voice rate)
- Authentication state
- Transaction history
- PIN storage

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

## 🤝 **Contributing**

We welcome contributions to improve Drishtikohon! Please read our contributing guidelines and:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with accessibility tools
5. Submit a pull request

### **Development Guidelines**
- Follow accessibility best practices
- Test with screen readers
- Maintain bilingual support
- Write clear commit messages
- Update documentation

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- Expo team for the excellent development platform
- React Native community for accessibility guidance
- Bangladeshi accessibility advocates for feedback
- Open source contributors and maintainers

## 📞 **Support**

For support, feature requests, or bug reports:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

---

<div align="center">
  <p><strong>Drishtikohon</strong> - Making mobile banking accessible for everyone</p>
  <p>Built with ❤️ for the visually impaired community</p>
</div>