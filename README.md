# Fit4Duty - Police Fitness Training App

A comprehensive React Native/Expo application designed to help police officers and candidates prepare for fitness tests and maintain their physical readiness.

## 🚀 Features

- **Fitness Testing**: Digital versions of PREP and PIN tests
- **Workout Tracking**: Comprehensive workout logging and progress tracking
- **Community**: Connect with other officers and share experiences
- **Application Progress**: Track your police application journey
- **Admin Dashboard**: Complete admin system for user and content management
- **Modern UI**: Beautiful, responsive design optimized for mobile

## 🛠️ Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **State Management**: React Context + Zustand
- **Navigation**: Expo Router
- **Styling**: NativeWind + StyleSheet
- **Icons**: Lucide React Native
- **Package Manager**: Bun

## 📱 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Expo CLI
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rork-fit4duty-main
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase database**
   - Run the `supabase-complete-setup.sql` script in your Supabase SQL Editor
   - This creates all necessary tables, RLS policies, and triggers

5. **Create your first super admin**
   ```bash
   node scripts/make-super-admin.js
   ```
   Edit the script to use your email address.

6. **Start the development server**
   ```bash
   bunx rork start --web
   # or
   npm start
   ```

## 🏗️ Project Structure

```
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Main app tabs
│   ├── admin/             # Admin pages
│   ├── auth/              # Authentication pages
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
├── constants/             # App constants
├── context/               # React Context providers
├── lib/                   # Utilities and configurations
├── scripts/               # Utility scripts
└── assets/                # Static assets
```

## 🔐 Authentication & Authorization

The app uses Supabase Auth with role-based access control:

- **Regular Users**: Access to fitness features, community, and application tracking
- **Admins**: Additional content management capabilities
- **Super Admins**: Full system access including user management

## 🎨 Design System

The app uses a consistent design system with:
- **Colors**: Police-themed blue color palette
- **Typography**: Clear, readable fonts
- **Components**: Reusable, accessible components
- **Spacing**: Consistent 8px grid system

## 🧪 Testing

To test the app:

1. **Web**: Run `bunx rork start --web`
2. **iOS Simulator**: Run `bunx rork start --ios`
3. **Android Emulator**: Run `bunx rork start --android`

## 🚀 Deployment

### Expo Application Services (EAS)

1. **Install EAS CLI**
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Configure EAS**
   ```bash
   eas build:configure
   ```

3. **Build for production**
   ```bash
   eas build --platform all
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please contact the development team or create an issue in the repository.
