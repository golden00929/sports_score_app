import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  Avatar,
  Tabs,
  Tab,
  FormControlLabel,
} from '@mui/material';
import {
  People,
  EmojiEvents,
  Schedule,
  Settings,
  Logout,
  AccountCircle,
  Add,
  Edit,
  Upload,
  Download,
  CheckCircle,
  Cancel,
  Pending,
  Payment,
  Image,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import BracketVisualizer from '../components/BracketVisualizer';
import SlideManager from '../components/SlideManager';
import TournamentManager from '../components/TournamentManager';
import { formatDate, formatDateRange, convertISOToFormDate } from '../utils/dateFormat';
import DateInput from '../components/DateInput';

interface TournamentStats {
  totalParticipants: number;
  approvedParticipants: number;
  pendingParticipants: number;
  paidParticipants: number;
}

interface Participant {
  id: string;
  name: string;
  gender: string;
  birthYear?: number;
  province: string;
  district: string;
  phone: string;
  experience?: string;
  skillLevel: string;
  eventType: string;
  partnerName?: string;
  partnerPhone?: string;
  approvalStatus: string;
  paymentStatus: string;
  registrationDate: string;
}

interface TournamentInfo {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  registrationStart?: string;
  registrationEnd?: string;
  location: string;
  maxParticipants: number;
  status: string;
}

interface Bracket {
  id: string;
  name: string;
  skillLevel: string;
  eventType: string;
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

const AdminDashboard: React.FC = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [tournament, setTournament] = useState<TournamentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'payment'>('approve');
  const [selectedTournamentForDetails, setSelectedTournamentForDetails] = useState<any>(null);
  const [tournamentDetailsOpen, setTournamentDetailsOpen] = useState(false);
  const [selectedTournamentContext, setSelectedTournamentContext] = useState<any>(null);
  const [editTournamentOpen, setEditTournamentOpen] = useState(false);
  const [editTournamentData, setEditTournamentData] = useState({
    name: '',
    description: '',
    location: '',
    maxParticipants: 64,
    startDate: '',
    endDate: '',
    registrationEnd: '',
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentSettingsTab, setCurrentSettingsTab] = useState(0);
  const [passwordChangeData, setPasswordChangeData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileData, setProfileData] = useState({
    name: admin?.name || '',
    email: admin?.email || '',
  });
  
  // Bracket management states
  const [brackets, setBrackets] = useState<Bracket[]>([]);
  const [createBracketOpen, setCreateBracketOpen] = useState(false);
  const [visualizerOpen, setVisualizerOpen] = useState(false);
  const [bracketForVisualizer, setBracketForVisualizer] = useState<Bracket | null>(null);
  const [newBracket, setNewBracket] = useState({
    name: '',
    skillLevel: 'B',
    eventType: 'men_singles',
    type: 'single_elimination',
    participantIds: [] as string[],
    maxParticipants: 16,
  });

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load tournament info
      console.log('Loading tournament info...');
      const tournamentResponse = await apiService.getTournamentInfo();
      console.log('Tournament response:', tournamentResponse);
      if (tournamentResponse.success) {
        setTournament(tournamentResponse.data);
      }

      // Load tournament stats
      console.log('Loading tournament stats...');
      const statsResponse = await apiService.getTournamentStats();
      console.log('Stats response:', statsResponse);

      // Load participants (filtered by selected tournament or all)
      console.log('Loading participants...');
      const participantsParams = selectedTournamentContext 
        ? { limit: 1000, tournamentId: selectedTournamentContext.id }
        : { limit: 1000 };
      const participantsResponse = await apiService.getParticipants(participantsParams);
      console.log('Participants response:', participantsResponse);
      if (participantsResponse.success) {
        console.log('Participants data:', participantsResponse.data);
        console.log('Participants array:', participantsResponse.data?.participants);
        const participantsList = participantsResponse.data?.participants || [];
        console.log('Setting participants:', participantsList);
        console.log('Participants count:', participantsList.length);
        console.log('Approved participants:', participantsList.filter((p: any) => p.approvalStatus === 'approved').length);
        setParticipants(participantsList);
      }

      // Load brackets (filtered by selected tournament)
      const tournamentIdForBrackets = selectedTournamentContext?.id || tournament?.id;
      if (tournamentIdForBrackets) {
        const bracketsResponse = await apiService.getBrackets(tournamentIdForBrackets);
        if (bracketsResponse.success) {
          setBrackets(bracketsResponse.data);
        }
      } else {
        setBrackets([]);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedTournamentContext, tournament?.id]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    handleClose();
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleParticipantAction = (participant: Participant, action: 'approve' | 'reject' | 'payment') => {
    setSelectedParticipant(participant);
    setActionType(action);
    setDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedParticipant) return;

    try {
      if (actionType === 'approve' || actionType === 'reject') {
        const status = actionType === 'approve' ? 'approved' : 'rejected';
        await apiService.updateParticipantApproval(selectedParticipant.id, status);
      } else if (actionType === 'payment') {
        await apiService.updateParticipantPayment(selectedParticipant.id, 'completed');
      }
      
      setDialogOpen(false);
      setSelectedParticipant(null);
      loadDashboardData();
    } catch (error) {
      console.error('Action failed:', error);
    }
  };

  const handleResetPayment = async (participant: Participant) => {
    try {
      await apiService.updateParticipantPayment(participant.id, 'pending');
      loadDashboardData();
    } catch (error) {
      console.error('Payment reset failed:', error);
    }
  };



  const handleSaveTournament = async () => {
    try {
      if (!tournament) return;
      
      console.log('Tournament data to save:', editTournamentData);
      const response = await apiService.updateTournament(tournament.id, editTournamentData);
      
      if (response.success) {
        setEditTournamentOpen(false);
        loadDashboardData(); // 데이터 새로고침
      }
    } catch (error: any) {
      console.error('Tournament update failed:', error);
    }
  };

  const handleExcelDownload = async () => {
    try {
      console.log('Starting Excel download...');
      
      if (participants.length === 0) {
        console.error('다운로드할 참가자 데이터가 없습니다.');
        return;
      }
      
      // 참가자 데이터를 CSV 형식으로 변환하여 다운로드
      const csvData = convertToCSV(participants);
      downloadCSV(csvData, `참가자_목록_${formatDate(new Date())}.csv`.replace(/\//g, '-'));
      
      console.log(`${participants.length}명의 참가자 정보를 다운로드했습니다.`);
      
    } catch (error) {
      console.error('Excel download failed:', error);
    }
  };

  const convertToCSV = (data: Participant[]) => {
    const headers = [
      '이름',
      '성별', 
      '출생년도',
      '거주지역',
      '구/군',
      '전화번호',
      '경력',
      '실력레벨',
      '경기종목',
      '파트너명',
      '파트너전화번호',
      '승인상태',
      '결제상태',
      '신청일'
    ];
    
    const csvContent = [
      headers.join(','),
      ...data.map(participant => [
        `"${participant.name}"`,
        participant.gender === 'male' ? '남성' : '여성',
        participant.birthYear || '정보없음',
        `"${participant.province}"`,
        `"${participant.district}"`,
        `"${participant.phone}"`,
        `"${participant.experience || ''}"`,
        participant.skillLevel,
        getEventTypeName(participant.eventType),
        `"${participant.partnerName || ''}"`,
        `"${participant.partnerPhone || ''}"`,
        getApprovalStatusName(participant.approvalStatus),
        getPaymentStatusName(participant.paymentStatus),
        formatDate(participant.registrationDate)
      ].join(','))
    ].join('\n');
    
    return csvContent;
  };

  const getEventTypeName = (eventType: string) => {
    const eventTypeNames: { [key: string]: string } = {
      'men_singles': '남자단식',
      'women_singles': '여자단식', 
      'men_doubles': '남자복식',
      'women_doubles': '여자복식',
      'mixed_doubles': '혼성복식'
    };
    return eventTypeNames[eventType] || eventType;
  };

  const getApprovalStatusName = (status: string) => {
    return status === 'approved' ? '승인완료' : status === 'rejected' ? '거부됨' : '승인대기';
  };

  const getPaymentStatusName = (status: string) => {
    return status === 'completed' ? '결제완료' : status === 'cancelled' ? '결제취소' : '결제대기';
  };

  const downloadCSV = (csvContent: string, fileName: string) => {
    // BOM 추가 (한글 깨짐 방지)
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenSettings = () => {
    setProfileData({
      name: admin?.name || '',
      email: admin?.email || '',
    });
    setSettingsOpen(true);
    handleClose();
  };

  const handleSettingsTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentSettingsTab(newValue);
  };

  const handlePasswordChange = async () => {
    try {
      if (passwordChangeData.newPassword !== passwordChangeData.confirmPassword) {
        console.error('Password confirmation mismatch');
        return;
      }

      if (passwordChangeData.newPassword.length < 6) {
        console.error('Password too short');
        return;
      }

      const response = await apiService.changePassword(
        passwordChangeData.currentPassword,
        passwordChangeData.newPassword
      );

      if (response.success) {
        setPasswordChangeData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        alert('비밀번호가 성공적으로 변경되었습니다.');
      }
    } catch (error: any) {
      console.error('Password change failed:', error);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      // Profile update API would be implemented here
      console.log('Profile update:', profileData);
      alert('프로필이 업데이트되었습니다.');
    } catch (error: any) {
      console.error('Profile update failed:', error);
    }
  };

  // Bracket management functions
  const handleCreateBracket = async () => {
    try {
      const tournamentId = selectedTournamentContext?.id || tournament?.id;
      if (!tournamentId) return;
      
      const bracketData = {
        ...newBracket,
        participantIds: [],
        teamCount: newBracket.maxParticipants,
        bracketSize: newBracket.maxParticipants,
      };
      
      const response = await apiService.createBracket(tournamentId, bracketData);
      if (response.success) {
        setCreateBracketOpen(false);
        setNewBracket({
          name: '',
          skillLevel: 'B',
          eventType: 'men_singles',
          type: 'single_elimination',
          participantIds: [],
          maxParticipants: 16,
        });
        loadDashboardData();
        
        // 생성된 브라켓을 자동으로 시각화기에서 열기
        if (response.data?.bracket) {
          setBracketForVisualizer(response.data.bracket);
          setVisualizerOpen(true);
        }
      }
    } catch (error: any) {
      console.error('Error creating bracket:', error);
      console.error('Bracket creation failed:', error);
    }
  };

  const openBracketVisualizer = (bracket: Bracket) => {
    setBracketForVisualizer(bracket);
    setVisualizerOpen(true);
  };

  const handleUpdateBracketMatches = async (bracketId: string, matches: any[]) => {
    try {
      const response = await apiService.updateBracketMatches(bracketId, matches);
      if (response.success) {
        await loadDashboardData();
        setVisualizerOpen(false);
        setBracketForVisualizer(null);
      }
    } catch (error: any) {
      console.error('Bracket update failed:', error);
    }
  };

  const handleUpdateBracketStatus = async (bracketId: string, status: string) => {
    try {
      await apiService.updateBracketStatus(bracketId, status);
      loadDashboardData();
    } catch (error: any) {
      console.error('Bracket status update failed:', error);
    }
  };

  const handleDeleteBracket = async (bracketId: string) => {
    if (window.confirm('정말로 이 브라켓을 삭제하시겠습니까?')) {
      try {
        await apiService.deleteBracket(bracketId);
        loadDashboardData();
      } catch (error: any) {
        console.error('Bracket deletion failed:', error);
      }
    }
  };

  const handleSelectTournamentForDetails = (tournament: any) => {
    setSelectedTournamentForDetails(tournament);
    setTournamentDetailsOpen(true);
  };

  const handleSelectTournamentForContext = (tournament: any) => {
    setSelectedTournamentContext(tournament);
    // 대회 선택 후 참가자 관리 탭으로 이동
    setCurrentTab(2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'default';
      case 'published': return 'info';
      case 'ongoing': return 'warning';
      case 'completed': return 'success';
      case 'upcoming': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'upcoming': return '예정';
      case 'ongoing': return '진행중';
      case 'completed': return '완료';
      case 'draft': return '초안';
      case 'published': return '발표됨';
      default: return status;
    }
  };

  const getStatusChip = (status: string, type: 'approval' | 'payment') => {
    let color: 'success' | 'warning' | 'error' | 'default' = 'default';
    let icon = <Pending />;

    if (type === 'approval') {
      switch (status) {
        case 'approved':
          color = 'success';
          icon = <CheckCircle />;
          break;
        case 'rejected':
          color = 'error';
          icon = <Cancel />;
          break;
        default:
          color = 'warning';
          icon = <Pending />;
      }
    } else {
      switch (status) {
        case 'completed':
          color = 'success';
          icon = <Payment />;
          break;
        case 'cancelled':
          color = 'error';
          icon = <Cancel />;
          break;
        default:
          color = 'warning';
          icon = <Pending />;
      }
    }

    return (
      <Chip
        size="small"
        label={status}
        color={color}
        icon={icon}
      />
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Top App Bar */}
      <AppBar position="static" sx={{ backgroundColor: '#FF0000' }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <img 
              src="/miiracer-logo.jpg" 
              alt="Miiracer Logo" 
              style={{ 
                height: 40, 
                marginRight: 16,
                borderRadius: 4 
              }} 
            />
            <Typography variant="h6" component="div">
              Miiracer 관리자 대시보드
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 2 }}>
              {admin?.name}
            </Typography>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255,255,255,0.2)' }}>
                <AccountCircle />
              </Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleOpenSettings}>
                <Settings sx={{ mr: 1 }} /> 설정
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ mr: 1 }} /> 로그아웃
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 3 }}>
        {/* Selected Tournament Context */}
        {selectedTournamentContext && (
          <Card sx={{ mb: 3, backgroundColor: '#f8f9fa', border: '2px solid #e3f2fd' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" color="primary" gutterBottom>
                    🎯 선택된 대회: {selectedTournamentContext.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {formatDateRange(selectedTournamentContext.startDate, selectedTournamentContext.endDate)} • {selectedTournamentContext.location}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setSelectedTournamentContext(null)}
                  size="small"
                >
                  선택 해제
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Navigation Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<Image />} label="슬라이드 관리" />
            <Tab icon={<Settings />} label="대회 관리" />
            <Tab icon={<People />} label="참가자 관리" />
            <Tab icon={<EmojiEvents />} label="대진표 관리" />
            <Tab icon={<Schedule />} label="경기 일정" />
            <Tab icon={<Upload />} label="파일 관리" />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {currentTab === 0 && (
          <SlideManager />
        )}

        {currentTab === 1 && (
          <TournamentManager 
            onSelectTournament={handleSelectTournamentForDetails}
            onSelectTournamentForManagement={handleSelectTournamentForContext}
          />
        )}

        {currentTab === 2 && (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6">
                    참가자 목록
                    {selectedTournamentContext && (
                      <Chip 
                        size="small" 
                        label={selectedTournamentContext.name}
                        color="primary"
                        sx={{ ml: 2 }}
                      />
                    )}
                  </Typography>
                  {!selectedTournamentContext && (
                    <Typography variant="body2" color="textSecondary">
                      대회를 선택하여 해당 대회의 참가자를 관리하세요.
                    </Typography>
                  )}
                </Box>
                <Button 
                  startIcon={<Download />} 
                  variant="outlined"
                  onClick={handleExcelDownload}
                  disabled={participants.length === 0}
                >
                  엑셀 다운로드
                </Button>
              </Box>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>이름</TableCell>
                      <TableCell>성별</TableCell>
                      <TableCell>지역</TableCell>
                      <TableCell>전화번호</TableCell>
                      <TableCell>경기종목</TableCell>
                      <TableCell>레벨</TableCell>
                      <TableCell>승인상태</TableCell>
                      <TableCell>결제상태</TableCell>
                      <TableCell>신청일</TableCell>
                      <TableCell>액션</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {participants.length > 0 ? participants.map((participant) => (
                      <TableRow key={participant.id}>
                        <TableCell>{participant.name}</TableCell>
                        <TableCell>{participant.gender === 'male' ? '남성' : '여성'}</TableCell>
                        <TableCell>
                          {participant.province === 'HCM' ? '호치민시' : participant.province === 'HN' ? '하노이' : participant.province}
                        </TableCell>
                        <TableCell>{participant.phone}</TableCell>
                        <TableCell>
                          {getEventTypeName(participant.eventType)}
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={participant.skillLevel} />
                        </TableCell>
                        <TableCell>
                          {getStatusChip(participant.approvalStatus, 'approval')}
                        </TableCell>
                        <TableCell>
                          {getStatusChip(participant.paymentStatus, 'payment')}
                        </TableCell>
                        <TableCell>
                          {formatDate(participant.registrationDate)}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {/* 승인 관련 버튼 */}
                            {participant.approvalStatus === 'pending' ? (
                              <>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  onClick={() => handleParticipantAction(participant, 'approve')}
                                >
                                  승인
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  onClick={() => handleParticipantAction(participant, 'reject')}
                                >
                                  거부
                                </Button>
                              </>
                            ) : participant.approvalStatus === 'approved' ? (
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() => handleParticipantAction(participant, 'reject')}
                              >
                                승인취소
                              </Button>
                            ) : (
                              <Button
                                size="small"
                                variant="outlined" 
                                color="success"
                                onClick={() => handleParticipantAction(participant, 'approve')}
                              >
                                재승인
                              </Button>
                            )}
                            
                            {/* 결제 관련 버튼 */}
                            {participant.paymentStatus === 'pending' && participant.approvalStatus === 'approved' && (
                              <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                onClick={() => handleParticipantAction(participant, 'payment')}
                              >
                                결제확인
                              </Button>
                            )}
                            
                            {participant.paymentStatus === 'completed' && (
                              <Button
                                size="small"
                                variant="outlined"
                                color="warning"
                                onClick={() => handleResetPayment(participant)}
                              >
                                결제취소
                              </Button>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={10} align="center">
                          <Typography color="textSecondary">
                            참가자가 없습니다.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        {currentTab === 3 && (
          <Card>
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6">
                  대진표 관리
                  {selectedTournamentContext && (
                    <Chip 
                      size="small" 
                      label={selectedTournamentContext.name}
                      color="primary"
                      sx={{ ml: 2 }}
                    />
                  )}
                </Typography>
                {!selectedTournamentContext && (
                  <Typography variant="body2" color="textSecondary">
                    대회를 선택하여 해당 대회의 대진표를 관리하세요.
                  </Typography>
                )}
              </Box>
              
              {/* 새 브라켓 생성 버튼 */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    {brackets.length > 0 ? `총 ${brackets.length}개의 브라켓이 생성되었습니다.` : '생성된 브라켓이 없습니다.'}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => setCreateBracketOpen(true)}
                    startIcon={<Add />}
                    disabled={!selectedTournamentContext && !tournament}
                  >
                    새 브라켓 생성
                  </Button>
                </Box>

                {/* 빠른 생성 템플릿 */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Typography variant="body2" color="textSecondary" sx={{ mr: 1 }}>
                    빠른 생성:
                  </Typography>
                  <Chip
                    label="A급 남자단식 16강"
                    clickable
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setNewBracket({
                        name: 'A급 남자 단식',
                        skillLevel: 'A',
                        eventType: 'men_singles',
                        type: 'single_elimination',
                        participantIds: [],
                        maxParticipants: 16
                      });
                      setCreateBracketOpen(true);
                    }}
                    disabled={!selectedTournamentContext && !tournament}
                  />
                  <Chip
                    label="B급 여자단식 8강"
                    clickable
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setNewBracket({
                        name: 'B급 여자 단식',
                        skillLevel: 'B',
                        eventType: 'women_singles',
                        type: 'single_elimination',
                        participantIds: [],
                        maxParticipants: 8
                      });
                      setCreateBracketOpen(true);
                    }}
                    disabled={!selectedTournamentContext && !tournament}
                  />
                  <Chip
                    label="혼성복식 리그전"
                    clickable
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setNewBracket({
                        name: '혼성 복식 리그전',
                        skillLevel: 'B',
                        eventType: 'mixed_doubles',
                        type: 'round_robin',
                        participantIds: [],
                        maxParticipants: 8
                      });
                      setCreateBracketOpen(true);
                    }}
                    disabled={!selectedTournamentContext && !tournament}
                  />
                  <Chip
                    label="남자복식 16강"
                    clickable
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setNewBracket({
                        name: '남자 복식',
                        skillLevel: 'A',
                        eventType: 'men_doubles',
                        type: 'single_elimination',
                        participantIds: [],
                        maxParticipants: 16
                      });
                      setCreateBracketOpen(true);
                    }}
                    disabled={!selectedTournamentContext && !tournament}
                  />
                </Box>
              </Box>

              {brackets.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
                  <EmojiEvents sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    브라켓을 생성하여 시작하세요
                  </Typography>
                  <Typography color="textSecondary" paragraph>
                    참가자들을 승인한 후 다양한 종목의 브라켓을 생성할 수 있습니다.
                  </Typography>
                </Paper>
              ) : (
                <Grid container spacing={2}>
                  {brackets.map((bracket) => (
                    <Grid item xs={12} md={6} lg={4} key={bracket.id}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Typography variant="h6" gutterBottom>
                              {bracket.name}
                            </Typography>
                            <Chip 
                              label={bracket.status} 
                              color={getStatusColor(bracket.status) as any}
                              size="small"
                            />
                          </Box>
                          
                          <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                            <Chip size="small" label={`${bracket.skillLevel}급`} color="primary" variant="outlined" />
                            <Chip size="small" label={bracket.eventType === 'men_singles' ? '남자단식' :
                                                      bracket.eventType === 'women_singles' ? '여자단식' :
                                                      bracket.eventType === 'men_doubles' ? '남자복식' :
                                                      bracket.eventType === 'women_doubles' ? '여자복식' :
                                                      bracket.eventType === 'mixed_doubles' ? '혼성복식' : '기타'} />
                            <Chip size="small" label={bracket.type === 'single_elimination' ? '토너먼트' : '리그전'} color="secondary" variant="outlined" />
                          </Box>
                          
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            매치 수: {bracket.matches?.length || 0}개 • 참가자: {bracket.participants ? bracket.participants.split(',').length : 0}팀
                          </Typography>
                          
                          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                            생성일: {new Date(bracket.createdAt).toLocaleDateString('ko-KR')}
                          </Typography>
                          
                          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => openBracketVisualizer(bracket)}
                              startIcon={<Edit />}
                            >
                              편집
                            </Button>
                            
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleUpdateBracketStatus(bracket.id, 
                                bracket.status === 'draft' ? 'published' : 
                                bracket.status === 'published' ? 'ongoing' : 'completed')}
                              disabled={bracket.status === 'completed'}
                            >
                              {bracket.status === 'draft' && '발표'}
                              {bracket.status === 'published' && '시작'}
                              {bracket.status === 'ongoing' && '시작됨'}
                              {bracket.status === 'completed' && '완료됨'}
                            </Button>
                            
                            <Button
                              size="small"
                              color="error"
                              onClick={() => handleDeleteBracket(bracket.id)}
                            >
                              삭제
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        )}

        {currentTab === 4 && (
          <Card>
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  경기 일정 관리
                  {selectedTournamentContext && (
                    <Chip 
                      size="small" 
                      label={selectedTournamentContext.name}
                      color="primary"
                      sx={{ ml: 2 }}
                    />
                  )}
                </Typography>
                {!selectedTournamentContext && (
                  <Typography variant="body2" color="textSecondary">
                    대회를 선택하여 해당 대회의 경기 일정을 관리하세요.
                  </Typography>
                )}
              </Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                경기 일정 관리 기능이 곧 완성됩니다.
              </Alert>
            </CardContent>
          </Card>
        )}

        {currentTab === 5 && (
          <Card>
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  파일 관리
                  {selectedTournamentContext && (
                    <Chip 
                      size="small" 
                      label={selectedTournamentContext.name}
                      color="primary"
                      sx={{ ml: 2 }}
                    />
                  )}
                </Typography>
                {!selectedTournamentContext && (
                  <Typography variant="body2" color="textSecondary">
                    대회를 선택하여 해당 대회의 파일을 관리하세요.
                  </Typography>
                )}
              </Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                파일 업로드 및 관리 기능이 곧 완성됩니다.
              </Alert>
            </CardContent>
          </Card>
        )}
      </Container>

      {/* Action Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>
          {actionType === 'approve' && '참가자 승인'}
          {actionType === 'reject' && '참가자 거부'}
          {actionType === 'payment' && '결제 확인'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {selectedParticipant?.name}님을{' '}
            {actionType === 'approve' && '승인하시겠습니까?'}
            {actionType === 'reject' && '거부하시겠습니까?'}
            {actionType === 'payment' && '의 결제를 확인 처리하시겠습니까?'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>취소</Button>
          <Button onClick={confirmAction} variant="contained">
            확인
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tournament Edit Dialog */}
      <Dialog 
        open={editTournamentOpen} 
        onClose={() => setEditTournamentOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>대회 정보 편집</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="대회명"
                  value={editTournamentData.name}
                  onChange={(e) => setEditTournamentData({ 
                    ...editTournamentData, 
                    name: e.target.value 
                  })}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="대회 설명"
                  value={editTournamentData.description}
                  onChange={(e) => setEditTournamentData({ 
                    ...editTournamentData, 
                    description: e.target.value 
                  })}
                  multiline
                  rows={3}
                  margin="normal"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="대회 장소"
                  value={editTournamentData.location}
                  onChange={(e) => setEditTournamentData({ 
                    ...editTournamentData, 
                    location: e.target.value 
                  })}
                  margin="normal"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="최대 참가인원"
                  type="number"
                  value={editTournamentData.maxParticipants}
                  onChange={(e) => setEditTournamentData({ 
                    ...editTournamentData, 
                    maxParticipants: parseInt(e.target.value) || 0
                  })}
                  margin="normal"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <DateInput
                  fullWidth
                  label="대회 시작일"
                  value={editTournamentData.startDate}
                  onChange={(value) => setEditTournamentData({ 
                    ...editTournamentData, 
                    startDate: value 
                  })}
                  margin="normal"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <DateInput
                  fullWidth
                  label="대회 종룼일"
                  value={editTournamentData.endDate}
                  onChange={(value) => setEditTournamentData({ 
                    ...editTournamentData, 
                    endDate: value 
                  })}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditTournamentOpen(false)}>취소</Button>
          <Button onClick={handleSaveTournament} variant="contained">
            저장
          </Button>
        </DialogActions>
      </Dialog>

      {/* Admin Settings Dialog */}
      <Dialog 
        open={settingsOpen} 
        onClose={() => setSettingsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>관리자 설정</DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={currentSettingsTab} onChange={handleSettingsTabChange}>
              <Tab label="프로필" />
              <Tab label="비밀번호 변경" />
              <Tab label="시스템 설정" />
            </Tabs>
          </Box>

          {/* Profile Tab */}
          {currentSettingsTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                프로필 정보
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="관리자 이름"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="이메일"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    margin="normal"
                  />
                </Grid>
              </Grid>
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={handleProfileUpdate}
                >
                  프로필 업데이트
                </Button>
              </Box>
            </Box>
          )}

          {/* Password Change Tab */}
          {currentSettingsTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                비밀번호 변경
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="현재 비밀번호"
                    value={passwordChangeData.currentPassword}
                    onChange={(e) => setPasswordChangeData({ 
                      ...passwordChangeData, 
                      currentPassword: e.target.value 
                    })}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="새 비밀번호"
                    value={passwordChangeData.newPassword}
                    onChange={(e) => setPasswordChangeData({ 
                      ...passwordChangeData, 
                      newPassword: e.target.value 
                    })}
                    margin="normal"
                    helperText="최소 6자리 이상"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="새 비밀번호 확인"
                    value={passwordChangeData.confirmPassword}
                    onChange={(e) => setPasswordChangeData({ 
                      ...passwordChangeData, 
                      confirmPassword: e.target.value 
                    })}
                    margin="normal"
                  />
                </Grid>
              </Grid>
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={handlePasswordChange}
                  disabled={
                    !passwordChangeData.currentPassword || 
                    !passwordChangeData.newPassword || 
                    !passwordChangeData.confirmPassword
                  }
                >
                  비밀번호 변경
                </Button>
              </Box>
            </Box>
          )}

          {/* System Settings Tab */}
          {currentSettingsTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                시스템 설정
              </Typography>
              
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  데이터 관리
                </Typography>
                <Grid container spacing={2}>
                  <Grid item>
                    <Button variant="outlined" color="warning">
                      참가자 데이터 백업
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button variant="outlined" color="info">
                      대회 데이터 내보내기
                    </Button>
                  </Grid>
                </Grid>
              </Paper>

              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  토너먼트 설정
                </Typography>
                <FormControlLabel
                  control={<Chip label="활성" color="success" size="small" />}
                  label="참가 신청 접수 중"
                />
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  현재 참가자들이 신청할 수 있습니다.
                </Typography>
              </Paper>

              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  시스템 정보
                </Typography>
                <Typography variant="body2">
                  <strong>시스템 버전:</strong> Miiracer Sports v1.0.0<br />
                  <strong>데이터베이스:</strong> 연결됨<br />
                  <strong>마지막 백업:</strong> {formatDate(new Date())}
                </Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>닫기</Button>
        </DialogActions>
      </Dialog>

      {/* Create Bracket Dialog */}
      <Dialog 
        open={createBracketOpen} 
        onClose={() => setCreateBracketOpen(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>새 브라켓 생성</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="브라켓명"
                value={newBracket.name}
                onChange={(e) => setNewBracket({ ...newBracket, name: e.target.value })}
                placeholder="예: A급 남자 단식"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>실력 레벨</InputLabel>
                <Select
                  value={newBracket.skillLevel}
                  onChange={(e) => setNewBracket({ ...newBracket, skillLevel: e.target.value })}
                  label="실력 레벨"
                >
                  <MenuItem value="A">A급</MenuItem>
                  <MenuItem value="B">B급</MenuItem>
                  <MenuItem value="C">C급</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>경기 종목</InputLabel>
                <Select
                  value={newBracket.eventType}
                  onChange={(e) => setNewBracket({ ...newBracket, eventType: e.target.value })}
                  label="경기 종목"
                >
                  <MenuItem value="men_singles">남자단식</MenuItem>
                  <MenuItem value="women_singles">여자단식</MenuItem>
                  <MenuItem value="men_doubles">남자복식</MenuItem>
                  <MenuItem value="women_doubles">여자복식</MenuItem>
                  <MenuItem value="mixed_doubles">혼성복식</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>브라켓 형식</InputLabel>
                <Select
                  value={newBracket.type}
                  onChange={(e) => {
                    const newType = e.target.value;
                    const defaultParticipants = newType === 'single_elimination' ? 16 : 8;
                    setNewBracket({ ...newBracket, type: newType, maxParticipants: defaultParticipants });
                  }}
                  label="브라켓 형식"
                >
                  <MenuItem value="single_elimination">단일 토너먼트</MenuItem>
                  <MenuItem value="round_robin">
                    <Box>
                      <Typography variant="body1">리그전</Typography>
                      <Typography variant="caption" color="textSecondary">
                        8명 이하: 단일 리그, 9명 이상: 조별 리그
                      </Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="참가팀수"
                value={newBracket.maxParticipants}
                onChange={(e) => {
                  const value = Math.max(2, Math.min(128, Number(e.target.value) || 2));
                  setNewBracket({ ...newBracket, maxParticipants: value });
                }}
                inputProps={{
                  min: 2,
                  max: 128,
                  step: 1
                }}
                helperText="2팀부터 128팀까지 입력 가능합니다"
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ 
                p: 2, 
                bgcolor: 'grey.50', 
                borderRadius: 1, 
                border: '1px solid', 
                borderColor: 'grey.300' 
              }}>
                <Typography variant="subtitle2" gutterBottom color="primary">
                  📊 대진표 구조 미리보기
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {newBracket.type === 'single_elimination' ? (
                    <>
                      <strong>{newBracket.maxParticipants}팀 단일 토너먼트</strong>
                      <br />
                      • 총 {newBracket.maxParticipants - 1}경기
                      • {newBracket.maxParticipants === 4 ? '준결승 → 결승' : 
                         newBracket.maxParticipants === 8 ? '8강 → 준결승 → 결승' :
                         newBracket.maxParticipants === 16 ? '16강 → 8강 → 준결승 → 결승' :
                         newBracket.maxParticipants === 32 ? '32강 → 16강 → 8강 → 준결승 → 결승' :
                         newBracket.maxParticipants === 64 ? '64강 → 32강 → 16강 → 8강 → 준결승 → 결승' :
                         `${Math.log2(newBracket.maxParticipants)}라운드 토너먼트`}
                      • 패배 시 즉시 탈락
                    </>
                  ) : (
                    <>
                      <strong>{newBracket.maxParticipants}팀 리그전</strong>
                      <br />
                      {newBracket.maxParticipants <= 8 ? (
                        <>• 단일 리그: 모든 팀이 서로 경기
                        <br />• 총 {(newBracket.maxParticipants * (newBracket.maxParticipants - 1)) / 2}경기</>
                      ) : (
                        <>• 조별 리그: {Math.ceil(newBracket.maxParticipants / 4)}개 조로 나누어 진행
                        <br />• 조별 예선 후 결승 토너먼트</>
                      )}
                    </>
                  )}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateBracketOpen(false)}>취소</Button>
          <Button onClick={handleCreateBracket} variant="contained">
            생성
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tournament Details Dialog */}
      <Dialog
        open={tournamentDetailsOpen}
        onClose={() => setTournamentDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>대회 세부사항</DialogTitle>
        <DialogContent>
          {selectedTournamentForDetails && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    {selectedTournamentForDetails.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    대회 기간
                  </Typography>
                  <Typography variant="body1">
                    {formatDateRange(selectedTournamentForDetails.startDate, selectedTournamentForDetails.endDate)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    장소
                  </Typography>
                  <Typography variant="body1">
                    {selectedTournamentForDetails.location}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    최대 참가인원
                  </Typography>
                  <Typography variant="body1">
                    {selectedTournamentForDetails.maxParticipants}명
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    참가비
                  </Typography>
                  <Typography variant="body1">
                    {selectedTournamentForDetails.participantFee?.toLocaleString() || '0'}₫
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    현재 참가자
                  </Typography>
                  <Typography variant="body1">
                    {selectedTournamentForDetails.stats?.approvedParticipants || 0}명
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    상태
                  </Typography>
                  <Chip 
                    label={getStatusLabel(selectedTournamentForDetails.status)}
                    color={getStatusColor(selectedTournamentForDetails.status) as any}
                    size="small"
                  />
                </Grid>
                {selectedTournamentForDetails.description && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">
                      설명
                    </Typography>
                    <Typography variant="body1">
                      {selectedTournamentForDetails.description}
                    </Typography>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    생성일
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(selectedTournamentForDetails.createdAt)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTournamentDetailsOpen(false)}>닫기</Button>
        </DialogActions>
      </Dialog>

      {/* Bracket Visualizer Dialog */}
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
            <BracketVisualizer
              bracket={bracketForVisualizer}
              availableParticipants={participants.filter(p => p.approvalStatus === 'approved')}
              onUpdateBracket={handleUpdateBracketMatches}
              onClose={() => {
                setVisualizerOpen(false);
                setBracketForVisualizer(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;