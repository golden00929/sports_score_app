import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Person,
  Edit,
  Close,
  Save,
  EmojiEvents,
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

interface TournamentBracketVerticalProps {
  matches: Match[];
  availableParticipants: Participant[];
  onMatchUpdate: (match: Match) => void;
  onAssignParticipant: (match: Match, slot: 'player1' | 'player2') => void;
  onRemoveParticipant: (matchId: string, slot: 'player1' | 'player2') => void;
}

const TournamentBracketVertical: React.FC<TournamentBracketVerticalProps> = ({
  matches,
  availableParticipants,
  onMatchUpdate,
  onAssignParticipant,
  onRemoveParticipant,
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

  // 라운드별로 매치를 그룹화하고 정렬
  const getRounds = () => {
    const roundGroups: { [key: string]: Match[] } = {};
    
    matches.forEach(match => {
      if (!roundGroups[match.roundName]) {
        roundGroups[match.roundName] = [];
      }
      roundGroups[match.roundName].push(match);
    });

    // 라운드 정렬 (결승 -> 준결승 -> 8강 순)
    const roundOrder = ['결승', '준결승', '8강', '16강', '32강', '64강', '128강'];
    const sortedRounds = Object.keys(roundGroups).sort((a, b) => {
      const aIndex = roundOrder.findIndex(round => a.includes(round));
      const bIndex = roundOrder.findIndex(round => b.includes(round));
      
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return a.localeCompare(b);
    });

    return sortedRounds.map(roundName => ({
      roundName,
      matches: roundGroups[roundName].sort((a, b) => a.matchNumber - b.matchNumber)
    }));
  };

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

  const getMatchStatusColor = (match: Match) => {
    if (match.status === 'completed') return 'success';
    if (match.status === 'ongoing') return 'warning';
    if (match.status === 'scheduled' && match.player1Id && match.player2Id) return 'info';
    return 'default';
  };

  const renderMatch = (match: Match, isVerticalLine = false) => {
    const isWaitingMatch = match.status === 'waiting' || match.isEmpty;
    const isCompleted = match.status === 'completed';
    const canEdit = match.player1Id && match.player2Id && !isWaitingMatch;

    return (
      <Box
        key={match.id}
        sx={{
          position: 'relative',
          mb: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* 수직선 연결 */}
        {isVerticalLine && (
          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              top: -20,
              width: 2,
              height: 20,
              bgcolor: 'primary.main',
              zIndex: 0,
            }}
          />
        )}

        <Paper
          elevation={isCompleted ? 4 : 2}
          sx={{
            p: 2,
            width: 280,
            border: isCompleted ? '2px solid' : '1px solid',
            borderColor: isCompleted ? 'success.main' : 'grey.300',
            bgcolor: isCompleted ? 'success.50' : 'background.paper',
            borderRadius: 2,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* 매치 헤더 */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="caption" color="textSecondary" fontWeight="bold">
              {match.roundName} #{match.matchNumber}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Chip
                size="small"
                label={match.status === 'completed' ? '완료' : match.status === 'scheduled' ? '예정' : '대기'}
                color={getMatchStatusColor(match) as any}
              />
              {canEdit && (
                <IconButton
                  size="small"
                  onClick={() => openScoreDialog(match)}
                  color="primary"
                >
                  <Edit fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Box>

          {/* Player 1 */}
          <Card
            sx={{
              mb: 1,
              border: match.player1 ? '1px solid' : '1px dashed',
              borderColor: match.winnerId === match.player1Id ? 'success.main' : 
                          match.player1 ? 'primary.main' : 'grey.300',
              bgcolor: match.winnerId === match.player1Id ? 'success.50' : 
                      match.player1 ? 'primary.50' : 'grey.50',
              cursor: isWaitingMatch ? 'not-allowed' : 'pointer',
            }}
            onClick={() => !isWaitingMatch && !match.player1 && openParticipantDialog(match, 'player1')}
          >
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              {match.player1 ? (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {match.player1.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                      <Chip size="small" label={match.player1.skillLevel} />
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {isCompleted && (
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        {match.player1Score}
                      </Typography>
                    )}
                    {match.winnerId === match.player1Id && <EmojiEvents color="success" fontSize="small" />}
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveParticipant(match.id, 'player1');
                      }}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 1 }}>
                  <Person sx={{ mr: 1, color: 'grey.400' }} />
                  <Typography variant="body2" color="textSecondary">
                    {isWaitingMatch ? '빈 슬롯' : '선수 배치'}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* VS */}
          <Typography variant="caption" align="center" sx={{ display: 'block', color: 'grey.500', my: 0.5 }}>
            VS
          </Typography>

          {/* Player 2 */}
          <Card
            sx={{
              border: match.player2 ? '1px solid' : '1px dashed',
              borderColor: match.winnerId === match.player2Id ? 'success.main' : 
                          match.player2 ? 'primary.main' : 'grey.300',
              bgcolor: match.winnerId === match.player2Id ? 'success.50' : 
                      match.player2 ? 'primary.50' : 'grey.50',
              cursor: isWaitingMatch ? 'not-allowed' : 'pointer',
            }}
            onClick={() => !isWaitingMatch && !match.player2 && openParticipantDialog(match, 'player2')}
          >
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              {match.player2 ? (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {match.player2.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                      <Chip size="small" label={match.player2.skillLevel} />
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {isCompleted && (
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        {match.player2Score}
                      </Typography>
                    )}
                    {match.winnerId === match.player2Id && <EmojiEvents color="success" fontSize="small" />}
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveParticipant(match.id, 'player2');
                      }}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 1 }}>
                  <Person sx={{ mr: 1, color: 'grey.400' }} />
                  <Typography variant="body2" color="textSecondary">
                    {isWaitingMatch ? '빈 슬롯' : '선수 배치'}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* 매치 노트 (완료된 경우) */}
          {isCompleted && match.notes && (
            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
              📝 {match.notes}
            </Typography>
          )}
        </Paper>

        {/* 수평선 연결 (다음 라운드로) */}
        <Box
          sx={{
            position: 'absolute',
            right: -40,
            top: '50%',
            width: 40,
            height: 2,
            bgcolor: 'primary.main',
            zIndex: 0,
          }}
        />
      </Box>
    );
  };

  const rounds = getRounds();

  return (
    <Box>
      {/* 세로형 브라켓 */}
      <Box sx={{ display: 'flex', gap: 6, overflowX: 'auto', p: 2 }}>
        {rounds.map((round, roundIndex) => (
          <Box key={round.roundName} sx={{ minWidth: 300 }}>
            {/* 라운드 헤더 */}
            <Typography
              variant="h6"
              align="center"
              sx={{
                mb: 3,
                p: 1,
                bgcolor: 'primary.main',
                color: 'white',
                borderRadius: 1,
                fontWeight: 'bold',
              }}
            >
              {round.roundName}
            </Typography>

            {/* 라운드 매치들 */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {round.matches.map((match, matchIndex) => 
                renderMatch(match, matchIndex > 0)
              )}
            </Box>
          </Box>
        ))}
      </Box>

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

export default TournamentBracketVertical;