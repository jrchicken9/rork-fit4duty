import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Plus, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Target,
  Dumbbell,
  BookOpen
} from 'lucide-react-native';
import Colors from '@/constants/colors';

interface MyBookingsSectionProps {
  bookings: Array<{
    id: string;
    type: 'practice-test' | 'workout' | 'session';
    title: string;
    date: string;
    time: string;
    location: string;
    status: 'upcoming' | 'completed' | 'cancelled';
    participants?: number;
    maxParticipants?: number;
  }>;
  onBookPracticeTest: () => void;
  onViewBooking: (bookingId: string) => void;
}

export default function MyBookingsSection({ 
  bookings, 
  onBookPracticeTest, 
  onViewBooking 
}: MyBookingsSectionProps) {
  const upcomingBookings = bookings.filter(b => b.status === 'upcoming');
  const pastBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return Colors.primary;
      case 'completed':
        return Colors.success;
      case 'cancelled':
        return Colors.error;
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming':
        return Clock;
      case 'completed':
        return CheckCircle;
      case 'cancelled':
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'practice-test':
        return Target;
      case 'workout':
        return Dumbbell;
      case 'session':
        return BookOpen;
      default:
        return Calendar;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'practice-test':
        return Colors.primary;
      case 'workout':
        return Colors.success;
      case 'session':
        return Colors.warning;
      default:
        return Colors.textSecondary;
    }
  };

  const BookingCard = ({ booking }: { booking: any }) => {
    const StatusIcon = getStatusIcon(booking.status);
    const TypeIcon = getTypeIcon(booking.type);
    
    return (
      <TouchableOpacity
        style={styles.bookingCard}
        onPress={() => onViewBooking(booking.id)}
      >
        <View style={styles.bookingHeader}>
          <View style={[styles.typeIcon, { backgroundColor: getTypeColor(booking.type) + '10' }]}>
            <TypeIcon size={16} color={getTypeColor(booking.type)} />
          </View>
          <View style={styles.bookingInfo}>
            <Text style={styles.bookingTitle}>{booking.title}</Text>
            <Text style={styles.bookingDate}>{booking.date} at {booking.time}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + '10' }]}>
            <StatusIcon size={12} color={getStatusColor(booking.status)} />
            <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Text>
          </View>
        </View>
        
        <View style={styles.bookingDetails}>
          <View style={styles.detailItem}>
            <MapPin size={14} color={Colors.textSecondary} />
            <Text style={styles.detailText}>{booking.location}</Text>
          </View>
          {booking.participants && (
            <View style={styles.detailItem}>
              <Users size={14} color={Colors.textSecondary} />
              <Text style={styles.detailText}>
                {booking.participants}/{booking.maxParticipants} participants
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Calendar size={24} color={Colors.primary} />
        <Text style={styles.headerTitle}>My Bookings</Text>
        <TouchableOpacity style={styles.bookButton} onPress={onBookPracticeTest}>
          <Plus size={16} color={Colors.white} />
          <Text style={styles.bookButtonText}>Book</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Action */}
      <TouchableOpacity style={styles.quickActionCard} onPress={onBookPracticeTest}>
        <View style={styles.quickActionContent}>
          <View style={[styles.quickActionIcon, { backgroundColor: Colors.primary + '10' }]}>
            <Target size={20} color={Colors.primary} />
          </View>
          <View style={styles.quickActionText}>
            <Text style={styles.quickActionTitle}>Book Practice Test</Text>
            <Text style={styles.quickActionSubtitle}>Schedule your next practice test session</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Upcoming Bookings */}
      {upcomingBookings.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming ({upcomingBookings.length})</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.bookingsContainer}
          >
            {upcomingBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Past Bookings */}
      {pastBookings.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Past ({pastBookings.length})</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.bookingsContainer}
          >
            {pastBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Empty State */}
      {bookings.length === 0 && (
        <View style={styles.emptyState}>
          <Calendar size={48} color={Colors.textSecondary} />
          <Text style={styles.emptyTitle}>No Bookings Yet</Text>
          <Text style={styles.emptySubtitle}>
            Book your first practice test or workout session to get started
          </Text>
          <TouchableOpacity style={styles.emptyActionButton} onPress={onBookPracticeTest}>
            <Plus size={16} color={Colors.white} />
            <Text style={styles.emptyActionButtonText}>Book Your First Session</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    margin: 16,
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  bookButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  quickActionCard: {
    backgroundColor: Colors.primary + '10',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  quickActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionText: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  bookingsContainer: {
    gap: 12,
    paddingRight: 16,
  },
  bookingCard: {
    width: 280,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  typeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookingInfo: {
    flex: 1,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  bookingDate: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  bookingDetails: {
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  emptyActionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.white,
  },
});
