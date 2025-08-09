import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Container,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
} from '@mui/material';
import {
  ExpandMore,
  SportsHandball,
  Visibility,
} from '@mui/icons-material';
import apiService from '../services/api';
import TournamentBracketHorizontal from '../components/TournamentBracketHorizontal';
import RoundRobinMatrix from '../components/RoundRobinMatrix';

interface Bracket {
  id: string;
  name: string;
  skillLevel: string;
  gender: string;
  type: string;
  status: string;
  participants: string;
  createdAt: string;
  matches?: Match[];
}

interface Match {
  id: string;
  roundName: string;
  matchNumber: number;
  player1Id?: string | null;
  player2Id?: string | null;
  player1Name?: string | null;
  player2Name?: string | null;
  player1Score: number;
  player2Score: number;
  winnerId?: string | null;
  status: string;
  scheduledTime?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  notes?: string;
}

interface Participant {
  id: string;
  name: string;
  skillLevel: string;
  eventType: string;
  gender: string;
}

const BracketPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [brackets, setBrackets] = useState<Bracket[]>([]);
  const [tournamentId, setTournamentId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [availableParticipants, setAvailableParticipants] = useState<Participant[]>([]);
  const [visualizerOpen, setVisualizerOpen] = useState(false);
  const [bracketForVisualizer, setBracketForVisualizer] = useState<Bracket | null>(null);

  const loadBracketData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // 먼저 토너먼트 목록을 가져와서 첫 번째 토너먼트 사용
      if (!tournamentId) {
        const tournamentsResponse = await apiService.getAllTournaments();
        console.log('BracketPage - getAllTournaments response:', tournamentsResponse);
        if (tournamentsResponse.success && tournamentsResponse.data && tournamentsResponse.data.length > 0) {
          const firstTournament = tournamentsResponse.data[0];
          console.log('BracketPage - using tournament:', firstTournament);
          setTournamentId(firstTournament.id);
          
          // 첫 번째 토너먼트로 브라켓 로드
          const bracketsResponse = await apiService.getBrackets(firstTournament.id);
          console.log('BracketPage - getBrackets response:', bracketsResponse);
          if (bracketsResponse.success) {
            console.log('BracketPage - setting brackets:', bracketsResponse.data);
            setBrackets(bracketsResponse.data);
          }
        } else {
          setError('사용 가능한 토너먼트가 없습니다.');
          return;
        }
      } else {
        // 이미 tournamentId가 있으면 브라켓만 로드
        const bracketsResponse = await apiService.getBrackets(tournamentId);
        console.log('BracketPage - getBrackets response:', bracketsResponse);
        if (bracketsResponse.success) {
          console.log('BracketPage - setting brackets:', bracketsResponse.data);
          setBrackets(bracketsResponse.data);
        }
      }

      // Load available participants
      const participantsResponse = await apiService.getParticipants({ 
        limit: 1000,
        status: 'approved' 
      });
      if (participantsResponse.success) {
        setAvailableParticipants(participantsResponse.data?.participants || []);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || '브라켓 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    loadBracketData();
  }, [loadBracketData]);

  const openBracketVisualizer = (bracket: Bracket) => {
    setBracketForVisualizer(bracket);
    setVisualizerOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'default';
      case 'published': return 'info';
      case 'ongoing': return 'warning';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return '초안';
      case 'published': return '발표됨';
      case 'ongoing': return '진행중';
      case 'completed': return '완료';
      default: return status;
    }
  };

  const renderBracketView = (bracket: Bracket) => {
    // 디버깅 로그
    console.log('BracketPage - renderBracketView called with bracket:', bracket);
    console.log('BracketPage - bracket.matches:', bracket.matches);
    console.log('BracketPage - bracket.matches length:', bracket.matches?.length || 0);
    
    if (!bracket.matches || bracket.matches.length === 0) {
      return (
        <Alert severity="info">
          <Typography>아직 매치가 배정되지 않았습니다.</Typography>
          <Typography variant="body2">
            디버깅: matches = {bracket.matches ? `배열(길이 ${bracket.matches.length})` : 'undefined'}
          </Typography>
        </Alert>
      );
    }

    if (bracket.type === 'round_robin') {
      return (
        <RoundRobinMatrix
          participants={availableParticipants}
          matches={bracket.matches}
          availableParticipants={availableParticipants}
          onUpdateMatch={() => {}} // 읽기 전용이므로 빈 함수
          onAssignParticipant={() => {}} // 읽기 전용이므로 빈 함수
          onRemoveParticipant={() => {}} // 읽기 전용이므로 빈 함수
          isEditable={false} // 편집 불가
        />
      );
    } else {
      return (
        <TournamentBracketHorizontal
          matches={bracket.matches}
          availableParticipants={availableParticipants}
          onMatchUpdate={() => {}} // 읽기 전용이므로 빈 함수
          onAssignParticipant={() => {}} // 읽기 전용이므로 빈 함수
          onRemoveParticipant={() => {}} // 읽기 전용이므로 빈 함수
          isReadOnly={true} // 읽기 전용 모드
        />
      );
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          🏆 배드민턴 토너먼트 대진표
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Tournament Brackets & Matches
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Existing Brackets */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <SportsHandball sx={{ mr: 1 }} /> 대진표
        </Typography>

        {brackets.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <SportsHandball sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="textSecondary" gutterBottom>
                생성된 대진표가 없습니다
              </Typography>
              <Typography color="textSecondary" paragraph>
                관리자가 대진표를 생성하면 여기서 확인할 수 있습니다.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          brackets.map((bracket) => (
            <Accordion key={bracket.id} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Typography variant="h6">{bracket.name}</Typography>
                  <Chip 
                    label={getStatusLabel(bracket.status)} 
                    color={getStatusColor(bracket.status) as any}
                    size="small"
                  />
                  <Typography variant="body2" color="textSecondary">
                    {bracket.type === 'single_elimination' ? '토너먼트' : '리그전'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {bracket.skillLevel}급 • {bracket.gender === 'male' ? '남성' : bracket.gender === 'female' ? '여성' : '혼성'}
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={(e) => {
                      e.stopPropagation();
                      openBracketVisualizer(bracket);
                    }}
                    startIcon={<Visibility />}
                    sx={{ ml: 'auto' }}
                  >
                    전체 화면으로 보기
                  </Button>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {renderBracketView(bracket)}
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </Box>

      {/* Bracket Visualizer Dialog - 전체 화면 보기 */}
      <Dialog
        open={visualizerOpen}
        onClose={() => {
          setVisualizerOpen(false);
          setBracketForVisualizer(null);
        }}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: { height: '90vh' }
        }}
      >
        <DialogContent sx={{ p: 3 }}>
          {bracketForVisualizer && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" component="h2">
                  🏆 {bracketForVisualizer.name}
                </Typography>
                <Button 
                  variant="outlined" 
                  onClick={() => {
                    setVisualizerOpen(false);
                    setBracketForVisualizer(null);
                  }}
                >
                  닫기
                </Button>
              </Box>
              {renderBracketView(bracketForVisualizer)}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default BracketPage;