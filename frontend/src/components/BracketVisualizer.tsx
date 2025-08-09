import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Shuffle,
  Save,
  Clear,
} from '@mui/icons-material';
import RoundRobinMatrix from './RoundRobinMatrix';
import GroupRoundRobin from './GroupRoundRobin';
import TournamentBracketHorizontal from './TournamentBracketHorizontal';

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
  groupId?: string;
  isEmpty?: boolean;
}

interface BracketVisualizerProps {
  bracket: any;
  availableParticipants: Participant[];
  onUpdateBracket: (bracketId: string, matches: Match[]) => void;
  onClose: () => void;
}

const BracketVisualizer: React.FC<BracketVisualizerProps> = ({
  bracket,
  availableParticipants,
  onUpdateBracket,
  onClose,
}) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [participantDialogOpen, setParticipantDialogOpen] = useState(false);
  const [playerSlot, setPlayerSlot] = useState<'player1' | 'player2'>('player1');
  const [unassignedParticipants, setUnassignedParticipants] = useState<Participant[]>([]);

  const updateUnassignedParticipants = useCallback((currentMatches: Match[]) => {
    const assignedIds = new Set<string>();
    currentMatches.forEach(match => {
      if (match.player1Id) assignedIds.add(match.player1Id);
      if (match.player2Id) assignedIds.add(match.player2Id);
    });

    const unassigned = availableParticipants.filter(p => !assignedIds.has(p.id));
    setUnassignedParticipants(unassigned);
  }, [availableParticipants]);

  useEffect(() => {
    if (bracket?.matches) {
      setMatches(bracket.matches);
      updateUnassignedParticipants(bracket.matches);
    }
  }, [bracket, availableParticipants, updateUnassignedParticipants]);

  const handleAssignParticipant = (participant: Participant) => {
    if (!selectedMatch) return;

    const updatedMatches = matches.map(match => {
      if (match.id === selectedMatch.id) {
        const updatedMatch = {
          ...match,
          [playerSlot === 'player1' ? 'player1Id' : 'player2Id']: participant.id,
          [playerSlot === 'player1' ? 'player1Name' : 'player2Name']: participant.name,
          [playerSlot === 'player1' ? 'player1' : 'player2']: participant,
          player1Score: match.player1Score || 0,
          player2Score: match.player2Score || 0,
        };
        
        // 매치 상태 업데이트
        if (playerSlot === 'player1') {
          if (updatedMatch.player1Id && updatedMatch.player2Id) {
            updatedMatch.status = 'scheduled'; // 두 선수 모두 배정됨
          } else if (updatedMatch.player1Id && !updatedMatch.player2Id && updatedMatch.status === 'waiting') {
            updatedMatch.status = 'scheduled'; // 한 명이 배정됨
          }
        } else {
          if (updatedMatch.player1Id && updatedMatch.player2Id) {
            updatedMatch.status = 'scheduled'; // 두 선수 모두 배정됨
          } else if (!updatedMatch.player1Id && updatedMatch.player2Id && updatedMatch.status === 'waiting') {
            updatedMatch.status = 'scheduled'; // 한 명이 배정됨
          }
        }
        
        return updatedMatch;
      }
      return match;
    });

    setMatches(updatedMatches);
    updateUnassignedParticipants(updatedMatches);
    setParticipantDialogOpen(false);
    setSelectedMatch(null);
  };

  const handleRemoveParticipant = (matchId: string, slot: 'player1' | 'player2') => {
    const updatedMatches = matches.map(match => {
      if (match.id === matchId) {
        const updatedMatch = {
          ...match,
          [slot === 'player1' ? 'player1Id' : 'player2Id']: null,
          [slot === 'player1' ? 'player1Name' : 'player2Name']: null,
          [slot === 'player1' ? 'player1' : 'player2']: null,
          player1Score: match.player1Score || 0,
          player2Score: match.player2Score || 0,
          status: match.status,
          winnerId: null, // 승자 정보 초기화
        };
        
        // 매치 상태 업데이트
        if (!updatedMatch.player1Id && !updatedMatch.player2Id) {
          updatedMatch.status = 'waiting'; // 두 슬롯 모두 비어있음
        } else if (updatedMatch.player1Id || updatedMatch.player2Id) {
          updatedMatch.status = 'scheduled'; // 한 명이라도 배정됨
        }
        
        return updatedMatch;
      }
      return match;
    });

    setMatches(updatedMatches);
    updateUnassignedParticipants(updatedMatches);
  };

  const handleTournamentAssignParticipant = (match: Match, slot: 'player1' | 'player2') => {
    setSelectedMatch(match);
    setPlayerSlot(slot);
    setParticipantDialogOpen(true);
  };

  const handleAssignParticipantToSlot = (index: number, participant: Participant) => {
    // RoundRobinMatrix에서 사용할 수 있도록 직접 배정
    // 이 함수는 RoundRobinMatrix 컴포넌트에서 호출됨
  };

  const handleRemoveParticipantFromSlot = (index: number) => {
    // RoundRobinMatrix에서 참가자 제거
    // 이 함수는 RoundRobinMatrix 컴포넌트에서 호출됨
  };

  const handleShuffleParticipants = () => {
    const shuffledParticipants = [...availableParticipants].sort(() => Math.random() - 0.5);
    
    // 첫 번째 라운드 매치들만 찾기
    const firstRoundMatches = matches.filter(match => 
      match.roundName.includes('1회전') || 
      match.roundName.includes('16강') || 
      match.roundName.includes('8강') ||
      match.roundName.includes('준결승') ||
      match.roundName.includes('결승') ||
      match.roundName.includes('리그전')
    );
    
    // 첫 라운드가 명확하지 않다면 matchNumber가 가장 낮은 매치들을 찾기
    const firstRoundMatchNumbers = firstRoundMatches.length > 0 
      ? firstRoundMatches.map(m => m.matchNumber)
      : matches.length > 0 
        ? [Math.min(...matches.map(m => m.matchNumber))]
        : [];
    
    const actualFirstRoundMatches = matches.filter(match => 
      firstRoundMatchNumbers.includes(match.matchNumber) ||
      (firstRoundMatches.length === 0 && match.matchNumber <= Math.ceil(shuffledParticipants.length / 2))
    );
    
    let participantIndex = 0;
    
    const updatedMatches = matches.map(match => {
      // 첫 라운드 매치인 경우에만 참가자 배정
      if (actualFirstRoundMatches.some(frm => frm.id === match.id) && participantIndex < shuffledParticipants.length) {
        const player1 = shuffledParticipants[participantIndex++];
        const player2 = participantIndex < shuffledParticipants.length ? shuffledParticipants[participantIndex++] : null;
        
        // 매치 상태 업데이트
        let status = 'scheduled';
        let winnerId = null;
        
        if (!player2 && player1) {
          status = 'completed';
          winnerId = player1.id; // 부전승
        } else if (!player1 && !player2) {
          status = 'waiting';
        }
        
        return {
          ...match,
          player1Id: player1?.id || null,
          player1Name: player1?.name || null,
          player1: player1 || null,
          player2Id: player2?.id || null,
          player2Name: player2?.name || null,
          player2: player2 || null,
          status: status,
          winnerId: winnerId,
          player1Score: match.player1Score || 0,
          player2Score: match.player2Score || 0,
        };
      }
      
      return match; // 첫 라운드가 아닌 매치는 그대로 유지
    });

    setMatches(updatedMatches);
    updateUnassignedParticipants(updatedMatches);
  };

  const handleClearAllParticipants = () => {
    const updatedMatches = matches.map(match => ({
      ...match,
      player1Id: null,
      player1Name: null,
      player1: null,
      player2Id: null,
      player2Name: null,
      player2: null,
      player1Score: 0,
      player2Score: 0,
      status: match.isEmpty ? 'waiting' : 'scheduled',
      winnerId: null,
    }));

    setMatches(updatedMatches);
    updateUnassignedParticipants(updatedMatches);
  };

  const handleSaveBracket = () => {
    onUpdateBracket(bracket.id, matches);
    onClose();
  };

  const handleMatchUpdate = (updatedMatch: Match) => {
    const updatedMatches = matches.map(match => 
      match.id === updatedMatch.id ? updatedMatch : match
    );
    setMatches(updatedMatches);
    updateUnassignedParticipants(updatedMatches);
  };



  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          🏆 {bracket.name} 대진표 편집
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {bracket.type !== 'round_robin' && (
            <>
              <Tooltip title="참가자 랜덤 배치">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleShuffleParticipants}
                  startIcon={<Shuffle />}
                  disabled={availableParticipants.length === 0}
                >
                  랜덤 배치
                </Button>
              </Tooltip>
              <Tooltip title="모든 참가자 제거">
                <Button
                  variant="outlined"
                  color="warning"
                  size="small"
                  onClick={handleClearAllParticipants}
                  startIcon={<Clear />}
                >
                  전체 제거
                </Button>
              </Tooltip>
            </>
          )}
          <Button
            variant="contained"
            onClick={handleSaveBracket}
            startIcon={<Save />}
          >
            저장
          </Button>
          <Button variant="outlined" onClick={onClose}>
            닫기
          </Button>
        </Box>
      </Box>

      {/* Bracket Info */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          📊 브라켓 정보
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
          <Chip
            label={`총 매치: ${matches.length}개`}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`사용 가능한 참가자: ${availableParticipants.length}명`}
            size="small"
            color="success"
            variant="outlined"
          />
          {bracket.type !== 'round_robin' && (
            <Chip
              label={`배치되지 않은 참가자: ${unassignedParticipants.length}명`}
              size="small"
              color={unassignedParticipants.length > 0 ? "warning" : "success"}
              variant="outlined"
            />
          )}
        </Box>
      </Alert>

      {/* Available Participants */}
      {bracket.type !== 'round_robin' && unassignedParticipants.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            🔄 배치되지 않은 참가자들
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {unassignedParticipants.map(participant => (
              <Chip
                key={participant.id}
                label={`${participant.name} (${participant.skillLevel}조)`}
                size="small"
                color="warning"
                variant="filled"
              />
            ))}
          </Box>
          <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.8 }}>
            💡 빈 슬롯을 클릭하여 참가자를 배정하거나 "랜덤 배치" 버튼을 사용하세요.
          </Typography>
        </Alert>
      )}
      
      {/* Round Robin Info */}
      {bracket.type === 'round_robin' && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            🔄 리그전 (총 {availableParticipants.length}명 참가)
          </Typography>
          <Typography variant="body2">
            모든 참가자가 서로 한 번씩 경기를 진행합니다. 
            매트릭스에서 각 칸을 클릭하여 경기 결과를 입력하세요.
          </Typography>
        </Alert>
      )}

      {/* Bracket Visualization */}
      {bracket.type === 'round_robin' ? (
        availableParticipants.length > 8 ? (
          <GroupRoundRobin
            bracket={bracket}
            availableParticipants={availableParticipants}
            matches={matches}
            onUpdateMatch={handleMatchUpdate}
            onUpdateBracket={onUpdateBracket}
            onClose={onClose}
          />
        ) : (
          <RoundRobinMatrix
            participants={availableParticipants}
            matches={matches}
            availableParticipants={availableParticipants}
            onUpdateMatch={handleMatchUpdate}
            onAssignParticipant={handleAssignParticipantToSlot}
            onRemoveParticipant={handleRemoveParticipantFromSlot}
            isEditable={true}
          />
        )
      ) : (
        <TournamentBracketHorizontal
          matches={matches}
          availableParticipants={availableParticipants}
          onMatchUpdate={handleMatchUpdate}
          onAssignParticipant={handleTournamentAssignParticipant}
          onRemoveParticipant={handleRemoveParticipant}
          isReadOnly={false} // 관리자 대시보드에서는 편집 가능
        />
      )}

      {/* Participant Selection Dialog */}
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

export default BracketVisualizer;