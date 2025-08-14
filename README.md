# PolicePrep - Police Application Preparation App

A comprehensive React Native/Expo application designed to help aspiring police officers prepare for their application process through fitness training, test preparation, and application guidance.

## 🚀 Features

### Core Functionality
- **Certified Preparation Progress (CPP) System** - Track your readiness with verified and unverified completions
- **Fitness Training** - Workout plans, exercise library, and progress tracking
- **Test Preparation** - Ontario PIN test, PREP circuit training, and practice tests
- **Application Guidance** - Step-by-step application process with document management
- **Community Features** - Connect with other applicants and share experiences

### Onboarding System
- **Minimal Sign-up** - Quick 2-minute registration process
- **Progressive Setup** - Complete profile at your own pace
- **Smart Guidance** - Personalized onboarding flow with CPP introduction
- **Flexible Completion** - Resume setup anytime with persistent reminders

### Admin Features
- **User Management** - Comprehensive admin dashboard
- **Content Management** - Dynamic content editing system
- **Analytics** - User engagement and progress tracking
- **Practice Session Management** - Booking and approval workflows

## 🛠 Tech Stack

- **Frontend**: React Native with Expo
- **Navigation**: Expo Router
- **State Management**: React Context API
- **Backend**: Supabase (PostgreSQL, Auth, Functions)
- **Payments**: Stripe integration
- **UI Components**: Custom design system with Lucide icons
- **TypeScript**: Full type safety throughout the application

## 📱 Screenshots

*[Screenshots will be added here]*

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- Supabase account
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/policeprep-app.git
   cd policeprep-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your environment variables:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   ```

4. **Database Setup**
   ```bash
   # Run Supabase migrations
   npx supabase db push
   ```

5. **Start the development server**
   ```bash
   npx expo start
   ```

## 📁 Project Structure

```
policeprep-app/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Main tab navigation
│   ├── admin/             # Admin screens
│   ├── auth/              # Authentication screens
│   └── ...                # Other feature screens
├── components/            # Reusable UI components
├── constants/             # App constants and configuration
├── context/               # React Context providers
├── lib/                   # Utility functions and services
├── types/                 # TypeScript type definitions
├── supabase/              # Database migrations and functions
└── assets/                # Images and static assets
```

## 🔧 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Run the database migrations in `supabase/migrations/`
3. Set up authentication providers
4. Configure Row Level Security (RLS) policies

### Stripe Integration
1. Create a Stripe account
2. Set up webhook endpoints
3. Configure payment intents and subscriptions

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📦 Building for Production

### iOS
```bash
npx expo build:ios
```

### Android
```bash
npx expo build:android
```

### Web
```bash
npx expo build:web
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@policeprep.com or create an issue in this repository.

## 🔐 Security

- All sensitive data is encrypted
- Environment variables are properly configured
- Database access is controlled through RLS policies
- Authentication is handled securely through Supabase

## 📊 Analytics

The app includes analytics tracking for:
- User engagement
- Feature usage
- Conversion rates
- Performance metrics

## 🚀 Deployment

### Expo Application Services (EAS)
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Configure EAS
eas build:configure

# Build for production
eas build --platform all
```

### Manual Deployment
1. Build the app using Expo
2. Upload to App Store Connect (iOS)
3. Upload to Google Play Console (Android)

## 📈 Roadmap

- [ ] Advanced analytics dashboard
- [ ] AI-powered workout recommendations
- [ ] Video coaching sessions
- [ ] Peer-to-peer mentoring
- [ ] Integration with police department APIs
- [ ] Mobile app for iOS and Android

## 🙏 Acknowledgments

- Expo team for the amazing development platform
- Supabase for the backend infrastructure
- Stripe for payment processing
- All contributors and beta testers

---

**Made with ❤️ for aspiring police officers**
