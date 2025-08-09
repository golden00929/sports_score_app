import React from 'react';
import { Typography, Box, Card, CardContent, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const ResultsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        🏅 대회 결과
      </Typography>

      <Card sx={{ maxWidth: 600, mx: 'auto' }}>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h6" gutterBottom>
            🎯 결과 페이지 준비 중
          </Typography>
          <Typography color="textSecondary" paragraph>
            실시간 경기 결과와 순위가 곧 공개됩니다.
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            포함 예정 기능:
          </Typography>
          <ul style={{ textAlign: 'left', display: 'inline-block' }}>
            <li>실시간 경기 결과</li>
            <li>자동 순위 계산</li>
            <li>경기 통계 및 기록</li>
            <li>결과 공유 기능</li>
            <li>최종 순위 발표</li>
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

export default ResultsPage;