import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Edit,
  EmojiEvents,
  SportsTennis,
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
}

interface RoundRobinMatrixProps {
  participants: Participant[];
  matches: Match[];
  availableParticipants?: Participant[];
  onUpdateMatch: (match: Match) => void;
  onAssignParticipant?: (index: number, participant: Participant) => void;
  onRemoveParticipant?: (index: number) => void;
  isEditable?: boolean;
}

const RoundRobinMatrix: React.FC<RoundRobinMatrixProps> = ({
  participants,
  matches,
  availableParticipants = [],
  onUpdateMatch,
  onAssignParticipant,
  onRemoveParticipant,
  isEditable = false,
}) => {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [scoreDialogOpen, setScoreDialogOpen] = useState(false);
  const [participantDialogOpen, setParticipantDialogOpen] = useState(false);
  const [selectedParticipantIndex, setSelectedParticipantIndex] = useState<number>(-1);
  const [matchResult, setMatchResult] = useState({
    player1Score: 0,
    player2Score: 0,
    winnerId: '',
    notes: '',
  });

  // 각 참가자의 승패 기록 계산
  const calculatePlayerStats = () => {
    const stats = participants.map(participant => {
      let wins = 0;
      let losses = 0;
      const results: Array<'win' | 'loss' | 'pending'> = [];

      // 모든 매치에서 이 참가자의 결과 확인
      for (const otherParticipant of participants) {
        if (participant.id === otherParticipant.id) continue;

        const match = matches.find(
          m => (m.player1Id === participant.id && m.player2Id === otherParticipant.id) ||
               (m.player1Id === otherParticipant.id && m.player2Id === participant.id)
        );

        if (match && match.status === 'completed' && match.winnerId) {
          if (match.winnerId === participant.id) {
            wins++;
            results.push('win');
          } else {
            losses++;
            results.push('loss');
          }
        } else {
          results.push('pending');
        }
      }

      return {
        participant,
        wins,
        losses,
        results,
        totalGames: wins + losses,
        winRate: wins + losses > 0 ? (wins / (wins + losses)) * 100 : 0
      };
    });

    // 승수로 정렬 (승수 많은 순, 같으면 승률 높은 순)
    return stats.sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.winRate - a.winRate;
    });
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'linear-gradient(135deg, #ffd700 0%, #ffed4a 100%)'; // 금
    if (rank === 2) return 'linear-gradient(135deg, #c0c0c0 0%, #e2e8f0 100%)'; // 은  
    if (rank === 3) return 'linear-gradient(135deg, #cd7f32 0%, #f6ad55 100%)'; // 동
    return 'inherit';
  };

  const openScoreDialog = (participant1: Participant, participant2: Participant) => {
    if (!isEditable) return;
    
    const match = matches.find(
      m => (m.player1Id === participant1.id && m.player2Id === participant2.id) ||
           (m.player1Id === participant2.id && m.player2Id === participant1.id)
    );

    if (match) {
      setSelectedMatch(match);
      setMatchResult({
        player1Score: match.player1Score || 0,
        player2Score: match.player2Score || 0,
        winnerId: match.winnerId || '',
        notes: match.notes || '',
      });
      setScoreDialogOpen(true);
    }
  };

  const handleSaveResult = () => {
    if (!selectedMatch) return;

    const updatedMatch: Match = {
      ...selectedMatch,
      player1Score: matchResult.player1Score,
      player2Score: matchResult.player2Score,
      winnerId: matchResult.winnerId,
      notes: matchResult.notes,
      status: 'completed',
    };

    onUpdateMatch(updatedMatch);
    setScoreDialogOpen(false);
    setSelectedMatch(null);
  };

  const handleAssignParticipant = (participant: Participant) => {
    if (onAssignParticipant && selectedParticipantIndex >= 0) {
      onAssignParticipant(selectedParticipantIndex, participant);
    }
    setParticipantDialogOpen(false);
    setSelectedParticipantIndex(-1);
  };

  const handleRemoveParticipant = (index: number) => {
    if (onRemoveParticipant) {
      onRemoveParticipant(index);
    }
  };

  const openParticipantDialog = (index: number) => {
    setSelectedParticipantIndex(index);
    setParticipantDialogOpen(true);
  };

  // 배치되지 않은 참가자들 (사용 가능한 참가자 중 현재 리그에 없는 참가자)
  const unassignedParticipants = availableParticipants.filter(
    availableParticipant => !participants.some(participant => participant.id === availableParticipant.id)
  );

  const playerStats = calculatePlayerStats();

  return (
    <Box>
      {/* 리그전 제목 */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" color="primary.main" gutterBottom>
          🏆 리그전 순위표
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {participants.length}명 참가 • ● = 승리, ○ = 패배
        </Typography>
      </Box>

      {/* 참가자 관리 (편집 모드일 때만) */}
      {isEditable && (
        <Card sx={{ mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'primary.200' }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom color="primary.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              👥 참가자 관리
            </Typography>
            
            {/* 현재 참가자 목록 */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                현재 참가자 ({participants.length}명):
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {participants.map((participant, index) => (
                  <Chip
                    key={participant.id}
                    label={participant.name}
                    onDelete={() => handleRemoveParticipant(index)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
                {participants.length < 8 && (
                  <Chip
                    label="+ 참가자 추가"
                    clickable
                    onClick={() => openParticipantDialog(participants.length)}
                    color="success"
                    variant="outlined"
                    sx={{ borderStyle: 'dashed' }}
                  />
                )}
              </Box>
            </Box>

            {/* 사용 가능한 참가자 목록 */}
            {unassignedParticipants.length > 0 && (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  추가 가능한 참가자 ({unassignedParticipants.length}명):
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {unassignedParticipants.slice(0, 5).map((participant) => (
                    <Chip
                      key={participant.id}
                      label={participant.name}
                      clickable
                      onClick={() => handleAssignParticipant(participant)}
                      color="default"
                      variant="outlined"
                      size="small"
                    />
                  ))}
                  {unassignedParticipants.length > 5 && (
                    <Chip
                      label={`+${unassignedParticipants.length - 5}명 더보기`}
                      clickable
                      onClick={() => openParticipantDialog(participants.length)}
                      color="default"
                      variant="outlined"
                      size="small"
                    />
                  )}
                </Box>
              </Box>
            )}

            {participants.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 2, bgcolor: 'grey.50', borderRadius: 1, border: '1px dashed', borderColor: 'grey.300' }}>
                <Typography variant="body2" color="text.secondary">
                  참가자를 추가하여 리그전을 시작하세요
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* 순위표 */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 3 }}>
          {playerStats.map((stat, index) => (
            <Box key={stat.participant.id}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2,
                  borderRadius: 2,
                  background: getRankColor(index + 1),
                  mb: index < playerStats.length - 1 ? 2 : 0,
                  border: '1px solid',
                  borderColor: index < 3 ? 'transparent' : 'grey.200',
                  cursor: isEditable ? 'pointer' : 'default',
                  '&:hover': {
                    transform: isEditable ? 'translateY(-1px)' : 'none',
                    boxShadow: isEditable ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                {/* 순위와 이름 */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                  <Typography variant="h6" fontWeight="bold" color="text.primary" sx={{ minWidth: '30px' }}>
                    {index + 1}.
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="text.primary">
                    {stat.participant.name}
                  </Typography>
                  {index === 0 && (
                    <EmojiEvents sx={{ color: '#ffd700', ml: 1 }} />
                  )}
                </Box>

                {/* 승패 기록 */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
                  <Typography variant="h6" sx={{ fontFamily: 'monospace', letterSpacing: 2 }}>
                    {stat.results.map((result, idx) => (
                      <span key={idx} style={{ 
                        color: result === 'win' ? '#4caf50' : result === 'loss' ? '#f44336' : '#9e9e9e',
                        fontSize: '1.2em'
                      }}>
                        {result === 'win' ? '●' : result === 'loss' ? '○' : '◯'}
                      </span>
                    ))}
                  </Typography>
                </Box>

                {/* 승수 */}
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h6" fontWeight="bold" color="primary.main">
                    ({stat.wins}승)
                  </Typography>
                  {stat.totalGames > 0 && (
                    <Typography variant="caption" color="text.secondary">
                      승률 {stat.winRate.toFixed(0)}%
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          ))}

          {/* 편집 모드일 때 경기 결과 입력 안내 */}
          {isEditable && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'info.50', borderRadius: 1, border: '1px solid', borderColor: 'info.200' }}>
              <Typography variant="body2" color="info.main" align="center">
                💡 경기 결과를 입력하려면 선수를 클릭하여 대진을 선택하세요
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* 매치 결과 입력 다이얼로그 */}
      <Dialog open={scoreDialogOpen} onClose={() => setScoreDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>경기 결과 입력</DialogTitle>
        <DialogContent>
          {selectedMatch && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom align="center">
                {selectedMatch.player1Name} vs {selectedMatch.player2Name}
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label={`${selectedMatch.player1Name} 점수`}
                    value={matchResult.player1Score}
                    onChange={(e) => setMatchResult({ 
                      ...matchResult, 
                      player1Score: parseInt(e.target.value) || 0 
                    })}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label={`${selectedMatch.player2Name} 점수`}
                    value={matchResult.player2Score}
                    onChange={(e) => setMatchResult({ 
                      ...matchResult, 
                      player2Score: parseInt(e.target.value) || 0 
                    })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>승자</InputLabel>
                    <Select
                      value={matchResult.winnerId}
                      onChange={(e) => setMatchResult({ ...matchResult, winnerId: e.target.value })}
                      label="승자"
                    >
                      <MenuItem value={selectedMatch.player1Id || ''}>
                        {selectedMatch.player1Name}
                      </MenuItem>
                      <MenuItem value={selectedMatch.player2Id || ''}>
                        {selectedMatch.player2Name}
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="경기 메모"
                    value={matchResult.notes}
                    onChange={(e) => setMatchResult({ ...matchResult, notes: e.target.value })}
                    placeholder="경기에 대한 추가 정보나 메모를 입력하세요."
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScoreDialogOpen(false)}>취소</Button>
          <Button onClick={handleSaveResult} variant="contained">
            저장
          </Button>
        </DialogActions>
      </Dialog>

      {/* 참가자 선택 다이얼로그 */}
      <Dialog
        open={participantDialogOpen}
        onClose={() => setParticipantDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          참가자 선택
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            리그전에 추가할 참가자를 선택하세요:
          </Typography>
          
          {unassignedParticipants.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="textSecondary">
                추가 가능한 참가자가 없습니다.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={1} sx={{ mt: 1 }}>
              {unassignedParticipants.map(participant => (
                <Grid item xs={12} sm={6} key={participant.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: 'grey.300',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'primary.50'
                      }
                    }}
                    onClick={() => handleAssignParticipant(participant)}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Typography variant="body1" fontWeight="bold">
                        {participant.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                        <Chip size="small" label={`${participant.skillLevel}급`} color="primary" variant="outlined" />
                        <Chip size="small" label={participant.gender === 'male' ? '남성' : '여성'} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setParticipantDialogOpen(false)}>취소</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoundRobinMatrix;