import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import {
  Calendar,
  Filter,
  MapPin,
  Clock,
  Users,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Plus,
  BookOpen,
  UserCheck,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { usePracticeSessions } from '@/context/PracticeSessionsContext';
import { useAuth } from '@/context/AuthContext';
import type { TestType, SessionFilters } from '@/types/practice-sessions';

const { width } = Dimensions.get('window');

export default function PracticeSessionsScreen() {
  const { user, isAdmin } = useAuth();
  const {
    sessions,
    bookings,
    loading,
    error,
    loadSessions,
    loadBookings,
    isUserBooked,
    isUserPendingApproval,
    isUserWaitlisted,
  } = usePracticeSessions();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filters, setFilters] = useState<SessionFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load sessions and bookings on component mount
  useEffect(() => {
    if (user) {
      loadSessions();
      loadBookings();
    }
  }, [user, loadSessions, loadBookings]);

  // Calendar navigation
  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.getTime() === today.getTime();
      const isSelected = date.toDateString() === selectedDate.toDateString();
      
      // Get sessions for this date
      const daySessions = sessions.filter(session => {
        const sessionDate = new Date(session.session_date);
        return sessionDate.toDateString() === date.toDateString();
      });

      days.push({
        date,
        isCurrentMonth,
        isToday,
        isSelected,
        sessions: daySessions,
      });
    }

    return days;
  };

  // Format price
  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  // Format time
  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Handle session selection
  const handleSessionSelect = (sessionId: string) => {
    router.push(`/practice-sessions/${sessionId}`);
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadSessions(filters),
      loadBookings(),
    ]);
    setRefreshing(false);
  };

  // Apply filters
  const applyFilters = (newFilters: SessionFilters) => {
    setFilters(newFilters);
    loadSessions(newFilters);
    setShowFilters(false);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({});
    loadSessions();
    setShowFilters(false);
  };

  const calendarDays = generateCalendarDays();
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Practice Sessions',
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => setShowFilters(!showFilters)}
              >
                <Filter size={20} color={Colors.primary} />
              </TouchableOpacity>
              {isAdmin() && (
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={() => router.push('/practice-sessions/create')}
                >
                  <Plus size={20} color={Colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          ),
        }} 
      />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Filters */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            <Text style={styles.filtersTitle}>Filter Sessions</Text>
            
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Test Type:</Text>
              <View style={styles.filterButtons}>
                {(['prep', 'pin'] as TestType[]).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.filterButton,
                      filters.test_type === type && styles.filterButtonActive,
                    ]}
                    onPress={() => applyFilters({ ...filters, test_type: filters.test_type === type ? undefined : type })}
                  >
                    <Text style={[
                      styles.filterButtonText,
                      filters.test_type === type && styles.filterButtonTextActive,
                    ]}>
                      {type.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterActions}>
              <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                <Text style={styles.clearButtonText}>Clear Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Calendar Header */}
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={goToPreviousMonth} style={styles.calendarNav}>
            <ChevronLeft size={24} color={Colors.primary} />
          </TouchableOpacity>
          
          <Text style={styles.calendarTitle}>{monthName}</Text>
          
          <TouchableOpacity onPress={goToNextMonth} style={styles.calendarNav}>
            <ChevronRight size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarGrid}>
          {/* Day headers */}
          <View style={styles.dayHeaders}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <Text key={day} style={styles.dayHeader}>{day}</Text>
            ))}
          </View>

          {/* Calendar days */}
          <View style={styles.daysGrid}>
            {calendarDays.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  !day.isCurrentMonth && styles.dayCellOtherMonth,
                  day.isToday && styles.dayCellToday,
                  day.isSelected && styles.dayCellSelected,
                ]}
                onPress={() => setSelectedDate(day.date)}
              >
                <Text style={[
                  styles.dayNumber,
                  !day.isCurrentMonth && styles.dayNumberOtherMonth,
                  day.isToday && styles.dayNumberToday,
                  day.isSelected && styles.dayNumberSelected,
                ]}>
                  {day.date.getDate()}
                </Text>
                
                {day.sessions.length > 0 && (
                  <View style={styles.daySessions}>
                    {day.sessions.slice(0, 2).map((session) => (
                      <View
                        key={session.id}
                        style={[
                          styles.sessionDot,
                          { backgroundColor: session.test_type === 'prep' ? '#667eea' : '#ff6b6b' }
                        ]}
                      />
                    ))}
                    {day.sessions.length > 2 && (
                      <Text style={styles.moreSessions}>+{day.sessions.length - 2}</Text>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Selected Date Sessions */}
        <View style={styles.sessionsSection}>
          <Text style={styles.sectionTitle}>
            Sessions for {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>

          {sessions
            .filter(session => {
              const sessionDate = new Date(session.session_date);
              return sessionDate.toDateString() === selectedDate.toDateString();
            })
            .map((session) => {
              const isBooked = isUserBooked(session.id);
              const isPendingApproval = isUserPendingApproval(session.id);
              const isWaitlisted = isUserWaitlisted(session.id);
              const availability = session.availability;
              
              // Use the actual booking status from the context
              const actualIsBooked = isBooked;

              return (
                <TouchableOpacity
                  key={session.id}
                  style={styles.sessionCard}
                  onPress={() => handleSessionSelect(session.id)}
                >
                  <LinearGradient
                    colors={session.test_type === 'prep' ? ['#667eea', '#764ba2'] : ['#ff6b6b', '#ee5a24']}
                    style={styles.sessionCardGradient}
                  >
                    <View style={styles.sessionHeader}>
                      <View style={styles.sessionType}>
                        <Text style={styles.sessionTypeText}>
                          {session.test_type.toUpperCase()} TEST
                        </Text>
                      </View>
                      
                      <View style={styles.sessionStatus}>
                        {actualIsBooked && (
                          <View style={styles.statusBadge}>
                            <UserCheck size={12} color="#ffffff" />
                            <Text style={styles.statusText}>Booked</Text>
                          </View>
                        )}
                        {isPendingApproval && !actualIsBooked && (
                          <View style={[styles.statusBadge, { backgroundColor: '#f59e0b' }]}>
                            <Clock size={12} color="#ffffff" />
                            <Text style={styles.statusText}>Pending Approval</Text>
                          </View>
                        )}
                        {isWaitlisted && !actualIsBooked && !isPendingApproval && (
                          <View style={[styles.statusBadge, { backgroundColor: '#f59e0b' }]}>
                            <Clock size={12} color="#ffffff" />
                            <Text style={styles.statusText}>Waitlisted</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <Text style={styles.sessionTitle}>{session.title}</Text>
                    
                    <View style={styles.sessionDetails}>
                      <View style={styles.sessionDetail}>
                        <MapPin size={14} color="rgba(255,255,255,0.8)" />
                        <Text style={styles.sessionDetailText}>
                          {session.location?.name}
                        </Text>
                      </View>
                      
                      <View style={styles.sessionDetail}>
                        <Clock size={14} color="rgba(255,255,255,0.8)" />
                        <Text style={styles.sessionDetailText}>
                          {formatTime(session.start_time)} - {formatTime(session.end_time)}
                        </Text>
                      </View>
                      
                      <View style={styles.sessionDetail}>
                        <Users size={14} color="rgba(255,255,255,0.8)" />
                        <Text style={styles.sessionDetailText}>
                          {availability?.available_spots || 0} spots available
                        </Text>
                      </View>
                      
                      <View style={styles.sessionDetail}>
                        <DollarSign size={14} color="rgba(255,255,255,0.8)" />
                        <Text style={styles.sessionDetailText}>
                          {formatPrice(session.price_cents)}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity style={styles.sessionAction}>
                      <BookOpen size={16} color={session.test_type === 'prep' ? '#667eea' : '#ff6b6b'} />
                      <Text style={styles.sessionActionText}>
                        {actualIsBooked ? 'View Details' : isPendingApproval ? 'Pending Approval' : 'Book Now'}
                      </Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}

          {sessions.filter(session => {
            const sessionDate = new Date(session.session_date);
            return sessionDate.toDateString() === selectedDate.toDateString();
          }).length === 0 && (
            <View style={styles.emptyState}>
              <Calendar size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyStateTitle}>No Sessions</Text>
              <Text style={styles.emptyStateText}>
                No practice sessions scheduled for this date.
              </Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push('/practice-sessions/bookings')}
          >
            <BookOpen size={20} color={Colors.primary} />
            <Text style={styles.quickActionText}>My Bookings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  
  // Filters
  filtersContainer: {
    backgroundColor: Colors.card,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filtersTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  filterRow: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  filterButtonTextActive: {
    color: Colors.white,
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  clearButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  
  // Calendar
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  calendarNav: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  calendarGrid: {
    backgroundColor: Colors.card,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  dayHeaders: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: width / 7 - 2,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  dayCellOtherMonth: {
    backgroundColor: Colors.background,
  },
  dayCellToday: {
    backgroundColor: Colors.primary + '20',
  },
  dayCellSelected: {
    backgroundColor: Colors.primary,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  dayNumberOtherMonth: {
    color: Colors.textSecondary,
  },
  dayNumberToday: {
    color: Colors.primary,
    fontWeight: '700',
  },
  dayNumberSelected: {
    color: Colors.white,
    fontWeight: '700',
  },
  daySessions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  sessionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  moreSessions: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginLeft: 2,
  },
  
  // Sessions
  sessionsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  sessionCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sessionCardGradient: {
    padding: 20,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sessionType: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sessionTypeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  sessionStatus: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 16,
  },
  sessionDetails: {
    gap: 8,
    marginBottom: 16,
  },
  sessionDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sessionDetailText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  sessionAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  sessionActionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  
  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  
  // Quick actions
  quickActions: {
    padding: 16,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
});
