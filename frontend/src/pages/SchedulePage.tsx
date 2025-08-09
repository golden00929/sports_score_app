import React from 'react';
import { Typography, Box, Card, CardContent, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const SchedulePage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        📅 대회 시간표
      </Typography>

      <Card sx={{ maxWidth: 600, mx: 'auto' }}>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h6" gutterBottom>
            ⏰ 시간표 준비 중
          </Typography>
          <Typography color="textSecondary" paragraph>
            코트별 경기 일정이 곧 공개됩니다.
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            포함 예정 기능:
          </Typography>
          <ul style={{ textAlign: 'left', display: 'inline-block' }}>
            <li>코트별 경기 일정</li>
            <li>실시간 진행 상황</li>
            <li>경기 지연/변경 공지</li>
            <li>베트남 시간대 (UTC+7) 표시</li>
            <li>모바일 알림</li>
          </ul>
          
          <Box sx={{ mt: 3 }}>
            <Button component={Link} to="/" variant="contained">
              홈으로 돌아가기
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SchedulePage;