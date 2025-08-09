import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from 'react-query';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import './i18n';

// Import pages
import HomePage from './pages/HomePage';
import TournamentPage from './pages/TournamentPage';
import RegistrationPage from './pages/RegistrationPage';
import BracketPage from './pages/BracketPage';
import SchedulePage from './pages/SchedulePage';
import ResultsPage from './pages/ResultsPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

// Import components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import { brandColors, brandTypography, brandRadius, brandShadows } from './styles/brand';

// Create theme with Miiracer brand colors
const theme = createTheme({
  palette: {
    primary: {
      main: brandColors.primary.main,      // #E51E2E - Miiracer Red
      light: brandColors.primary.light,    // #FF4558
      dark: brandColors.primary.dark,      // #B71C1C
      contrastText: brandColors.primary.contrast, // #FFFFFF
    },
    secondary: {
      main: brandColors.secondary.main,    // #000000 - Miiracer Black
      light: brandColors.secondary.light,  // #424242
      contrastText: brandColors.secondary.contrast, // #FFFFFF
    },
    background: {
      default: brandColors.neutral.gray50,  // #FAFAFA - Light background
      paper: brandColors.neutral.white,     // #FFFFFF - White cards
    },
    text: {
      primary: brandColors.secondary.main,      // #000000 - Primary text
      secondary: brandColors.neutral.gray600,   // #757575 - Secondary text
    },
    success: {
      main: brandColors.success.main,      // #4CAF50
    },
    warning: {
      main: brandColors.warning.main,      // #FF9800
    },
    error: {
      main: brandColors.error.main,        // #F44336
    },
  },
  typography: {
    fontFamily: brandTypography.fontFamily.primary,
    h1: {
      fontWeight: brandTypography.fontWeight.bold,
      fontSize: brandTypography.fontSize['5xl'],  // 48px
      lineHeight: brandTypography.lineHeight.tight,
      color: brandColors.secondary.main,
    },
    h2: {
      fontWeight: brandTypography.fontWeight.semibold,
      fontSize: brandTypography.fontSize['4xl'],  // 36px
      lineHeight: brandTypography.lineHeight.tight,
      color: brandColors.secondary.main,
    },
    h3: {
      fontWeight: brandTypography.fontWeight.semibold,
      fontSize: brandTypography.fontSize['3xl'],  // 30px
      lineHeight: brandTypography.lineHeight.snug,
      color: brandColors.secondary.main,
    },
    h4: {
      fontWeight: brandTypography.fontWeight.medium,
      fontSize: brandTypography.fontSize['2xl'],  // 24px
      color: brandColors.secondary.main,
    },
    h5: {
      fontWeight: brandTypography.fontWeight.medium,
      fontSize: brandTypography.fontSize.xl,     // 20px
      color: brandColors.secondary.main,
    },
    h6: {
      fontWeight: brandTypography.fontWeight.medium,
      fontSize: brandTypography.fontSize.lg,     // 18px
      color: brandColors.secondary.main,
    },
    body1: {
      fontSize: brandTypography.fontSize.base,    // 16px
      lineHeight: brandTypography.lineHeight.normal,
    },
    body2: {
      fontSize: brandTypography.fontSize.sm,      // 14px
      lineHeight: brandTypography.lineHeight.normal,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: brandTypography.fontWeight.semibold,
          borderRadius: brandRadius.lg,            // 8px
          padding: '12px 24px',
          fontSize: brandTypography.fontSize.base,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: brandShadows.md,
          },
        },
        containedPrimary: {
          backgroundColor: brandColors.primary.main,
          color: brandColors.primary.contrast,
          '&:hover': {
            backgroundColor: brandColors.primary.light,
            boxShadow: brandShadows.miiracer,     // Custom red shadow
          },
          '&:active': {
            backgroundColor: brandColors.primary.dark,
          },
        },
        outlinedPrimary: {
          borderColor: brandColors.primary.main,
          color: brandColors.primary.main,
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
            backgroundColor: brandColors.primary.main,
            color: brandColors.primary.contrast,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: brandRadius.xl,            // 12px
          boxShadow: brandShadows.md,
          border: `1px solid ${brandColors.neutral.gray200}`,
          backgroundColor: brandColors.neutral.white,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: brandColors.neutral.white,
          color: brandColors.secondary.main,
          boxShadow: brandShadows.sm,
          borderBottom: `2px solid ${brandColors.primary.main}`,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: brandRadius.full,
          fontWeight: brandTypography.fontWeight.medium,
        },
        colorPrimary: {
          backgroundColor: brandColors.primary.main,
          color: brandColors.primary.contrast,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: brandRadius.lg,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: brandColors.primary.main,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: brandColors.primary.main,
              borderWidth: '2px',
            },
          },
        },
      },
    },
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <Router>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Layout />}>
                  <Route index element={<HomePage />} />
                  <Route path="tournament" element={<TournamentPage />} />
                  <Route path="register" element={<RegistrationPage />} />
                  <Route path="bracket" element={<BracketPage />} />
                  <Route path="schedule" element={<SchedulePage />} />
                  <Route path="results" element={<ResultsPage />} />
                </Route>

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route 
                  path="/admin/*" 
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </Router>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
