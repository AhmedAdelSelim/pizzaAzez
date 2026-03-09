export const COLORS = {
  primary: '#E85D2C',
  primaryLight: '#FF7B4F',
  primaryDark: '#C44A1E',
  secondary: '#F4A442',
  secondaryLight: '#FFB95E',
  background: '#1A1A2E',
  backgroundLight: '#16213E',
  surface: '#232946',
  surfaceLight: '#2D3561',
  text: '#FFFFFE',
  textSecondary: '#EEBBC3',
  textMuted: '#8B8FA3',
  accent: '#00C9A7',
  accentLight: '#33D4B8',
  error: '#FF6B6B',
  success: '#00C9A7',
  warning: '#F4A442',
  border: '#3A3F5C',
  overlay: 'rgba(0,0,0,0.5)',
  white: '#FFFFFF',
  black: '#000000',
  star: '#FFD700',
};

export const FONTS = {
  light: { fontWeight: '300' },
  regular: { fontWeight: '400' },
  medium: { fontWeight: '500' },
  semiBold: { fontWeight: '600' },
  bold: { fontWeight: '700' },
  extraBold: { fontWeight: '800' },
};

export const SIZES = {
  // Font sizes
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  title: 36,
  hero: 44,

  // Spacing
  spacing_xs: 4,
  spacing_sm: 8,
  spacing_md: 12,
  spacing_base: 16,
  spacing_lg: 20,
  spacing_xl: 24,
  spacing_xxl: 32,
  spacing_xxxl: 40,

  // Border radius
  radius_sm: 8,
  radius_md: 12,
  radius_lg: 16,
  radius_xl: 20,
  radius_xxl: 24,
  radius_full: 999,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: (color = COLORS.primary) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  }),
};
