import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Chip,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import LanguageIcon from '@mui/icons-material/Language';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { brandColors } from '../styles/brand';
import { useAuth } from '../contexts/AuthContext';

const Layout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { admin, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [langMenuAnchor, setLangMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [userMenuAnchor, setUserMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [clickCount, setClickCount] = React.useState(0);
  const [lastClickTime, setLastClickTime] = React.useState(0);

  const handleLanguageClick = (event: React.MouseEvent<HTMLElement>) => {
    setLangMenuAnchor(event.currentTarget);
  };

  const handleLanguageClose = () => {
    setLangMenuAnchor(null);
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    setLangMenuAnchor(null);
  };

  const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    setUserMenuAnchor(null);
  };

  // Hidden admin access - click logo 5 times within 3 seconds
  const handleLogoClick = () => {
    const now = Date.now();
    
    if (now - lastClickTime > 3000) {
      // Reset if more than 3 seconds have passed
      setClickCount(1);
    } else {
      setClickCount(prev => prev + 1);
    }
    
    setLastClickTime(now);
    
    if (clickCount >= 4) { // 5th click (0-indexed)
      // Navigate to admin login
      window.location.href = '/admin/login';
      setClickCount(0);
    }
  };

  const navigationItems = [
    { path: '/', label: t('nav.tournament'), key: 'tournament' },
    { path: '/register', label: t('nav.registration'), key: 'registration' },
    { path: '/bracket', label: t('nav.bracket'), key: 'bracket' },
    { path: '/schedule', label: t('nav.schedule'), key: 'schedule' },
    { path: '/results', label: t('nav.results'), key: 'results' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" elevation={2}>
        <Toolbar>
          {/* Logo and Brand */}
          <Box
            onClick={handleLogoClick}
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              cursor: 'pointer',
              userSelect: 'none',
              '&:hover': {
                opacity: 0.8,
              },
            }}
          >
            <Box
              component="img"
              src="/miiracer-logo.jpg"
              alt="Miiracer Logo"
              sx={{
                height: 32,
                width: 'auto',
                mr: 1.5,
              }}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 'bold',
                  color: brandColors.secondary.main,
                  fontSize: '1.25rem',
                  lineHeight: 1,
                  mb: 0.5,
                }}
              >
                MIIRACER SPORTS SCORE
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: brandColors.neutral.gray600,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  letterSpacing: '0.5px',
                }}
              >
                배드민턴 토너먼트 관리 시스템
              </Typography>
            </Box>
          </Box>

          {/* Navigation Links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, mr: 2 }}>
            {navigationItems.map((item) => (
              <Button
                key={item.key}
                component={Link}
                to={item.path}
                color="inherit"
                sx={{
                  color: brandColors.secondary.main,
                  backgroundColor: location.pathname === item.path ? brandColors.primary.main : 'transparent',
                  borderRadius: '8px',
                  px: 2,
                  py: 1,
                  '&:hover': {
                    backgroundColor: location.pathname === item.path 
                      ? brandColors.primary.light 
                      : brandColors.neutral.gray100,
                  },
                  ...(location.pathname === item.path && {
                    color: brandColors.primary.contrast,
                  }),
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* User Menu (Only visible when logged in) */}
          {isAuthenticated && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                icon={<AdminPanelSettingsIcon />}
                label="관리자"
                size="small"
                color="primary"
                variant="outlined"
              />
              <IconButton
                onClick={handleUserMenuClick}
                sx={{
                  color: brandColors.secondary.main,
                  '&:hover': {
                    backgroundColor: brandColors.neutral.gray100,
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: brandColors.primary.main,
                    color: brandColors.primary.contrast,
                    fontSize: '14px',
                    fontWeight: 'bold',
                  }}
                >
                  {admin?.name?.charAt(0)?.toUpperCase() || 'A'}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={userMenuAnchor}
                open={Boolean(userMenuAnchor)}
                onClose={handleUserMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem disabled>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {admin?.name || 'Admin'}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {admin?.email}
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem component={Link} to="/admin/dashboard" onClick={handleUserMenuClose}>
                  <AdminPanelSettingsIcon sx={{ mr: 1, fontSize: 20 }} />
                  관리자 대시보드
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 1, fontSize: 20 }} />
                  로그아웃
                </MenuItem>
              </Menu>
            </Box>
          )}

          {/* Language Selector */}
          <IconButton 
            onClick={handleLanguageClick}
            sx={{ 
              color: brandColors.secondary.main,
              '&:hover': {
                backgroundColor: brandColors.neutral.gray100,
              },
            }}
          >
            <LanguageIcon />
          </IconButton>
          <Menu
            anchorEl={langMenuAnchor}
            open={Boolean(langMenuAnchor)}
            onClose={handleLanguageClose}
          >
            <MenuItem onClick={() => handleLanguageChange('ko')}>
              🇰🇷 한국어
            </MenuItem>
            <MenuItem onClick={() => handleLanguageChange('vi')}>
              🇻🇳 Tiếng Việt
            </MenuItem>
            <MenuItem onClick={() => handleLanguageChange('en')}>
              🇺🇸 English
            </MenuItem>
          </Menu>

          {/* Hidden admin access - click logo 5 times within 3 seconds to access admin login */}
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container component="main" maxWidth="lg" sx={{ flexGrow: 1, py: 3 }}>
        <Outlet />
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: brandColors.secondary.main, // Black footer
          textAlign: 'center',
          borderTop: `3px solid ${brandColors.primary.main}`, // Red accent
        }}
      >
        <Typography 
          variant="body2" 
          sx={{ 
            color: brandColors.neutral.white,
            fontWeight: 500,
            mb: 0.5,
          }}
        >
          © 2024 Miiracer Sports Score - Tournament Management System
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: brandColors.neutral.gray300,
          }}
        >
          🌏 Vietnam • 🇻🇳 Timezone: UTC+7 • Powered by Miiracer Sports
        </Typography>
      </Box>
    </Box>
  );
};

export default Layout;