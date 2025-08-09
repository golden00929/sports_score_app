// Miiracer Brand Design System
export const brandColors = {
  primary: {
    main: '#E51E2E',      // Miiracer Red (from logo)
    light: '#FF4558',     // Lighter red for hover states
    dark: '#B71C1C',      // Darker red for pressed states
    contrast: '#FFFFFF'   // White text on red background
  },
  secondary: {
    main: '#000000',      // Miiracer Black (from logo)
    light: '#424242',     // Light gray for secondary text
    dark: '#000000',      // Pure black
    contrast: '#FFFFFF'   // White text on black background
  },
  neutral: {
    white: '#FFFFFF',
    gray50: '#FAFAFA',
    gray100: '#F5F5F5',
    gray200: '#EEEEEE',
    gray300: '#E0E0E0',
    gray400: '#BDBDBD',
    gray500: '#9E9E9E',
    gray600: '#757575',
    gray700: '#616161',
    gray800: '#424242',
    gray900: '#212121'
  },
  success: {
    main: '#4CAF50',
    light: '#81C784',
    dark: '#388E3C'
  },
  warning: {
    main: '#FF9800',
    light: '#FFB74D',
    dark: '#F57C00'
  },
  error: {
    main: '#F44336',
    light: '#E57373',
    dark: '#D32F2F'
  },
  // Tournament specific colors
  tournament: {
    gradeA: '#E51E2E',    // A조 - Primary Red
    gradeB: '#FF9800',    // B조 - Orange
    gradeC: '#4CAF50',    // C조 - Green
    court: '#E0E0E0',     // Court background
    bracket: '#F5F5F5'    // Bracket background
  }
};

export const brandTypography = {
  fontFamily: {
    primary: '"Roboto", "Helvetica", "Arial", sans-serif',
    secondary: '"Inter", "Roboto", sans-serif',
    mono: '"Roboto Mono", monospace'
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '4rem'     // 64px
  },
  fontWeight: {
    thin: 100,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900
  },
  lineHeight: {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2
  }
};

export const brandSpacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '0.75rem',   // 12px
  lg: '1rem',      // 16px
  xl: '1.5rem',    // 24px
  '2xl': '2rem',   // 32px
  '3xl': '3rem',   // 48px
  '4xl': '4rem',   // 64px
  '5xl': '6rem',   // 96px
  '6xl': '8rem'    // 128px
};

export const brandRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px'
};

export const brandShadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  miiracer: `0 4px 20px 0 rgba(229, 30, 46, 0.15)` // Custom red shadow
};

// Component specific styling
export const brandComponents = {
  button: {
    primary: {
      backgroundColor: brandColors.primary.main,
      color: brandColors.primary.contrast,
      '&:hover': {
        backgroundColor: brandColors.primary.light,
      },
      '&:active': {
        backgroundColor: brandColors.primary.dark,
      }
    },
    secondary: {
      backgroundColor: 'transparent',
      color: brandColors.primary.main,
      border: `2px solid ${brandColors.primary.main}`,
      '&:hover': {
        backgroundColor: brandColors.primary.main,
        color: brandColors.primary.contrast,
      }
    }
  },
  card: {
    backgroundColor: brandColors.neutral.white,
    borderRadius: brandRadius.lg,
    boxShadow: brandShadows.md,
    border: `1px solid ${brandColors.neutral.gray200}`
  },
  header: {
    backgroundColor: brandColors.neutral.white,
    borderBottom: `2px solid ${brandColors.primary.main}`,
    boxShadow: brandShadows.sm
  }
};