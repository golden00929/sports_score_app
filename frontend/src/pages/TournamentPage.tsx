import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import apiService from '../services/api';
import { formatDateRange } from '../utils/dateFormat';

// Icons
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PhoneIcon from '@mui/icons-material/Phone';
import FacebookIcon from '@mui/icons-material/Facebook';
import PeopleIcon from '@mui/icons-material/People';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

const TournamentPage: React.FC = () => {
  const { t } = useTranslation();

  const { data: tournamentData, isLoading } = useQuery(
    'tournament-info',
    () => apiService.getTournamentInfo()
  );

  const tournament = tournamentData?.data;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography variant="h6">Loading...</Typography>
      </Box>
    );
  }


  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        🏸 {t('tournament.title')}
      </Typography>

      <Grid container spacing={4}>
        {/* Tournament Basic Info */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                {tournament?.name || 'Tournament Name'}
              </Typography>
              <Typography color="textSecondary" paragraph>
                {tournament?.description || 'Tournament description will be displayed here.'}
              </Typography>

              <List>
                <ListItem>
                  <ListItemIcon>
                    <CalendarTodayIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="대회 일정"
                    secondary={tournament?.startDate ? 
                      formatDateRange(tournament.startDate, tournament.endDate) :
                      '날짜 미정'
                    }
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <LocationOnIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="대회 장소"
                    secondary={`${tournament?.location || '장소 미정'} - ${tournament?.venue || '경기장 미정'}`}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <PeopleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="참가 인원"
                    secondary={`최대 ${tournament?.maxParticipants || 0}명`}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <MonetizationOnIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="참가비"
                    secondary={`${tournament?.participantFee?.toLocaleString() || 0} VND`}
                  />
                </ListItem>

                {tournament?.contactPhone && (
                  <ListItem>
                    <ListItemIcon>
                      <PhoneIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="문의 전화"
                      secondary={tournament.contactPhone}
                    />
                  </ListItem>
                )}

                {tournament?.contactSns && (
                  <ListItem>
                    <ListItemIcon>
                      <FacebookIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="SNS"
                      secondary={
                        <Button
                          href={tournament.contactSns}
                          target="_blank"
                          size="small"
                          color="primary"
                        >
                          Facebook 페이지 방문
                        </Button>
                      }
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>

          {/* Tournament Poster */}
          {tournament?.posterImage && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  대회 포스터
                </Typography>
                <Box sx={{ textAlign: 'center' }}>
                  <img
                    src={`http://localhost:5000/uploads/${tournament.posterImage}`}
                    alt="Tournament Poster"
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                      borderRadius: 8,
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Tournament Status & Registration */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                대회 현황
              </Typography>

              {tournament?.stats && (
                <>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      현재 참가자
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {tournament.stats.approvedParticipants}명
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      남은 자리
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      {tournament.stats.availableSlots}명
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="textSecondary">
                      대회 시작까지
                    </Typography>
                    <Typography variant="h4" color="warning.main">
                      D-{tournament.stats.daysUntilStart}
                    </Typography>
                  </Box>

                  {tournament.stats.isRegistrationOpen ? (
                    <Chip
                      label="🟢 신청 접수 중"
                      color="success"
                      variant="filled"
                      sx={{ mb: 2, width: '100%' }}
                    />
                  ) : (
                    <Chip
                      label="🔴 신청 마감"
                      color="error"
                      variant="filled"
                      sx={{ mb: 2, width: '100%' }}
                    />
                  )}
                </>
              )}

              <Button
                href="/register"
                variant="contained"
                fullWidth
                size="large"
                disabled={!tournament?.stats?.isRegistrationOpen}
              >
                참가 신청하기
              </Button>
            </CardContent>
          </Card>

          {/* Bank Info */}
          {tournament?.bankInfo && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  💳 참가비 입금 정보
                </Typography>
                {(() => {
                  try {
                    const bankInfo = typeof tournament.bankInfo === 'string'
                      ? JSON.parse(tournament.bankInfo)
                      : tournament.bankInfo;
                    
                    return (
                      <List dense>
                        <ListItem>
                          <ListItemText
                            primary="은행명"
                            secondary={bankInfo.bankName}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="계좌번호"
                            secondary={bankInfo.accountNumber}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="예금주"
                            secondary={bankInfo.accountName}
                          />
                        </ListItem>
                      </List>
                    );
                  } catch {
                    return <Typography color="textSecondary">정보 준비 중...</Typography>;
                  }
                })()}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default TournamentPage;