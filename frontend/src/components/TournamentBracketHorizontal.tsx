import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  Person,
  Edit,
  Close,
  Save,
  EmojiEvents,
  CheckCircle,
  Schedule,
  PlayArrow,
  HelpOutline,
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

interface TournamentBracketHorizontalProps {
  matches: Match[];
  availableParticipants: Participant[];
  onMatchUpdate: (match: Match) => void;
  onAssignParticipant: (match: Match, slot: 'player1' | 'player2') => void;
  onRemoveParticipant: (matchId: string, slot: 'player1' | 'player2') => void;
  isReadOnly?: boolean;
}

// 표준 토너먼트 브라켓 구조
interface BracketRound {
  roundIndex: number;
  roundName: string;
  matches: Match[];
  matchHeight: number;
  spacing: number;
  offsetY: number;
}

const TournamentBracketHorizontal: React.FC<TournamentBracketHorizontalProps> = ({
  matches,
  availableParticipants,
  onMatchUpdate,
  onAssignParticipant,
  onRemoveParticipant,
  isReadOnly = false,
}) => {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [scoreDialogOpen, setScoreDialogOpen] = useState(false);
  const [participantDialogOpen, setParticipantDialogOpen] = useState(false);
  const [playerSlot, setPlayerSlot] = useState<'player1' | 'player2'>('player1');
  
  const [matchResult, setMatchResult] = useState({
    player1Score: 0,
    player2Score: 0,
    winnerId: '',
    notes: '',
  });

  // 매치를 라운드별로 구조화
  const createBracketStructure = (): BracketRound[] => {
    if (matches.length === 0) return [];

    // 라운드별로 매치 그룹화
    const roundGroups: { [key: string]: Match[] } = {};
    matches.forEach(match => {
      if (!roundGroups[match.roundName]) {
        roundGroups[match.roundName] = [];
      }
      roundGroups[match.roundName].push(match);
    });

    // 라운드 순서 정의
    const roundOrder = [
      '1라운드', '32강', '16강', '8강', '준결승', '결승',
      '2라운드', '3라운드', '4라운드', '5라운드'
    ];
    
    const sortedRoundNames = Object.keys(roundGroups).sort((a, b) => {
      const aIndex = roundOrder.findIndex(order => a.includes(order.replace('라운드', '').replace('강', '')));
      const bIndex = roundOrder.findIndex(order => b.includes(order.replace('라운드', '').replace('강', '')));
      
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return a.localeCompare(b);
    });

    // 브라켓 구조 생성
    const bracketRounds: BracketRound[] = [];

    sortedRoundNames.forEach((roundName, index) => {
      const roundMatches = roundGroups[roundName].sort((a, b) => a.matchNumber - b.matchNumber);

      bracketRounds.push({
        roundIndex: index,
        roundName,
        matches: roundMatches,
        matchHeight: 80,
        spacing: 100,
        offsetY: 0
      });
    });

    return bracketRounds;
  };

  // 매치 상태에 따른 아이콘과 색상 반환
  const getMatchStatusIcon = (match: Match) => {
    if (match.status === 'completed') return <CheckCircle color="success" />;
    if (match.status === 'ongoing') return <PlayArrow color="warning" />;
    if (match.status === 'waiting' || match.isEmpty) return <Schedule color="action" />;
    return <HelpOutline color="action" />;
  };

  const getMatchStatusText = (match: Match) => {
    if (match.status === 'completed') return '완료';
    if (match.status === 'ongoing') return '진행중';
    if (match.status === 'waiting' || match.isEmpty) return '대기';
    return '미정';
  };

  const getMatchStatusColor = (match: Match) => {
    if (match.status === 'completed') return 'success.main';
    if (match.status === 'ongoing') return 'warning.main';
    if (match.status === 'waiting' || match.isEmpty) return 'grey.500';
    return 'grey.400';
  };


  // 이벤트 핸들러들
  const openScoreDialog = (match: Match) => {
    setSelectedMatch(match);
    setMatchResult({
      player1Score: match.player1Score || 0,
      player2Score: match.player2Score || 0,
      winnerId: match.winnerId || '',
      notes: match.notes || '',
    });
    setScoreDialogOpen(true);
  };

  const openParticipantDialog = (match: Match, slot: 'player1' | 'player2') => {
    setSelectedMatch(match);
    setPlayerSlot(slot);
    setParticipantDialogOpen(true);
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

    onMatchUpdate(updatedMatch);
    setScoreDialogOpen(false);
    setSelectedMatch(null);
  };

  const handleAssignParticipant = (participant: Participant) => {
    if (!selectedMatch) return;
    onAssignParticipant(selectedMatch, playerSlot);
    setParticipantDialogOpen(false);
  };

  const bracketStructure = createBracketStructure();

  return (
    <Box>
      {/* 메인 브라켓 */}
      {bracketStructure.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            브라켓 데이터가 없습니다
          </Typography>
          <Typography variant="body2" color="textSecondary">
            매치 데이터: {matches.length}개
          </Typography>
        </Box>
      ) : (
        <Box sx={{ p: 2 }}>
          {bracketStructure.map((round, roundIndex) => (
            <Card key={round.roundName} sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
              {/* 라운드 헤더 */}
              <CardContent sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    fontWeight: 'bold',
                    fontSize: '1.1rem'
                  }}
                >
                  📍 {round.roundName}
                  {round.roundName.includes('8강') && ' (8강)'}
                  {round.roundName.includes('준결승') && ' (4강)'}
                </Typography>
              </CardContent>
              
              {/* 라운드 매치들 */}
              <CardContent sx={{ p: 0 }}>
                {round.matches.map((match, matchIndex) => (
                  <Box key={match.id}>
                    <Box
                      sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: !isReadOnly && match.player1Id && match.player2Id ? 'pointer' : 'default',
                        '&:hover': {
                          bgcolor: !isReadOnly && match.player1Id && match.player2Id ? 'action.hover' : 'transparent'
                        }
                      }}
                      onClick={() => !isReadOnly && match.player1Id && match.player2Id && openScoreDialog(match)}
                    >
                      {/* 매치 정보 */}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" fontWeight="bold" sx={{ mb: 1 }}>
                          매치{match.matchNumber}: {' '}
                          {match.player1Name || '미정'} vs {match.player2Name || '미정'}
                        </Typography>
                        
                        {/* 점수 (완료된 경기만) */}
                        {match.status === 'completed' && (
                          <Typography variant="body2" color="textSecondary">
                            ({match.player1Score}-{match.player2Score})
                          </Typography>
                        )}
                      </Box>

                      {/* 상태 표시 */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getMatchStatusIcon(match)}
                        <Typography 
                          variant="body2" 
                          color={getMatchStatusColor(match)}
                          fontWeight="bold"
                        >
                          {getMatchStatusText(match)}
                        </Typography>
                        
                        {/* 승자 표시 */}
                        {match.status === 'completed' && match.winnerId && (
                          <Chip
                            icon={<EmojiEvents />}
                            label={match.winnerId === match.player1Id ? match.player1Name : match.player2Name}
                            color="success"
                            size="small"
                            variant="outlined"
                          />
                        )}
                        
                        {/* 편집 버튼 (읽기 전용 모드가 아닐 때) */}
                        {!isReadOnly && match.player1Id && match.player2Id && (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              openScoreDialog(match);
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                    
                    {/* 구분선 */}
                    {matchIndex < round.matches.length - 1 && <Divider />}
                  </Box>
                ))}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* 점수 입력 다이얼로그 */}
      <Dialog open={scoreDialogOpen} onClose={() => setScoreDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>매치 결과 입력</DialogTitle>
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
          <Button onClick={handleSaveResult} variant="contained" startIcon={<Save />}>
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
          선수 선택 - {selectedMatch?.roundName} 매치 {selectedMatch?.matchNumber}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            {playerSlot === 'player1' ? '첫 번째' : '두 번째'} 선수를 선택하세요:
          </Typography>
          <List>
            {availableParticipants.map(participant => {
              const isAssigned = matches.some(match => 
                match.player1Id === participant.id || match.player2Id === participant.id
              );
              
              return (
                <ListItem key={participant.id} disablePadding>
                  <ListItemButton
                    onClick={() => handleAssignParticipant(participant)}
                    disabled={isAssigned}
                  >
                    <ListItemText
                      primary={participant.name}
                      secondary={
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                          <Chip size="small" label={participant.skillLevel} />
                          <Chip size="small" label={participant.gender === 'male' ? '남성' : '여성'} />
                          {isAssigned && <Chip size="small" label="배치됨" color="warning" />}
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setParticipantDialogOpen(false)}>취소</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TournamentBracketHorizontal;