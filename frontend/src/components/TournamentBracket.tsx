import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Person,
  Edit,
  Close,
} from '@mui/icons-material';

interface Participant {
  id: string;
  name: string;
  skillLevel: string;
  eventType: string;
  gender: string;
}

interface Match {
  id: string;
  roundName: string;
  matchNumber: number;
  player1Id?: string | null;
  player2Id?: string | null;
  player1Name?: string | null;
  player2Name?: string | null;
  player1?: Participant | null;
  player2?: Participant | null;
  player1Score: number;
  player2Score: number;
  status: string;
  winnerId?: string | null;
  notes?: string;
  isEmpty?: boolean;
}

interface TournamentBracketProps {
  matches: Match[];
  availableParticipants: Participant[];
  onMatchUpdate: (match: Match) => void;
  onAssignParticipant: (match: Match, slot: 'player1' | 'player2') => void;
  onRemoveParticipant: (matchId: string, slot: 'player1' | 'player2') => void;
}

const TournamentBracket: React.FC<TournamentBracketProps> = ({
  matches,
  availableParticipants,
  onMatchUpdate,
  onAssignParticipant,
  onRemoveParticipant,
}) => {
  // 라운드별로 매치 그룹화
  const roundGroups = matches.reduce((acc: any, match) => {
    if (!acc[match.roundName]) {
      acc[match.roundName] = [];
    }
    acc[match.roundName].push(match);
    return acc;
  }, {});

  // 라운드 순서 정렬 (1회전, 2회전, 준결승, 결승 순)
  const sortedRounds = Object.keys(roundGroups).sort((a, b) => {
    const getOrder = (round: string) => {
      if (round.includes('결승')) return 1000;
      if (round.includes('준결승')) return 900;
      if (round.includes('8강')) return 800;
      if (round.includes('16강')) return 700;
      if (round.includes('32강')) return 600;
      const roundMatch = round.match(/(\d+)회전/);
      return roundMatch ? parseInt(roundMatch[1]) * 100 : 0;
    };
    return getOrder(a) - getOrder(b);
  });

  const renderPlayerSlot = (match: Match, slot: 'player1' | 'player2') => {
    const player = slot === 'player1' ? match.player1 : match.player2;
    const playerId = slot === 'player1' ? match.player1Id : match.player2Id;
    const playerName = slot === 'player1' ? match.player1Name : match.player2Name;
    const isWinner = match.winnerId === playerId;
    const isLoser = match.winnerId && match.winnerId !== playerId;
    const isWaitingMatch = match.status === 'waiting' || match.isEmpty;
    const playerScore = slot === 'player1' ? match.player1Score : match.player2Score;

    return (
      <Card
        sx={{
          minHeight: 60,
          cursor: isWaitingMatch ? 'not-allowed' : 'pointer',
          border: '3px solid',
          borderColor: isWinner ? 'success.main' : 
                      isLoser ? 'error.light' : 
                      player ? 'primary.main' : 'grey.300',
          bgcolor: isWinner ? 'success.50' : 
                   isLoser ? 'error.50' : 
                   player ? 'primary.50' : 'grey.50',
          opacity: isWaitingMatch ? 0.6 : 1,
          position: 'relative',
          transition: 'all 0.3s ease',
          boxShadow: isWinner ? '0 4px 12px rgba(76, 175, 80, 0.3)' : 
                     player ? '0 2px 8px rgba(25, 118, 210, 0.2)' : 'none',
          '&:hover': {
            bgcolor: isWaitingMatch ? 'grey.50' : 
                     isWinner ? 'success.100' : 
                     isLoser ? 'error.100' :
                     player ? 'primary.100' : 'grey.100',
            transform: !isWaitingMatch ? 'scale(1.03)' : 'none',
            boxShadow: !isWaitingMatch ? '0 6px 16px rgba(0,0,0,0.2)' : 'none',
          },
        }}
        onClick={() => !isWaitingMatch && onAssignParticipant(match, slot)}
      >
        {isWinner && (
          <Box
            sx={{
              position: 'absolute',
              top: -8,
              right: -8,
              width: 24,
              height: 24,
              bgcolor: 'success.main',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1,
            }}
          >
            <Typography sx={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>
              ✓
            </Typography>
          </Box>
        )}
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          {player || playerName ? (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography 
                    variant="body1" 
                    fontWeight={isWinner ? 'bold' : 'medium'}
                    color={isWinner ? 'success.main' : isLoser ? 'error.main' : 'text.primary'}
                    sx={{ fontSize: '1rem', mb: 0.5 }}
                  >
                    {playerName || player?.name}
                  </Typography>
                  {player && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {player.skillLevel}조
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        • {player.eventType === 'men_singles' ? '남단' : 
                             player.eventType === 'women_singles' ? '여단' :
                             player.eventType === 'men_doubles' ? '남복' :
                             player.eventType === 'women_doubles' ? '여복' : '혼복'}
                      </Typography>
                    </Box>
                  )}
                </Box>
                {!isWaitingMatch && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveParticipant(match.id, slot);
                    }}
                    sx={{ 
                      opacity: 0.6, 
                      '&:hover': { opacity: 1, bgcolor: 'error.light', color: 'white' },
                      ml: 1
                    }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                )}
              </Box>
              {match.status === 'completed' && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography 
                    variant="h5" 
                    fontWeight="bold"
                    color={isWinner ? 'success.main' : 'text.secondary'}
                    sx={{ 
                      p: 1,
                      borderRadius: 1,
                      bgcolor: isWinner ? 'success.50' : 'grey.100',
                      minWidth: 40,
                      textAlign: 'center'
                    }}
                  >
                    {playerScore}
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              minHeight: 40,
              flexDirection: 'column',
              gap: 1
            }}>
              <Person sx={{ fontSize: 32, color: 'grey.400' }} />
              <Typography variant="body2" color="text.secondary" align="center">
                {isWaitingMatch ? '대기 중' : '참가자를 선택하세요'}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderMatch = (match: Match, roundIndex: number) => {
    const isWaitingMatch = match.status === 'waiting' || match.isEmpty;
    const isCompleted = match.status === 'completed';
    const isScheduled = match.status === 'scheduled';
    const hasWinner = match.winnerId;
    
    return (
      <Paper
        key={match.id}
        elevation={isCompleted ? 6 : isScheduled ? 3 : 1}
        sx={{
          p: 3,
          border: '3px solid',
          borderColor: isCompleted ? 'success.main' : 
                      isScheduled ? 'primary.main' :
                      isWaitingMatch ? 'grey.300' : 'grey.200',
          borderRadius: 4,
          position: 'relative',
          backgroundColor: isCompleted ? 'success.25' : 
                          isScheduled ? 'primary.25' : 
                          'background.paper',
          transition: 'all 0.3s ease',
          minWidth: 280,
          maxWidth: 320,
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            transform: 'translateY(-2px)',
          },
        }}
      >
        {/* 매치 헤더 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                bgcolor: isCompleted ? 'success.main' : 
                        isScheduled ? 'primary.main' : 'grey.300',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography 
                variant="caption" 
                fontWeight="bold" 
                color={isCompleted || isScheduled ? 'white' : 'text.secondary'}
                sx={{ fontSize: '0.75rem' }}
              >
                {match.matchNumber}
              </Typography>
            </Box>
            <Typography variant="subtitle1" fontWeight="medium">
              매치 {match.matchNumber}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {isWaitingMatch && (
              <Chip 
                size="small" 
                label="⏳ 대기 중" 
                sx={{ bgcolor: 'grey.200', color: 'text.secondary' }}
              />
            )}
            {isCompleted && (
              <Chip 
                size="small" 
                label="🏆 완료" 
                sx={{ bgcolor: 'success.main', color: 'white' }}
              />
            )}
            {isScheduled && (
              <Chip 
                size="small" 
                label="📅 경기 예정" 
                sx={{ bgcolor: 'primary.main', color: 'white' }}
              />
            )}
          </Box>
        </Box>

        {/* 선수 슬롯들 */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {renderPlayerSlot(match, 'player1')}
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            py: 1,
            position: 'relative'
          }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 60,
                height: 30,
                bgcolor: isCompleted ? 'success.main' : 'primary.main',
                borderRadius: 2,
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1rem',
              }}
            >
              VS
            </Box>
            {isCompleted && hasWinner && (
              <Typography 
                variant="caption" 
                sx={{ 
                  position: 'absolute',
                  right: 0,
                  bgcolor: 'success.main',
                  color: 'white',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  fontWeight: 'bold'
                }}
              >
                승부 결정!
              </Typography>
            )}
          </Box>
          
          {renderPlayerSlot(match, 'player2')}
        </Box>

        {/* 연결선은 외부에서 처리하므로 제거 */}
      </Paper>
    );
  };

  // 피라미드 형태로 라운드를 역순으로 나열하여 상단에 결승이 오도록 배치
  const pyramidRounds = [...sortedRounds].reverse();

  return (
    <Box sx={{ overflowX: 'auto', pb: 2, px: 2 }}>
      {/* 피라미드 헤더 */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" color="primary.main" gutterBottom>
          🏆 토너먼트 대진표
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {matches.length > 0 ? `총 ${matches.length}경기` : '대진표 준비 중'}
        </Typography>
      </Box>

      {/* 피라미드 형태로 라운드 배치 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        {pyramidRounds.map((roundName, pyramidIndex) => {
          const originalRoundIndex = sortedRounds.indexOf(roundName);
          const roundMatches = roundGroups[roundName] || [];
          const matchesPerRow = roundMatches.length;
          
          return (
            <Box key={roundName} sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* 라운드 헤더 */}
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  mb: 3,
                  background: pyramidIndex === 0 
                    ? 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)' // 결승 금색
                    : pyramidIndex === 1 
                    ? 'linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%)' // 준결승 은색
                    : 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', // 기본 파란색
                  color: pyramidIndex <= 1 ? 'rgba(0,0,0,0.8)' : 'white',
                  textAlign: 'center',
                  borderRadius: 3,
                  minWidth: 200,
                  boxShadow: pyramidIndex === 0 ? '0 8px 24px rgba(255, 215, 0, 0.3)' : '0 4px 12px rgba(0,0,0,0.15)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                  {pyramidIndex === 0 && <Typography sx={{ fontSize: '2rem' }}>🏆</Typography>}
                  {pyramidIndex === 1 && <Typography sx={{ fontSize: '1.5rem' }}>🥈</Typography>}
                  {pyramidIndex >= 2 && <Typography sx={{ fontSize: '1.5rem' }}>⚔️</Typography>}
                  <Typography variant="h5" fontWeight="bold">
                    {roundName}
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ mt: 1, opacity: 0.8 }}>
                  {roundMatches.length}경기
                </Typography>
              </Paper>

              {/* 매치들을 행으로 배치 */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  flexWrap: 'wrap',
                  gap: 3,
                  maxWidth: `${Math.min(matchesPerRow * 350, 1400)}px`, // 행당 최대 너비 제한
                  position: 'relative'
                }}
              >
                {roundMatches
                  .sort((a: Match, b: Match) => a.matchNumber - b.matchNumber)
                  .map((match: Match, matchIndex: number) => (
                    <Box key={match.id} sx={{ position: 'relative', minWidth: 300 }}>
                      {renderMatch(match, originalRoundIndex)}
                      
                      {/* 다음 라운드로 연결되는 화살표 (아래쪽 향) */}
                      {pyramidIndex < pyramidRounds.length - 1 && (
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: -50,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            zIndex: 1
                          }}
                        >
                          <Box
                            sx={{
                              width: 4,
                              height: 40,
                              bgcolor: match.status === 'completed' ? 'success.main' : 'primary.main',
                              borderRadius: 2
                            }}
                          />
                          <Box
                            sx={{
                              width: 0,
                              height: 0,
                              borderLeft: '6px solid transparent',
                              borderRight: '6px solid transparent',
                              borderTop: `10px solid ${match.status === 'completed' ? 'rgba(76, 175, 80, 1)' : 'rgba(25, 118, 210, 1)'}`,
                              mt: -1
                            }}
                          />
                        </Box>
                      )}
                    </Box>
                  ))}
              </Box>
            </Box>
          );
        })}
      </Box>

      {sortedRounds.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            브라켓이 생성되지 않았습니다
          </Typography>
          <Typography color="text.secondary">
            브라켓을 생성하면 여기에 토너먼트 대진표가 표시됩니다.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default TournamentBracket;