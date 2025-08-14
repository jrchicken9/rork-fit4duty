import Colors from './colors';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const borderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const shadows = {
  light: {
    shadowColor: Colors.shadows.light,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 1,
  },
  medium: {
    shadowColor: Colors.shadows.medium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  heavy: {
    shadowColor: Colors.shadows.heavy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
  },
  colored: {
    shadowColor: Colors.shadows.colored,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  premium: {
    shadowColor: Colors.shadows.premium,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
};

export const typography = {
  // Display styles
  displayLarge: {
    fontSize: 32,
    fontWeight: '800' as const,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  displayMedium: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  displaySmall: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
    letterSpacing: -0.2,
  },

  // Heading styles
  headingLarge: {
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
    letterSpacing: -0.1,
  },
  headingMedium: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 26,
    letterSpacing: -0.1,
  },
  headingSmall: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
    letterSpacing: -0.1,
  },

  // Body styles
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },

  // Label styles
  labelLarge: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
    letterSpacing: 0.1,
  },
  labelSmall: {
    fontSize: 10,
    fontWeight: '600' as const,
    lineHeight: 14,
    letterSpacing: 0.1,
  },
};

export const componentStyles = {
  // Enhanced Card styles
  card: {
    backgroundColor: Colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 0.5,
    borderColor: Colors.border + '40',
    ...shadows.light,
  },
  cardElevated: {
    backgroundColor: Colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 0.5,
    borderColor: Colors.border + '20',
    ...shadows.medium,
  },
  cardHeavy: {
    backgroundColor: Colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.heavy,
  },
  cardPremium: {
    backgroundColor: Colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: Colors.primary + '10',
    ...shadows.premium,
  },

  // Enhanced Button styles
  button: {
    primary: {
      backgroundColor: Colors.primary,
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      ...shadows.medium,
    },
    secondary: {
      backgroundColor: Colors.secondary,
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      ...shadows.light,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: Colors.primary,
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    ghost: {
      backgroundColor: Colors.primary + '08',
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    premium: {
      backgroundColor: Colors.accent,
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      ...shadows.colored,
    },
  },

  // Enhanced Input styles
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: 16,
    ...shadows.light,
  },
  inputFocused: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: 16,
    ...shadows.medium,
  },

  // Badge styles
  badge: {
    primary: {
      backgroundColor: Colors.primary + '10',
      borderRadius: borderRadius.full,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
    },
    success: {
      backgroundColor: Colors.success + '10',
      borderRadius: borderRadius.full,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
    },
    warning: {
      backgroundColor: Colors.warning + '10',
      borderRadius: borderRadius.full,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
    },
    error: {
      backgroundColor: Colors.error + '10',
      borderRadius: borderRadius.full,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
    },
  },
};

export const helpStyles = {
  helpCard: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    margin: spacing.sm,
    padding: spacing.md,
    ...shadows.light,
  },
  helpIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: spacing.sm,
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  helpDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
};

export const layout = {
  // Container styles
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  center: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  spaceBetween: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
};

export const animations = {
  // Animation configurations
  spring: {
    tension: 100,
    friction: 8,
  },
  timing: {
    duration: 300,
  },
  easing: {
    ease: 'easeInOut',
  },
};

export const iconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export default {
  spacing,
  borderRadius,
  shadows,
  typography,
  componentStyles,
  helpStyles,
  layout,
  animations,
  iconSizes,
};
