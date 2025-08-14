import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
  Animated,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { 
  User, 
  Calendar, 
  Award, 
  LogOut, 
  Settings, 
  Edit3, 
  MapPin, 
  Phone, 
  Mail,
  Target,
  Clock,
  Activity,
  Shield,
  Camera,
  Lock,
  Key,
  UserCheck,
  Bell,
  Plus,
  HelpCircle,
  MessageCircle,
  FileText,
  BarChart3,
  Users,
  XCircle,
  AlertCircle,
  Dumbbell,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Star,
  Zap,
  Heart,
  Trophy,
  BookOpen,
  TrendingUp,
  MoreHorizontal,
  Share2,
  Bookmark,
  Eye,
  Crown,
  Briefcase,
  CreditCard,
  CheckCircle
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { typography, spacing, borderRadius, shadows } from "@/constants/designSystem";
import Button from "@/components/Button";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import { useCPP } from "@/context/CPPContext";
import NotificationBell from "@/components/NotificationBell";
import NotificationPanel from "@/components/NotificationPanel";
import CPPProgressWidget from "@/components/CPPProgressWidget";
import CPPProgressBadges from "@/components/CPPProgressBadges";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import Logo from "@/components/Logo";

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { user, signOut, updateProfile: updateAuthProfile, isLoading, isAdmin } = useAuth();
  const { unreadCount } = useNotifications();
  const { progress } = useCPP();
  
  const [notificationPanelVisible, setNotificationPanelVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Expandable sections state
  const [expandedSections, setExpandedSections] = useState<{
    personalInfo: boolean;
    careerGoals: boolean;
    premiumTools: boolean;
    bookings: boolean;
    settings: boolean;
  }>({
    personalInfo: false,
    careerGoals: false,
    premiumTools: false,
    bookings: false,
    settings: false,
  });
  
  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  
  // Profile form state
  const [name, setName] = useState(user?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [location, setLocation] = useState(user?.location || "");
  const [goal, setGoal] = useState(user?.goal || "");
  const [targetDate, setTargetDate] = useState(user?.target_date || "");
  const [experienceLevel, setExperienceLevel] = useState(user?.experience_level || "beginner");

  const isPremium = false; // Subscription removed - ready for new implementation
  
  // Mock bookings data
  const mockBookings = [
    {
      id: 1,
      date: '2024-01-15',
      location: 'Toronto Police College',
      type: 'PREP Test',
      status: 'confirmed' as const,
    },
    {
      id: 2,
      date: '2024-01-22',
      location: 'Vancouver Training Center',
      type: 'PIN Test',
      status: 'pending' as const,
    },
  ];

  // Mock data for progress tracking
  const userProgress = {
    applicationSteps: 3,
    totalSteps: 8,
    fitnessLevel: "Intermediate",
    beepTestLevel: 5.2,
    targetLevel: 6.5,
    upcomingSessions: 2,
    completedWorkouts: 12,
    weeklyGoal: 3,
    currentStreak: 5,
    profileCompletion: 65
  };

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  
  const getMotivationalMessage = () => {
    const percentage = Math.round(progress.percentage);
    if (percentage >= 80) return "You're almost ready for success!";
    if (percentage >= 60) return "Great progress — keep it up!";
    if (percentage >= 40) return "You're on the right track!";
    return "Let's build your path to success!";
  };
  
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };



  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateAuthProfile({
        full_name: name,
        phone,
        location,
        goal,
        target_date: targetDate,
        experience_level: experienceLevel,
      });
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setName(user?.full_name || "");
    setPhone(user?.phone || "");
    setLocation(user?.location || "");
    setGoal(user?.goal || "");
    setTargetDate(user?.target_date || "");
    setExperienceLevel(user?.experience_level || "beginner");
    setIsEditing(false);
  };

  const handlePasswordReset = () => {
    Alert.alert('Password Reset', 'Password reset link sent to your email');
  };

  const handleContactSupport = () => {
    Alert.alert('Contact Support', 'Support contact information coming soon');
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section with Gradient Banner */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={[Colors.gradients.primaryDark.start, Colors.gradients.primary.end]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            {/* Header Actions */}
            <View style={styles.heroHeader}>
              <TouchableOpacity 
                style={styles.headerButton} 
                onPress={() => setNotificationPanelVisible(true)}
              >
                <NotificationBell size={20} onPress={() => setNotificationPanelVisible(true)} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton}>
                <MoreHorizontal size={20} color={Colors.white} />
              </TouchableOpacity>
            </View>

            {/* Profile Picture & Basic Info - Center Aligned */}
            <View style={styles.profileHero}>
              <View style={styles.profilePictureContainer}>
                <View style={styles.profilePicture}>
                  <User size={32} color={Colors.primary} />
                </View>
                <TouchableOpacity style={styles.editPictureButton}>
                  <Camera size={12} color={Colors.primary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{name || 'Your Name'}</Text>
                <View style={styles.cppBadgeContainer}>
                  <CPPProgressBadges 
                    percentage={progress.percentage} 
                    size="small" 
                    showLabels={false}
                    horizontal={true}
                  />
                </View>
                <Text style={styles.motivationalText}>{getMotivationalMessage()}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Action Row */}
        <View style={styles.quickActionsSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActionsContainer}>
            <TouchableOpacity style={styles.quickActionButton} onPress={() => setIsEditing(true)}>
              <View style={styles.quickActionIcon}>
                <Edit3 size={18} color={Colors.primary} />
              </View>
              <Text style={styles.quickActionText}>Edit Profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionButton} onPress={() => router.push('/practice-sessions')}>
              <View style={styles.quickActionIcon}>
                <Calendar size={18} color={Colors.success} />
              </View>
              <Text style={styles.quickActionText}>My Bookings</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionButton} onPress={() => router.push('/cpp')}>
              <View style={styles.quickActionIcon}>
                <Award size={18} color={Colors.warning} />
              </View>
              <Text style={styles.quickActionText}>Certificates</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.quickActionButton, styles.premiumActionButton]}>
              <View style={[styles.quickActionIcon, styles.premiumActionIcon]}>
                <Crown size={18} color={Colors.accent} />
              </View>
              <Text style={[styles.quickActionText, styles.premiumActionText]}>Premium Tools</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Expandable Profile Sections */}
        <View style={styles.sectionsContainer}>
          {/* Personal Information Section */}
          <View style={styles.expandableCard}>
            <TouchableOpacity 
              style={styles.expandableHeader}
              onPress={() => toggleSection('personalInfo')}
            >
              <View style={styles.expandableHeaderLeft}>
                <View style={styles.sectionIcon}>
                  <User size={20} color={Colors.primary} />
                </View>
                <Text style={styles.sectionTitle}>Personal Information</Text>
              </View>
              <View style={styles.expandableHeaderRight}>
                <TouchableOpacity 
                  style={styles.editIconButton}
                  onPress={() => setIsEditing(true)}
                >
                  <Edit3 size={16} color={Colors.textSecondary} />
                </TouchableOpacity>
                {expandedSections.personalInfo ? 
                  <ChevronUp size={20} color={Colors.textSecondary} /> : 
                  <ChevronDown size={20} color={Colors.textSecondary} />
                }
              </View>
            </TouchableOpacity>
            
            {expandedSections.personalInfo && (
              <Animated.View style={styles.expandableContent}>
                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <Mail size={16} color={Colors.textSecondary} />
                    <View style={styles.infoItemContent}>
                      <Text style={styles.infoLabel}>Email</Text>
                      <Text style={styles.infoValue}>{email}</Text>
                    </View>
                  </View>
                  <View style={styles.infoItem}>
                    <Phone size={16} color={Colors.textSecondary} />
                    <View style={styles.infoItemContent}>
                      <Text style={styles.infoLabel}>Phone</Text>
                      <Text style={styles.infoValue}>{phone || 'Not set'}</Text>
                    </View>
                  </View>
                  <View style={styles.infoItem}>
                    <MapPin size={16} color={Colors.textSecondary} />
                    <View style={styles.infoItemContent}>
                      <Text style={styles.infoLabel}>Location</Text>
                      <Text style={styles.infoValue}>{location || 'Not set'}</Text>
                    </View>
                  </View>
                </View>
              </Animated.View>
            )}
          </View>

          {/* Career & Fitness Goals Section */}
          <View style={styles.expandableCard}>
            <TouchableOpacity 
              style={styles.expandableHeader}
              onPress={() => toggleSection('careerGoals')}
            >
              <View style={styles.expandableHeaderLeft}>
                <View style={styles.sectionIcon}>
                  <Target size={20} color={Colors.success} />
                </View>
                <Text style={styles.sectionTitle}>Career & Fitness Goals</Text>
              </View>
              <View style={styles.expandableHeaderRight}>
                {expandedSections.careerGoals ? 
                  <ChevronUp size={20} color={Colors.textSecondary} /> : 
                  <ChevronDown size={20} color={Colors.textSecondary} />
                }
              </View>
            </TouchableOpacity>
            
            {expandedSections.careerGoals && (
              <Animated.View style={styles.expandableContent}>
                <View style={styles.goalCard}>
                  <Text style={styles.goalCardTitle}>Current Goal</Text>
                  <Text style={styles.goalCardText}>{goal || 'No goal set'}</Text>
                  {targetDate && (
                    <Text style={styles.goalCardDate}>Target: {targetDate}</Text>
                  )}
                </View>
                
                <View style={styles.progressGrid}>
                  <View style={styles.progressItem}>
                    <Text style={styles.progressNumber}>{userProgress.applicationSteps}/{userProgress.totalSteps}</Text>
                    <Text style={styles.progressLabel}>Application Steps</Text>
                  </View>
                  <View style={styles.progressItem}>
                    <Text style={styles.progressNumber}>{userProgress.beepTestLevel.toFixed(1)}</Text>
                    <Text style={styles.progressLabel}>Beep Test Level</Text>
                  </View>
                  <View style={styles.progressItem}>
                    <Text style={styles.progressNumber}>{userProgress.completedWorkouts}</Text>
                    <Text style={styles.progressLabel}>Workouts Done</Text>
                  </View>
                </View>
                
                {/* CPP Achievement Badges */}
                <View style={styles.achievementSection}>
                  <Text style={styles.achievementTitle}>Achievement Badges</Text>
                  <CPPProgressBadges 
                    percentage={progress.percentage} 
                    size="small" 
                    showLabels={true}
                    horizontal={false}
                  />
                </View>
              </Animated.View>
            )}
          </View>

          {/* Premium Tools Section */}
          <View style={[styles.expandableCard, !isPremium && styles.premiumCard]}>
            <TouchableOpacity 
              style={styles.expandableHeader}
              onPress={() => toggleSection('premiumTools')}
            >
              <View style={styles.expandableHeaderLeft}>
                <View style={[styles.sectionIcon, !isPremium && styles.premiumSectionIcon]}>
                  <Crown size={20} color={isPremium ? Colors.accent : Colors.accent} />
                </View>
                <View>
                  <Text style={[styles.sectionTitle, !isPremium && styles.premiumSectionTitle]}>Premium Tools</Text>
                  {!isPremium && <Text style={styles.premiumSubtitle}>Unlock advanced features</Text>}
                </View>
              </View>
              <View style={styles.expandableHeaderRight}>
                {!isPremium && (
                  <View style={styles.lockBadge}>
                    <Lock size={12} color={Colors.accent} />
                  </View>
                )}
                {expandedSections.premiumTools ? 
                  <ChevronUp size={20} color={Colors.textSecondary} /> : 
                  <ChevronDown size={20} color={Colors.textSecondary} />
                }
              </View>
            </TouchableOpacity>
            
            {expandedSections.premiumTools && (
              <Animated.View style={styles.expandableContent}>
                {isPremium ? (
                  <View style={styles.premiumActiveContent}>
                    <View style={styles.mentorCard}>
                      <View style={styles.mentorAvatar}>
                        <UserCheck size={20} color={Colors.primary} />
                      </View>
                      <View style={styles.mentorInfo}>
                        <Text style={styles.mentorName}>Officer Sarah Johnson</Text>
                        <Text style={styles.mentorRole}>Your Assigned Mentor</Text>
                      </View>
                      <TouchableOpacity style={styles.contactButton}>
                        <MessageCircle size={16} color={Colors.primary} />
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.creditsCard}>
                      <Text style={styles.creditsTitle}>Remaining Credits</Text>
                      <Text style={styles.creditsNumber}>2 In-Person Tests</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.premiumUpsellContent}>
                    <View style={styles.featuresList}>
                      <View style={styles.featureItem}>
                        <CheckCircle size={16} color={Colors.success} />
                        <Text style={styles.featureText}>2 In-Person Practice Tests</Text>
                      </View>
                      <View style={styles.featureItem}>
                        <CheckCircle size={16} color={Colors.success} />
                        <Text style={styles.featureText}>Personal Mentor Guidance</Text>
                      </View>
                      <View style={styles.featureItem}>
                        <CheckCircle size={16} color={Colors.success} />
                        <Text style={styles.featureText}>Priority Booking Access</Text>
                      </View>
                      <View style={styles.featureItem}>
                        <CheckCircle size={16} color={Colors.success} />
                        <Text style={styles.featureText}>Advanced Analytics</Text>
                      </View>
                    </View>
                    
                    <TouchableOpacity style={styles.upgradeButton}>
                      <LinearGradient
                        colors={[Colors.gradients.accent.start, Colors.gradients.accent.end]}
                        style={styles.upgradeButtonGradient}
                      >
                        <Crown size={16} color={Colors.white} />
                        <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}
              </Animated.View>
            )}
          </View>

          {/* My Bookings Section */}
          <View style={styles.expandableCard}>
            <TouchableOpacity 
              style={styles.expandableHeader}
              onPress={() => toggleSection('bookings')}
            >
              <View style={styles.expandableHeaderLeft}>
                <View style={styles.sectionIcon}>
                  <Calendar size={20} color={Colors.info} />
                </View>
                <Text style={styles.sectionTitle}>My Bookings</Text>
              </View>
              <View style={styles.expandableHeaderRight}>
                <TouchableOpacity style={styles.viewAllButton}>
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
                {expandedSections.bookings ? 
                  <ChevronUp size={20} color={Colors.textSecondary} /> : 
                  <ChevronDown size={20} color={Colors.textSecondary} />
                }
              </View>
            </TouchableOpacity>
            
            {expandedSections.bookings && (
              <Animated.View style={styles.expandableContent}>
                {mockBookings.map((booking) => (
                  <View key={booking.id} style={styles.bookingItem}>
                    <View style={styles.bookingLeft}>
                      <View style={[styles.bookingStatus, { backgroundColor: Colors.status[booking.status] + '20' }]}>
                        <View style={[styles.bookingStatusDot, { backgroundColor: Colors.status[booking.status] }]} />
                      </View>
                      <View style={styles.bookingInfo}>
                        <Text style={styles.bookingType}>{booking.type}</Text>
                        <Text style={styles.bookingDate}>{booking.date}</Text>
                        <Text style={styles.bookingLocation}>{booking.location}</Text>
                      </View>
                    </View>
                    <View style={styles.bookingRight}>
                      <Text style={[styles.bookingStatusText, { color: Colors.status[booking.status] }]}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                ))}
              </Animated.View>
            )}
          </View>

          {/* Settings Section */}
          <View style={styles.expandableCard}>
            <TouchableOpacity 
              style={styles.expandableHeader}
              onPress={() => toggleSection('settings')}
            >
              <View style={styles.expandableHeaderLeft}>
                <View style={styles.sectionIcon}>
                  <Settings size={20} color={Colors.textSecondary} />
                </View>
                <Text style={styles.sectionTitle}>Settings</Text>
              </View>
              <View style={styles.expandableHeaderRight}>
                {expandedSections.settings ? 
                  <ChevronUp size={20} color={Colors.textSecondary} /> : 
                  <ChevronDown size={20} color={Colors.textSecondary} />
                }
              </View>
            </TouchableOpacity>
            
            {expandedSections.settings && (
              <Animated.View style={styles.expandableContent}>
                <TouchableOpacity style={styles.settingItem} onPress={handlePasswordReset}>
                  <Key size={18} color={Colors.primary} />
                  <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>Reset Password</Text>
                    <Text style={styles.settingDescription}>Send reset link to email</Text>
                  </View>
                  <ChevronRight size={16} color={Colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingItem} onPress={handleContactSupport}>
                  <HelpCircle size={18} color={Colors.primary} />
                  <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>Help & Support</Text>
                    <Text style={styles.settingDescription}>Contact our support team</Text>
                  </View>
                  <ChevronRight size={16} color={Colors.textSecondary} />
                </TouchableOpacity>

                {isAdmin() && (
                  <TouchableOpacity 
                    style={styles.settingItem} 
                    onPress={() => router.push('/admin/dashboard')}
                  >
                    <Shield size={18} color={Colors.primary} />
                    <View style={styles.settingContent}>
                      <Text style={styles.settingTitle}>Admin Panel</Text>
                      <Text style={styles.settingDescription}>Administrative tools</Text>
                    </View>
                    <ChevronRight size={16} color={Colors.textSecondary} />
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={[styles.settingItem, styles.dangerItem]} onPress={handleSignOut}>
                  <LogOut size={18} color={Colors.error} />
                  <View style={styles.settingContent}>
                    <Text style={[styles.settingTitle, styles.dangerText]}>Sign Out</Text>
                    <Text style={styles.settingDescription}>Sign out of your account</Text>
                  </View>
                  <ChevronRight size={16} color={Colors.error} />
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
        </View>

        {/* Edit Profile Form */}
        {isEditing && (
          <View style={styles.editModal}>
            <View style={styles.editModalContent}>
              <View style={styles.editModalHeader}>
                <Text style={styles.editModalTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={() => setIsEditing(false)}>
                  <XCircle size={24} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.editForm} showsVerticalScrollIndicator={false}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Name</Text>
                  <View style={styles.inputContainer}>
                    <User size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={name}
                      onChangeText={setName}
                      placeholder="Enter your full name"
                      placeholderTextColor={Colors.gray[400]}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone Number</Text>
                  <View style={styles.inputContainer}>
                    <Phone size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={phone}
                      onChangeText={setPhone}
                      placeholder="(555) 123-4567"
                      placeholderTextColor={Colors.gray[400]}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Location</Text>
                  <View style={styles.inputContainer}>
                    <MapPin size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={location}
                      onChangeText={setLocation}
                      placeholder="City, Province"
                      placeholderTextColor={Colors.gray[400]}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Your Goal</Text>
                  <View style={styles.inputContainer}>
                    <Target size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={goal}
                      onChangeText={setGoal}
                      placeholder="e.g., Pass PREP test by December"
                      placeholderTextColor={Colors.gray[400]}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Target Date</Text>
                  <View style={styles.inputContainer}>
                    <Calendar size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={targetDate}
                      onChangeText={setTargetDate}
                      placeholder="MM/YYYY"
                      placeholderTextColor={Colors.gray[400]}
                    />
                  </View>
                </View>

                <View style={styles.editActions}>
                  <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <Button
                    title="Save Changes"
                    onPress={handleSave}
                    loading={isSaving}
                    style={styles.saveButton}
                  />
                </View>
              </ScrollView>
            </View>
          </View>
        )}

        {/* Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Global Notification Panel */}
      <NotificationPanel
        visible={notificationPanelVisible}
        onClose={() => setNotificationPanelVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  
  // Hero section - Apple Fitness+ inspired
  heroSection: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  heroGradient: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    position: 'relative',
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white + '20',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.light,
  },
  
  // Profile hero - center aligned
  profileHero: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  profilePictureContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  profilePicture: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editPictureButton: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    ...shadows.light,
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    ...typography.headingLarge,
    color: Colors.white,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  cppBadgeContainer: {
    marginBottom: spacing.sm,
  },
  cppBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  cppBadgeText: {
    ...typography.labelMedium,
    color: Colors.white,
    fontWeight: '600',
  },
  motivationalText: {
    ...typography.bodyMedium,
    color: Colors.white + 'CC',
    textAlign: 'center',
  },
  
  // Quick Actions Row
  quickActionsSection: {
    marginBottom: spacing.lg,
  },
  quickActionsContainer: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  quickActionButton: {
    alignItems: 'center',
    minWidth: 80,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
    ...shadows.light,
  },
  quickActionText: {
    ...typography.labelSmall,
    color: Colors.text,
    textAlign: 'center',
  },
  premiumActionButton: {
    // Premium styling handled by icon
  },
  premiumActionIcon: {
    backgroundColor: Colors.accent + '10',
    borderWidth: 1,
    borderColor: Colors.accent + '30',
  },
  premiumActionText: {
    color: Colors.accent,
    fontWeight: '600',
  },
  
  // Expandable Sections
  sectionsContainer: {
    marginHorizontal: spacing.md,
    gap: spacing.md,
  },
  expandableCard: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    ...shadows.light,
    overflow: 'hidden',
  },
  premiumCard: {
    borderWidth: 1,
    borderColor: Colors.accent + '20',
    ...shadows.premium,
  },
  expandableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  expandableHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  expandableHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  premiumSectionIcon: {
    backgroundColor: Colors.accent + '10',
  },
  sectionTitle: {
    ...typography.headingSmall,
    color: Colors.text,
  },
  premiumSectionTitle: {
    color: Colors.accent,
  },
  premiumSubtitle: {
    ...typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  editIconButton: {
    padding: spacing.xs,
  },
  lockBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.accent + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandableContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  
  // Personal Info Content
  infoGrid: {
    gap: spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  infoItemContent: {
    marginLeft: spacing.md,
    flex: 1,
  },
  infoLabel: {
    ...typography.labelSmall,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    ...typography.bodyMedium,
    color: Colors.text,
  },
  
  // Career Goals Content
  goalCard: {
    backgroundColor: Colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  goalCardTitle: {
    ...typography.labelLarge,
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  goalCardText: {
    ...typography.bodyMedium,
    color: Colors.textSecondary,
    marginBottom: spacing.xs,
  },
  goalCardDate: {
    ...typography.labelSmall,
    color: Colors.primary,
  },
  progressGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressItem: {
    alignItems: 'center',
  },
  progressNumber: {
    ...typography.headingMedium,
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  progressLabel: {
    ...typography.labelSmall,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  
  // Achievement Badges Section
  achievementSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
  },
  achievementTitle: {
    ...typography.labelLarge,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  
  // Premium Tools Content
  premiumActiveContent: {
    gap: spacing.md,
  },
  mentorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  mentorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  mentorInfo: {
    flex: 1,
  },
  mentorName: {
    ...typography.bodyLarge,
    color: Colors.text,
    fontWeight: '600',
  },
  mentorRole: {
    ...typography.bodySmall,
    color: Colors.textSecondary,
  },
  contactButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  creditsCard: {
    backgroundColor: Colors.success + '10',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  creditsTitle: {
    ...typography.labelMedium,
    color: Colors.success,
    marginBottom: spacing.xs,
  },
  creditsNumber: {
    ...typography.headingSmall,
    color: Colors.success,
  },
  
  // Premium Upsell Content
  premiumUpsellContent: {
    gap: spacing.lg,
  },
  featuresList: {
    gap: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureText: {
    ...typography.bodyMedium,
    color: Colors.text,
  },
  upgradeButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.medium,
  },
  upgradeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  upgradeButtonText: {
    ...typography.labelLarge,
    color: Colors.white,
    fontWeight: '600',
  },
  
  // Bookings Content
  bookingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  bookingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bookingStatus: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  bookingStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingType: {
    ...typography.bodyLarge,
    color: Colors.text,
    fontWeight: '600',
  },
  bookingDate: {
    ...typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  bookingLocation: {
    ...typography.bodySmall,
    color: Colors.textSecondary,
  },
  bookingRight: {
    alignItems: 'flex-end',
  },
  bookingStatusText: {
    ...typography.labelSmall,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  
  // Settings Content
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  settingContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  settingTitle: {
    ...typography.bodyLarge,
    color: Colors.text,
    fontWeight: '600',
  },
  settingDescription: {
    ...typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  dangerItem: {
    // Styling handled by text color
  },
  dangerText: {
    color: Colors.error,
  },
  
  // View All Button
  viewAllButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  viewAllText: {
    ...typography.labelSmall,
    color: Colors.primary,
    fontWeight: '600',
  },
  
  // Edit modal styles
  editModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  editModalContent: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    ...shadows.heavy,
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  editModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  editForm: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  saveButton: {
    flex: 2,
  },
  
  // Spacer
  bottomSpacer: {
    height: 100,
  },
});