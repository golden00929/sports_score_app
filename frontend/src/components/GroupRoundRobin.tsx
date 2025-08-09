import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore,
  Settings,
  Shuffle,
  Save,
  Group,
  EmojiEvents,
  Person,
} from '@mui/icons-material';
import RoundRobinMatrix from './RoundRobinMatrix';

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
}

interface GroupRoundRobinProps {
  bracket: any;
  availableParticipants: Participant[];
  matches: Match[];
  onUpdateMatch: (match: Match) => void;
  onUpdateBracket: (bracketId: string, matches: Match[]) => void;
  onClose: () => void;
}

interface Group {
  id: string;
  name: string;
  participants: Participant[];
  matches: Match[];
}

const GroupRoundRobin: React.FC<GroupRoundRobinProps> = ({
  bracket,
  availableParticipants,
  matches,
  onUpdateMatch,
  onUpdateBracket,
  onClose,
}) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupSize, setGroupSize] = useState(4);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [groupsGenerated, setGroupsGenerated] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | false>(false);

  useEffect(() => {
    // Check if groups are already generated
    const existingGroups = generateGroupsFromMatches();
    if (existingGroups.length > 0) {
      setGroups(existingGroups);
      setGroupsGenerated(true);
    }
  }, [matches, availableParticipants]);

  const generateGroupsFromMatches = (): Group[] => {
    if (matches.length === 0) return [];

    const groupMap = new Map<string, Group>();
    
    matches.forEach(match => {
      const groupId = match.groupId || 'group-1';
      
      if (!groupMap.has(groupId)) {
        groupMap.set(groupId, {
          id: groupId,
          name: `${String.fromCharCode(65 + parseInt(groupId.split('-')[1]) - 1)}조`,
          participants: [],
          matches: []
        });
      }
      
      const group = groupMap.get(groupId)!;
      group.matches.push(match);

      // Add participants to group
      if (match.player1Id) {
        const p1 = availableParticipants.find(p => p.id === match.player1Id);
        if (p1 && !group.participants.find(p => p.id === p1.id)) {
          group.participants.push(p1);
        }
      }
      if (match.player2Id) {
        const p2 = availableParticipants.find(p => p.id === match.player2Id);
        if (p2 && !group.participants.find(p => p.id === p2.id)) {
          group.participants.push(p2);
        }
      }
    });

    return Array.from(groupMap.values());
  };

  const generateGroups = () => {
    const shuffledParticipants = [...availableParticipants].sort(() => Math.random() - 0.5);
    const numberOfGroups = Math.ceil(shuffledParticipants.length / groupSize);
    const newGroups: Group[] = [];
    const newMatches: Match[] = [];

    for (let i = 0; i < numberOfGroups; i++) {
      const groupParticipants = shuffledParticipants.slice(i * groupSize, (i + 1) * groupSize);
      const groupId = `group-${i + 1}`;
      const groupName = `${String.fromCharCode(65 + i)}조`;

      const group: Group = {
        id: groupId,
        name: groupName,
        participants: groupParticipants,
        matches: []
      };

      // Generate matches for this group (round-robin)
      for (let j = 0; j < groupParticipants.length; j++) {
        for (let k = j + 1; k < groupParticipants.length; k++) {
          const match: Match = {
            id: `${groupId}-match-${j}-${k}`,
            roundName: `${groupName} 리그전`,
            matchNumber: newMatches.length + 1,
            player1Id: groupParticipants[j].id,
            player2Id: groupParticipants[k].id,
            player1Name: groupParticipants[j].name,
            player2Name: groupParticipants[k].name,
            player1: groupParticipants[j],
            player2: groupParticipants[k],
            player1Score: 0,
            player2Score: 0,
            status: 'scheduled',
            groupId: groupId,
          };
          
          group.matches.push(match);
          newMatches.push(match);
        }
      }

      newGroups.push(group);
    }

    setGroups(newGroups);
    setGroupsGenerated(true);
    setSettingsOpen(false);
    
    // Update matches in parent component
    onUpdateBracket(bracket.id, newMatches);
  };

  const handleMatchUpdate = (updatedMatch: Match) => {
    const updatedGroups = groups.map(group => ({
      ...group,
      matches: group.matches.map(match => 
        match.id === updatedMatch.id ? updatedMatch : match
      )
    }));
    
    setGroups(updatedGroups);
    onUpdateMatch(updatedMatch);
  };

  const calculateGroupStandings = (group: Group) => {
    const standings = group.participants.map((participant) => {
      let wins = 0;
      let losses = 0;
      let totalSetsWon = 0;
      let totalSetsLost = 0;
      let matchesPlayed = 0;

      group.matches.forEach((match) => {
        if (match.player1Id === participant.id || match.player2Id === participant.id) {
          if (match.status === 'completed') {
            matchesPlayed++;
            const isPlayer1 = match.player1Id === participant.id;
            const playerScore = isPlayer1 ? match.player1Score : match.player2Score;
            const opponentScore = isPlayer1 ? match.player2Score : match.player1Score;
            
            totalSetsWon += playerScore;
            totalSetsLost += opponentScore;
            
            if (match.winnerId === participant.id) {
              wins++;
            } else if (match.winnerId) {
              losses++;
            }
          }
        }
      });

      const setDifference = totalSetsWon - totalSetsLost;
      const winRate = matchesPlayed > 0 ? (wins / matchesPlayed) * 100 : 0;

      return {
        participant,
        wins,
        losses,
        matchesPlayed,
        totalSetsWon,
        totalSetsLost,
        setDifference,
        winRate,
        points: wins * 3 + losses, // 승리 3점, 패배 1점
      };
    });

    return standings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.setDifference !== a.setDifference) return b.setDifference - a.setDifference;
      return b.totalSetsWon - a.totalSetsWon;
    });
  };

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedGroup(isExpanded ? panel : false);
  };

  const getOverallStandings = () => {
    const allStandings: Array<{
      participant: Participant;
      groupName: string;
      groupRank: number;
      wins: number;
      losses: number;
      points: number;
      setDifference: number;
    }> = [];

    groups.forEach(group => {
      const groupStandings = calculateGroupStandings(group);
      groupStandings.forEach((standing, index) => {
        allStandings.push({
          participant: standing.participant,
          groupName: group.name,
          groupRank: index + 1,
          wins: standing.wins,
          losses: standing.losses,
          points: standing.points,
          setDifference: standing.setDifference,
        });
      });
    });

    // Sort by group rank first (1st place from each group comes first)
    return allStandings.sort((a, b) => {
      if (a.groupRank !== b.groupRank) return a.groupRank - b.groupRank;
      if (b.points !== a.points) return b.points - a.points;
      return b.setDifference - a.setDifference;
    });
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          🏆 {bracket.name} - 조별 리그전
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setSettingsOpen(true)}
            startIcon={<Settings />}
          >
            조 설정
          </Button>
          <Button
            variant="contained"
            onClick={() => onUpdateBracket(bracket.id, groups.flatMap(g => g.matches))}
            startIcon={<Save />}
          >
            저장
          </Button>
          <Button variant="outlined" onClick={onClose}>
            닫기
          </Button>
        </Box>
      </Box>

      {/* Settings Info */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          📊 조별 리그전 ({groups.length}개 조, 조당 {groupSize}명 기준)
        </Typography>
        <Typography variant="body2">
          총 {availableParticipants.length}명의 참가자를 {groups.length}개 조로 나누어 리그전을 진행합니다.
          {!groupsGenerated && " 조 설정에서 조별 인원을 설정하고 조를 생성하세요."}
        </Typography>
      </Alert>

      {!groupsGenerated ? (
        <Card sx={{ textAlign: 'center', p: 4 }}>
          <CardContent>
            <Group sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              조 편성이 필요합니다
            </Typography>
            <Typography color="textSecondary" paragraph>
              조 설정에서 조별 인원을 설정하고 조를 편성해주세요.
            </Typography>
            <Button
              variant="contained"
              onClick={() => setSettingsOpen(true)}
              startIcon={<Settings />}
              size="large"
            >
              조 편성하기
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Group Accordions */}
          <Box sx={{ mb: 3 }}>
            {groups.map((group) => (
              <Accordion
                key={group.id}
                expanded={expandedGroup === group.id}
                onChange={handleAccordionChange(group.id)}
                sx={{ mb: 1 }}
              >
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Typography variant="h6" color="primary">
                      {group.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      ({group.participants.length}명)
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, ml: 'auto', mr: 2 }}>
                      {group.participants.slice(0, 4).map(p => (
                        <Chip key={p.id} label={p.name} size="small" />
                      ))}
                      {group.participants.length > 4 && (
                        <Chip label={`+${group.participants.length - 4}`} size="small" variant="outlined" />
                      )}
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <RoundRobinMatrix
                    participants={group.participants}
                    matches={group.matches}
                    onUpdateMatch={handleMatchUpdate}
                    isEditable={true}
                  />
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>

          {/* Overall Tournament Standings */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              🏅 전체 토너먼트 순위
            </Typography>
            <Grid container spacing={2}>
              {getOverallStandings().map((standing, index) => (
                <Grid item xs={12} sm={6} md={4} key={standing.participant.id}>
                  <Card 
                    sx={{ 
                      bgcolor: index < 3 ? 
                        (index === 0 ? 'gold' : index === 1 ? 'silver' : '#CD7F32') : 
                        'background.paper',
                      border: standing.groupRank === 1 ? '2px solid #4caf50' : '1px solid #e0e0e0'
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="h6" color={index < 3 ? 'white' : 'inherit'}>
                            {index + 1}위
                            {index === 0 && '🥇'}
                            {index === 1 && '🥈'}  
                            {index === 2 && '🥉'}
                          </Typography>
                          <Typography fontWeight="bold" color={index < 3 ? 'white' : 'inherit'}>
                            {standing.participant.name}
                          </Typography>
                          <Typography variant="body2" color={index < 3 ? 'rgba(255,255,255,0.7)' : 'textSecondary'}>
                            {standing.groupName} {standing.groupRank}위
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="body2" color={index < 3 ? 'white' : 'inherit'}>
                            {standing.wins}승 {standing.losses}패
                          </Typography>
                          <Typography variant="body2" color={index < 3 ? 'white' : 'primary.main'}>
                            {standing.points}점
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </>
      )}

      {/* Group Settings Dialog */}
      <Dialog 
        open={settingsOpen} 
        onClose={() => setSettingsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>조별 리그전 설정</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              참가자 정보
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              총 참가자: {availableParticipants.length}명
            </Alert>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>조별 최대 인원</InputLabel>
              <Select
                value={groupSize}
                onChange={(e) => setGroupSize(Number(e.target.value))}
                label="조별 최대 인원"
              >
                <MenuItem value={3}>3명 (2경기씩)</MenuItem>
                <MenuItem value={4}>4명 (3경기씩)</MenuItem>
                <MenuItem value={5}>5명 (4경기씩)</MenuItem>
                <MenuItem value={6}>6명 (5경기씩)</MenuItem>
                <MenuItem value={8}>8명 (7경기씩)</MenuItem>
              </Select>
            </FormControl>

            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" gutterBottom>
                예상 조 편성
              </Typography>
              <Typography variant="body2">
                • 총 조 개수: {Math.ceil(availableParticipants.length / groupSize)}개<br />
                • 조당 경기 수: {groupSize > 1 ? (groupSize * (groupSize - 1)) / 2 : 0}경기<br />
                • 총 경기 수: {Math.ceil(availableParticipants.length / groupSize) * ((groupSize * (groupSize - 1)) / 2)}경기
              </Typography>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>취소</Button>
          <Button 
            onClick={generateGroups} 
            variant="contained"
            startIcon={<Shuffle />}
          >
            조 편성 생성
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GroupRoundRobin;