import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { brandColors } from '../styles/brand';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Basic validation
    if (!email.trim() || !password.trim()) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      setIsSubmitting(false);
      return;
    }

    if (!email.includes('@')) {
      setError('올바른 이메일 형식을 입력해주세요.');
      setIsSubmitting(false);
      return;
    }

    try {
      await login(email, password);
      navigate('/admin/dashboard', { replace: true });
    } catch (error: any) {
      setError(error.message || '로그인 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Pre-fill for development
  const fillDemoCredentials = () => {
    setEmail('admin@miiracer.com');
    setPassword('admin123!');
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${brandColors.neutral.gray50} 0%, ${brandColors.neutral.gray200} 100%)`,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(/miiracer-logo.jpg)',
          backgroundSize: '200px',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'top 20px right 20px',
          opacity: 0.05,
          pointerEvents: 'none',
        },
      }}
    >
      <Card 
        sx={{ 
          maxWidth: 450, 
          width: '100%', 
          mx: 2,
          boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
          borderRadius: 3,
          border: `2px solid ${brandColors.primary.main}`,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            {/* Logo */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <Box
                component="img"
                src="/miiracer-logo.jpg"
                alt="Miiracer Logo"
                sx={{
                  height: 60,
                  width: 'auto',
                  mr: 2,
                }}
              />
            </Box>
            
            <Typography 
              variant="h4" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold', 
                color: brandColors.secondary.main,
                mb: 1,
              }}
            >
              MIIRACER SPORTS SCORE
            </Typography>
            <Typography 
              variant="h5" 
              gutterBottom 
              sx={{ 
                fontWeight: 600,
                color: brandColors.primary.main,
                mb: 1,
              }}
            >
              로그인
            </Typography>
            <Typography 
              color="textSecondary" 
              sx={{ 
                fontSize: '0.95rem',
                fontWeight: 500,
                mb: 1,
              }}
            >
              토너먼트 관리 시스템
            </Typography>
            <Typography 
              variant="caption" 
              color="textSecondary" 
              sx={{ 
                display: 'block',
                backgroundColor: brandColors.neutral.gray50,
                padding: 1,
                borderRadius: 1,
                border: `1px solid ${brandColors.neutral.gray200}`,
              }}
            >
              🔒 숨겨진 관리자 전용 페이지
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="이메일"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
              autoComplete="email"
              autoFocus
            />
            
            <TextField
              fullWidth
              label="비밀번호"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={togglePasswordVisibility}
                      edge="end"
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              autoComplete="current-password"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isSubmitting}
              sx={{ 
                mt: 3, 
                mb: 2, 
                py: 1.5,
                backgroundColor: brandColors.primary.main,
                '&:hover': {
                  backgroundColor: brandColors.primary.dark,
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 20px rgba(229, 30, 46, 0.3)',
                },
                '&:disabled': {
                  backgroundColor: brandColors.neutral.gray400,
                },
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 2,
                transition: 'all 0.3s ease',
              }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                '로그인'
              )}
            </Button>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography 
                variant="body2" 
                color="textSecondary" 
                sx={{ mb: 2, fontWeight: 500 }}
              >
                🚀 개발용 테스트 계정
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={fillDemoCredentials}
                sx={{ 
                  mr: 1, 
                  mb: 2,
                  borderColor: brandColors.primary.main,
                  color: brandColors.primary.main,
                  '&:hover': {
                    borderColor: brandColors.primary.main,
                    backgroundColor: brandColors.primary.main,
                    color: brandColors.primary.contrast,
                  },
                }}
              >
                데모 계정 입력
              </Button>
              <Box sx={{ 
                mt: 2, 
                p: 2, 
                backgroundColor: brandColors.neutral.gray100, 
                borderRadius: 2,
                border: `1px solid ${brandColors.neutral.gray300}`,
              }}>
                <Typography variant="body2" color="textSecondary" sx={{ lineHeight: 1.6 }}>
                  <strong>이메일:</strong> admin@miiracer.com<br />
                  <strong>비밀번호:</strong> admin123!
                </Typography>
              </Box>
            </Box>

            <Box sx={{ 
              mt: 3, 
              p: 2, 
              backgroundColor: brandColors.success.main + '15',
              borderRadius: 2,
              border: `1px solid ${brandColors.success.main}40`,
              textAlign: 'center',
            }}>
              <Typography variant="body2" color="textSecondary" sx={{ lineHeight: 1.6, fontWeight: 500 }}>
                💡 <strong>일반 참가자</strong>는 회원가입 없이<br />
                참가신청 및 대진표 확인이 가능합니다<br />
                <Typography component="span" variant="caption" sx={{ color: brandColors.neutral.gray600 }}>
                  홈페이지에서 바로 참가신청하세요!
                </Typography>
              </Typography>
            </Box>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button 
                component={Link} 
                to="/" 
                variant="text" 
                sx={{ 
                  textDecoration: 'none',
                  color: brandColors.neutral.gray600,
                  '&:hover': {
                    color: brandColors.primary.main,
                    backgroundColor: 'transparent',
                  },
                  fontWeight: 500,
                }}
              >
                ← 홈으로 돌아가기
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminLogin;