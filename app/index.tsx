import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import Logo from '@/components/Logo';
import LoadingScreen from '@/components/LoadingScreen';
import { useAuth } from '@/context/AuthContext';

export default function WelcomeScreen() {
  const { user, isLoading, isAdmin } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      console.log('User authenticated:', {
        id: user.id,
        email: user.email,
        role: user.role,
        is_admin: user.is_admin,
        admin_permissions: user.admin_permissions
      });
      
      // Add a small delay to ensure profile is fully loaded
      const redirectTimer = setTimeout(() => {
        // Check if user is admin (including super admin) and redirect accordingly
        if (isAdmin()) {
          console.log('Admin detected, redirecting to admin dashboard');
          router.replace('/admin/dashboard');
        } else {
          // Regular user, redirect to main app
          console.log('Regular user detected, redirecting to main dashboard');
          router.replace('/(tabs)/dashboard');
        }
      }, 500); // 500ms delay to ensure profile is fully loaded
      
      return () => clearTimeout(redirectTimer);
    } else if (!isLoading && !user) {
      console.log('No user authenticated, showing welcome screen');
    }
  }, [user, isLoading, isAdmin]);

  // Debug effect to log when user or admin status changes
  useEffect(() => {
    console.log('Debug - User state changed:', {
      isLoading,
      hasUser: !!user,
      userRole: user?.role,
      isAdmin: user?.is_admin,
      adminPermissions: user?.admin_permissions,
      isAdminFunction: isAdmin()
    });
  }, [user, isLoading, isAdmin]);

  // Add a fallback redirect in case the main redirect fails
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!isLoading && user) {
        if (isAdmin()) {
          console.log('Fallback redirect for admin');
          router.replace('/admin/dashboard');
        } else {
          console.log('Fallback redirect for regular user');
          router.replace('/(tabs)/dashboard');
        }
      }
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [user, isLoading, isAdmin]);

  if (isLoading) {
    return (
      <LoadingScreen 
        title="Loading Fit4Duty..."
        subtitle="Preparing your fitness journey"
      />
    );
  }

  // Show loading screen while user is authenticated but profile is still loading
  if (user && !user.role && !user.is_admin) {
    return (
      <LoadingScreen 
        title="Loading your profile..."
        subtitle="Setting up your dashboard"
      />
    );
  }

  // Show welcome screen only if user is not authenticated
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={{
          uri: 'https://i.pinimg.com/736x/ff/cc/70/ffcc70e4af1d9ebae342de3e6d34717a.jpg'
        }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
          style={styles.overlay}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <Logo size="large" variant="light" />
            </View>
            
            <View style={styles.heroSection}>
              <Text style={styles.title}>Police Fitness Training</Text>
              <Text style={styles.subtitle}>
                Prepare for duty. Train like a professional.
              </Text>
            </View>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.joinButton}
                onPress={() => router.push('/auth/sign-up')}
              >
                <Text style={styles.joinButtonText}>Join Us</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.signInButton}
                onPress={() => router.push('/auth/sign-in')}
              >
                <Text style={styles.signInButtonText}>Sign In</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.indicator} />
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'flex-start',
  },

  heroSection: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 100,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.white,
    lineHeight: 52,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 24,
    maxWidth: '90%',
  },
  buttonContainer: {
    gap: 16,
  },
  joinButton: {
    backgroundColor: Colors.white,
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  joinButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  signInButton: {
    backgroundColor: 'transparent',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  signInButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },
  indicator: {
    width: 134,
    height: 5,
    backgroundColor: Colors.white,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginTop: 20,
  },
});