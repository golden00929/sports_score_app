import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Divider,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import apiService from '../services/api';
import { brandColors } from '../styles/brand';
import PromoCarousel from '../components/PromoCarousel';
import { useAuth } from '../contexts/AuthContext';
import { formatDate, formatDateRange } from '../utils/dateFormat';

// Icons
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated, admin } = useAuth();
  const [selectedTournament, setSelectedTournament] = useState<any>(null);

  const { data: tournamentData, isLoading } = useQuery(
    'tournament-info',
    () => apiService.getTournamentInfo(),
    {
      onError: (error) => {
        console.error('Failed to fetch tournament info:', error);
      },
    }
  );

  const { data: allTournamentsData } = useQuery(
    'all-tournaments',
    () => apiService.getAllTournaments(),
    {
      onError: (error) => {
        console.error('Failed to fetch tournaments:', error);
      },
    }
  );

  const { data: slidesData } = useQuery(
    'promo-slides',
    () => fetch('/api/slides').then(res => res.json()),
    {
      onError: (error) => {
        console.error('Failed to fetch slides:', error);
      },
    }
  );

  const tournament = tournamentData?.data;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography variant="h6">Loading...</Typography>
      </Box>
    );
  }


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'primary';
      case 'ongoing': return 'success';
      case 'completed': return 'default';
      default: return 'default';
    }
  };

  // Promotional slides data - DB에서 가져오거나 기본값 사용
  const promoSlides = slidesData?.success && slidesData.data.length > 0 
    ? slidesData.data.map((slide: any) => ({
        id: slide.id,
        image: slide.imageUrl || '/images/promo/sample-promo-1.svg',
        title: slide.title,
        subtitle: slide.subtitle,
        description: slide.description,
      }))
    : [
        {
          id: 'slide-1',
          image: '/images/promo/sample-promo-1.svg',
          title: tournament?.name || 'Miiracer Sports Score Tournament',
          subtitle: '2024 베트남 호치민 배드민턴 챔피언십',
          description: tournament?.description || 'Miiracer Sports Score가 제공하는 프리미엄 배드민턴 토너먼트! A조부터 C조까지 모든 레벨의 선수가 참가할 수 있으며, 실시간 스코어 관리 시스템을 제공합니다.',
        },
        {
          id: 'slide-2',
          image: '/images/promo/sample-promo-2.svg',
          title: '총 상금 50,000,000₫',
          subtitle: 'Miiracer Sports Score 시스템',
          description: '실시간 경기 결과 · 자동 대진표 생성 · 선수 통계 분석 기능을 제공하는 최첨단 토너먼트 관리 시스템',
        },
        {
          id: 'slide-3',
          image: '/images/promo/sample-promo-3.svg',
          title: '호치민에서 만나요!',
          subtitle: 'Saigon Sports Complex',
          description: `${tournament?.startDate ? formatDate(tournament.startDate, 'long') : '01/12/2024 (일요일)'} · 호치민시 7군 스포츠 센터 · 참가비 ${tournament?.participantFee?.toLocaleString() || '200,000'}₫`,
        },
      ];

  return (
    <Box>
      {/* Latest Update Banner */}
      <Paper
        elevation={2}
        sx={{
          background: `linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)`,
          color: 'white',
          p: 3,
          mb: 3,
          borderRadius: 2,
          textAlign: 'center',
        }}
      >
        <Typography variant="h5" gutterBottom fontWeight="bold">
          🚀 최신 업데이트! v2.0 | Aug 9, 2025
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.95 }}>
          새로운 대회 관리 시스템이 업데이트되었습니다! 실시간 대회 현황과 참가 신청 기능을 확인해보세요.
        </Typography>
      </Paper>

      {/* Admin Welcome Message */}
      {isAuthenticated && (
        <Paper
          elevation={0}
          sx={{
            background: `linear-gradient(135deg, ${brandColors.success.main} 0%, ${brandColors.success.light || '#81C784'} 100%)`,
            color: 'white',
            p: 2,
            mb: 3,
            borderRadius: 2,
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" gutterBottom fontWeight="bold">
            👋 환영합니다, {admin?.name || '관리자'}님!
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            관리자 권한으로 로그인되었습니다. 대진표 생성 및 토너먼트 관리가 가능합니다.
          </Typography>
        </Paper>
      )}

      {/* Promotional Carousel */}
      <Box sx={{ mb: 4 }}>
        <PromoCarousel 
          slides={promoSlides}
          autoSlide={true}
          interval={6000}
          height={500}
        />
      </Box>

      {/* Tournament List Section */}
      {allTournamentsData?.success && allTournamentsData.data.length > 0 && (
        <Paper elevation={0} sx={{ mb: 4, borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ 
            background: `linear-gradient(135deg, ${brandColors.primary.main} 0%, ${brandColors.primary.light} 100%)`,
            color: brandColors.primary.contrast,
            p: 3,
            textAlign: 'center'
          }}>
            <Typography variant="h5" fontWeight="bold">
              🏆 진행중인 대회
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
              참가할 대회를 선택하세요
            </Typography>
          </Box>
          
          <List sx={{ p: 0 }}>
            {allTournamentsData.data.map((tournament: any, index: number) => (
              <React.Fragment key={tournament.id}>
                <ListItem disablePadding>
                  <ListItemButton 
                    onClick={() => setSelectedTournament(tournament)}
                    selected={selectedTournament?.id === tournament.id}
                    sx={{
                      py: 2,
                      px: 3,
                      '&.Mui-selected': {
                        backgroundColor: `${brandColors.primary.main}15`,
                        borderLeft: `4px solid ${brandColors.primary.main}`,
                      },
                      '&:hover': {
                        backgroundColor: `${brandColors.primary.main}08`,
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ 
                        bgcolor: tournament.status === 'ongoing' ? brandColors.success.main :
                               tournament.status === 'completed' ? brandColors.neutral.gray500 :
                               brandColors.warning.main,
                        width: 48, height: 48
                      }}>
                        🏸
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="h6" fontWeight="bold">
                            {tournament.name}
                          </Typography>
                          <Chip 
                            label={
                              tournament.status === 'ongoing' ? '진행중' :
                              tournament.status === 'completed' ? '완료' :
                              '예정'
                            }
                            sx={{
                              backgroundColor: tournament.status === 'ongoing' ? brandColors.success.main :
                                             tournament.status === 'completed' ? brandColors.neutral.gray400 :
                                             brandColors.warning.main,
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.75rem'
                            }}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            📅 {formatDate(tournament.startDate)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            📍 {tournament.location}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            👥 {tournament.stats.approvedParticipants}/{tournament.maxParticipants}명
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            🏆 {tournament.stats.totalBrackets}개 종목
                          </Typography>
                        </Box>
                      }
                    />
                    <Button
                      onClick={() => setSelectedTournament(tournament)}
                      variant="contained"
                      size="small"
                      sx={{
                        ml: 2,
                        minWidth: 60,
                        backgroundColor: selectedTournament?.id === tournament.id ? 
                                       brandColors.primary.main : 
                                       brandColors.primary.light,
                        color: 'white',
                        fontWeight: 600,
                        '&:hover': {
                          backgroundColor: brandColors.primary.dark,
                        },
                      }}
                    >
                      선택
                    </Button>
                  </ListItemButton>
                </ListItem>
                {index < allTournamentsData.data.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      {/* Selected Tournament Details - Only Summary */}
      {selectedTournament && (
        <Paper elevation={0} sx={{ mb: 4, borderRadius: 3, overflow: 'hidden' }}>

          {/* Selected Tournament Summary - Simplified */}
          <Box sx={{ p: 4, backgroundColor: brandColors.neutral.gray50 }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, textAlign: 'center', color: brandColors.primary.main }}>
              대회 정보 요약
            </Typography>
            
            <Grid container spacing={3} sx={{ maxWidth: '800px', mx: 'auto' }}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" color="textPrimary" sx={{ minWidth: '100px', fontWeight: 600 }}>
                    대회명:
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    {selectedTournament.name}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" color="textPrimary" sx={{ minWidth: '100px', fontWeight: 600 }}>
                    기간:
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    {formatDateRange(selectedTournament.startDate, selectedTournament.endDate)}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" color="textPrimary" sx={{ minWidth: '100px', fontWeight: 600 }}>
                    장소:
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    {selectedTournament.location}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" color="textPrimary" sx={{ minWidth: '100px', fontWeight: 600 }}>
                    참가인원:
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    {selectedTournament.stats.approvedParticipants}/{selectedTournament.maxParticipants}명
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" color="textPrimary" sx={{ minWidth: '100px', fontWeight: 600 }}>
                    참가비:
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    {selectedTournament.participantFee?.toLocaleString() || '0'}₫
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" color="textPrimary" sx={{ minWidth: '100px', fontWeight: 600 }}>
                    레벨범위:
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    A조 ~ C조 (모든 레벨)
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      )}

      {/* Default Tournament Info Section (when no tournament selected) */}
      {!selectedTournament && (
        <>
      <Paper
        elevation={0}
        sx={{
          background: `linear-gradient(135deg, ${brandColors.primary.main} 0%, ${brandColors.primary.light} 100%)`,
          color: brandColors.primary.contrast,
          p: 4,
          mb: 4,
          borderRadius: 3,
          textAlign: 'center',
        }}
      >
        <Typography 
          variant="h5" 
          gutterBottom 
          fontWeight="bold"
          sx={{
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            mb: 3,
          }}
        >
          빠른 정보
        </Typography>
        
        <Box display="flex" gap={2} justifyContent="center" alignItems="center" flexWrap="wrap">
          <Chip
            icon={<CalendarTodayIcon />}
            label={tournament?.startDate ? formatDate(tournament.startDate, 'long') : '날짜 미정'}
            sx={{ 
              backgroundColor: 'rgba(255,255,255,0.15)', 
              color: 'white',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              fontWeight: 500,
            }}
          />
          <Chip
            icon={<LocationOnIcon />}
            label={tournament?.location || '호치민시 스포츠 센터'}
            sx={{ 
              backgroundColor: 'rgba(255,255,255,0.15)', 
              color: 'white',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              fontWeight: 500,
            }}
          />
          {tournament?.stats?.isRegistrationOpen && (
            <Chip
              label="🟢 신청 접수 중"
              sx={{ 
                backgroundColor: brandColors.success.main,
                color: 'white',
                fontWeight: 600,
              }}
            />
          )}
          {tournament?.status && (
            <Chip
              label={t(`tournament.status.${tournament.status}`)}
              color={getStatusColor(tournament.status) as any}
              variant="filled"
            />
          )}
        </Box>

        {tournament?.stats?.isRegistrationOpen && (
          <Button
            component={Link}
            to="/register"
            variant="contained"
            size="large"
            sx={{
              mt: 3,
              backgroundColor: brandColors.neutral.white,
              color: brandColors.primary.main,
              fontWeight: 700,
              py: 1.5,
              px: 4,
              fontSize: '1.1rem',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.95)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
              },
              transition: 'all 0.3s ease',
            }}
          >
지금 바로 참가 신청
          </Button>
        )}
      </Paper>

      {/* Tournament Stats */}
      {tournament?.stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box
                  sx={{ 
                    bgcolor: brandColors.primary.main, 
                    mx: 'auto', 
                    mb: 2,
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      position: 'relative',
                    }}
                  >
                    {/* Person icon - simple geometric */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: 'white',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 14,
                        height: 10,
                        borderRadius: '7px 7px 0 0',
                        backgroundColor: 'white',
                      }}
                    />
                  </Box>
                </Box>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: brandColors.primary.main,
                    fontWeight: 'bold',
                  }}
                >
                  {tournament.stats.approvedParticipants}
                </Typography>
                <Typography color="textSecondary">
                  {t('tournament.current_participants')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box
                  sx={{ 
                    bgcolor: brandColors.success.main, 
                    mx: 'auto', 
                    mb: 2,
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: 20,
                      height: 24,
                      position: 'relative',
                    }}
                  >
                    {/* Trophy icon - simple geometric */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 12,
                        height: 8,
                        backgroundColor: 'white',
                        borderRadius: '6px 6px 0 0',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 2,
                        height: 10,
                        backgroundColor: 'white',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 16,
                        height: 3,
                        backgroundColor: 'white',
                        borderRadius: '1px',
                      }}
                    />
                  </Box>
                </Box>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: brandColors.success.main,
                    fontWeight: 'bold',
                  }}
                >
                  {tournament.stats.availableSlots}
                </Typography>
                <Typography color="textSecondary">
                  {t('tournament.available_slots')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box
                  sx={{ 
                    bgcolor: brandColors.warning.main, 
                    mx: 'auto', 
                    mb: 2,
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      position: 'relative',
                    }}
                  >
                    {/* Calendar icon - simple geometric */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        border: '2px solid white',
                        borderRadius: '2px',
                        backgroundColor: 'transparent',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 4,
                        left: 0,
                        right: 0,
                        height: '2px',
                        backgroundColor: 'white',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -2,
                        left: 4,
                        width: '2px',
                        height: '6px',
                        backgroundColor: 'white',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -2,
                        right: 4,
                        width: '2px',
                        height: '6px',
                        backgroundColor: 'white',
                      }}
                    />
                  </Box>
                </Box>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: brandColors.warning.main,
                    fontWeight: 'bold',
                  }}
                >
                  D-{Math.abs(tournament.stats.daysUntilStart)}
                </Typography>
                <Typography color="textSecondary">
                  대회 시작까지
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box
                  sx={{ 
                    bgcolor: brandColors.secondary.main, 
                    mx: 'auto', 
                    mb: 2,
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: 18,
                      height: 18,
                      position: 'relative',
                    }}
                  >
                    {/* Money/Coin icon - simple geometric */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        border: '2px solid white',
                        borderRadius: '50%',
                        backgroundColor: 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '&::after': {
                          content: '"₫"',
                          color: 'white',
                          fontSize: '10px',
                          fontWeight: 'bold',
                        },
                      }}
                    />
                  </Box>
                </Box>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: brandColors.secondary.main,
                    fontWeight: 'bold',
                  }}
                >
                  {tournament.participantFee?.toLocaleString() || '0'}₫
                </Typography>
                <Typography color="textSecondary">
                  {t('tournament.fee')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
        </>
      )}

      {/* Quick Actions */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            height: '100%',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: `0 8px 25px ${brandColors.primary.main}20`,
            },
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: brandColors.primary.main,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 16,
                      height: 20,
                      position: 'relative',
                    }}
                  >
                    {/* Document/Form icon */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'white',
                        borderRadius: '1px',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 4,
                        left: 3,
                        right: 3,
                        height: '1px',
                        backgroundColor: brandColors.primary.main,
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 7,
                        left: 3,
                        right: 3,
                        height: '1px',
                        backgroundColor: brandColors.primary.main,
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 10,
                        left: 3,
                        width: 6,
                        height: '1px',
                        backgroundColor: brandColors.primary.main,
                      }}
                    />
                  </Box>
                </Box>
                <Typography variant="h6" fontWeight="bold">
                  {t('nav.registration')}
                </Typography>
              </Box>
              <Typography color="textSecondary" paragraph sx={{ mb: 3 }}>
                Miiracer Sports Score 시스템으로 대회에 참가하세요. 5단계 간편 등록과 실시간 경기 결과 추적이 가능합니다.
              </Typography>
              <Button
                component={Link}
                to="/register"
                variant="contained"
                fullWidth
                disabled={!tournament?.stats?.isRegistrationOpen}
                sx={{
                  py: 1.5,
                  fontWeight: 600,
                  fontSize: '1rem',
                }}
              >
                참가 신청하기
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ 
            height: '100%',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: `0 8px 25px ${brandColors.success.main}20`,
            },
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: brandColors.success.main,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 20,
                      height: 16,
                      position: 'relative',
                    }}
                  >
                    {/* Tournament Bracket icon */}
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: '2px',
                        height: '6px',
                        backgroundColor: 'white',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 0,
                        top: 10,
                        width: '2px',
                        height: '6px',
                        backgroundColor: 'white',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 0,
                        top: 5,
                        width: '8px',
                        height: '2px',
                        backgroundColor: 'white',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 8,
                        top: 2,
                        width: '2px',
                        height: '12px',
                        backgroundColor: 'white',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 10,
                        top: 7,
                        width: '10px',
                        height: '2px',
                        backgroundColor: 'white',
                      }}
                    />
                  </Box>
                </Box>
                <Typography variant="h6" fontWeight="bold">
                  {t('nav.bracket')}
                </Typography>
              </Box>
              <Typography color="textSecondary" paragraph sx={{ mb: 3 }}>
                Sports Score 시스템으로 A조부터 C조까지 모든 대진표를 확인하세요. 5가지 경기 종목별 실시간 점수 업데이트를 제공합니다.
              </Typography>
              <Button
                component={Link}
                to="/bracket"
                variant="outlined"
                fullWidth
                sx={{
                  py: 1.5,
                  fontWeight: 600,
                  fontSize: '1rem',
                }}
              >
                대진표 보기
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ 
            height: '100%',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: `0 8px 25px ${brandColors.warning.main}20`,
            },
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: brandColors.warning.main,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 18,
                      height: 18,
                      position: 'relative',
                    }}
                  >
                    {/* Results/Chart icon */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: '2px',
                        left: '2px',
                        width: '2px',
                        height: '6px',
                        backgroundColor: 'white',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: '2px',
                        left: '6px',
                        width: '2px',
                        height: '10px',
                        backgroundColor: 'white',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: '2px',
                        left: '10px',
                        width: '2px',
                        height: '8px',
                        backgroundColor: 'white',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: '2px',
                        right: '2px',
                        width: '2px',
                        height: '4px',
                        backgroundColor: 'white',
                      }}
                    />
                  </Box>
                </Box>
                <Typography variant="h6" fontWeight="bold">
                  {t('nav.results')}
                </Typography>
              </Box>
              <Typography color="textSecondary" paragraph sx={{ mb: 3 }}>
                Miiracer Sports Score로 모든 경기 결과와 실시간 순위를 확인하세요. 상세한 경기 통계와 선수별 성과 분석을 제공합니다.
              </Typography>
              <Button
                component={Link}
                to="/results"
                variant="outlined"
                fullWidth
                sx={{
                  py: 1.5,
                  fontWeight: 600,
                  fontSize: '1rem',
                }}
              >
                결과 보기
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Version Info */}
      <Box sx={{ textAlign: 'center', mt: 4, py: 2, opacity: 0.7 }}>
        <Typography variant="caption" color="text.secondary">
          Miiracer Badminton v2.0 | Updated: Aug 9, 2025
        </Typography>
      </Box>
    </Box>
  );
};

export default HomePage;