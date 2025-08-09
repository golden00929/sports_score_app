import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  CalendarToday,
  LocationOn,
  People,
  MonetizationOn,
  CheckCircle,
  Settings,
} from '@mui/icons-material';
import { useQuery, useQueryClient } from 'react-query';
import apiService from '../services/api';
import { brandColors } from '../styles/brand';
import { formatDate, formatDateRange, convertISOToFormDate, getTodayForForm } from '../utils/dateFormat';
import DateInput from './DateInput';

interface Tournament {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  registrationStart: string;
  registrationEnd: string;
  location: string;
  venue?: string;
  maxParticipants: number;
  participantFee?: number;
  status: string;
  createdAt: string;
  stats?: {
    approvedParticipants: number;
    totalBrackets: number;
  };
}

interface TournamentManagerProps {
  onSelectTournament?: (tournament: Tournament) => void;
  onSelectTournamentForManagement?: (tournament: Tournament) => void;
}

const TournamentManager: React.FC<TournamentManagerProps> = ({ 
  onSelectTournament, 
  onSelectTournamentForManagement 
}) => {
  const queryClient = useQueryClient();
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tournamentToDelete, setTournamentToDelete] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form data for creating/editing tournaments
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    registrationStart: '',
    registrationEnd: '',
    location: '',
    venue: '',
    maxParticipants: 64,
    participantFee: 200000,
  });

  // Fetch all tournaments
  const { data: tournamentsData, isLoading, refetch } = useQuery(
    'all-tournaments-admin',
    () => apiService.getAllTournaments(),
    {
      onError: (error) => {
        console.error('Failed to fetch tournaments:', error);
        setError('대회 목록을 불러오는데 실패했습니다.');
      },
    }
  );

  const tournaments = tournamentsData?.data || [];

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      registrationStart: '',
      registrationEnd: '',
      location: '',
      venue: '',
      maxParticipants: 64,
      participantFee: 200000,
    });
    setSelectedTournament(null);
  };

  const handleCreateClick = () => {
    const today = getTodayForForm();
    setFormData({
      name: '',
      description: '',
      startDate: today,
      endDate: today,
      registrationStart: today,
      registrationEnd: today,
      location: '',
      venue: '',
      maxParticipants: 64,
      participantFee: 200000,
    });
    setSelectedTournament(null);
    setCreateDialogOpen(true);
  };

  const handleEditClick = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setFormData({
      name: tournament.name,
      description: tournament.description || '',
      startDate: convertISOToFormDate(tournament.startDate),
      endDate: convertISOToFormDate(tournament.endDate),
      registrationStart: convertISOToFormDate(tournament.registrationStart),
      registrationEnd: convertISOToFormDate(tournament.registrationEnd),
      location: tournament.location,
      venue: tournament.venue || '',
      maxParticipants: tournament.maxParticipants,
      participantFee: tournament.participantFee || 200000,
    });
    setCreateDialogOpen(true);
  };

  const handleDeleteClick = (tournament: Tournament) => {
    setTournamentToDelete(tournament);
    setDeleteDialogOpen(true);
  };

  const handleSelectTournament = (tournament: Tournament) => {
    if (onSelectTournament) {
      onSelectTournament(tournament);
    }
  };

  const handleSelectTournamentForManagement = (tournament: Tournament) => {
    if (onSelectTournamentForManagement) {
      onSelectTournamentForManagement(tournament);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      // Validate form data
      if (!formData.name || !formData.location || !formData.startDate || !formData.endDate) {
        setError('필수 필드를 모두 입력해주세요.');
        setLoading(false);
        return;
      }

      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        setError('시작일이 종료일보다 늦을 수 없습니다.');
        setLoading(false);
        return;
      }

      if (selectedTournament) {
        // Update existing tournament
        await apiService.updateTournament(selectedTournament.id, {
          name: formData.name,
          description: formData.description,
          startDate: formData.startDate,
          endDate: formData.endDate,
          registrationEnd: formData.registrationEnd || formData.startDate,
          location: formData.location,
          maxParticipants: formData.maxParticipants,
        });
      } else {
        // Create new tournament
        console.log('Creating new tournament with data:', formData);
        
        const tournamentData = {
          name: formData.name,
          description: formData.description || '',
          startDate: formData.startDate,
          endDate: formData.endDate,
          registrationStart: formData.registrationStart || formData.startDate,
          registrationEnd: formData.registrationEnd || formData.startDate,
          location: formData.location,
          venue: formData.venue || formData.location,
          maxParticipants: formData.maxParticipants,
          participantFee: formData.participantFee,
        };
        
        const response = await apiService.createTournamentJSON(tournamentData);
        console.log('Create tournament response:', response);
      }

      setCreateDialogOpen(false);
      resetForm();
      await refetch();
      queryClient.invalidateQueries('tournament-info');
    } catch (error: any) {
      console.error('Tournament save failed:', error);
      setError(error.response?.data?.message || '대회 저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!tournamentToDelete) return;

    try {
      setLoading(true);
      setError('');

      await apiService.deleteTournament(tournamentToDelete.id);
      
      setDeleteDialogOpen(false);
      setTournamentToDelete(null);
      await refetch();
      queryClient.invalidateQueries('tournament-info');
    } catch (error: any) {
      console.error('Tournament delete failed:', error);
      setError(error.response?.data?.message || '대회 삭제 중 오류가 발생했습니다.');
      setDeleteDialogOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'warning';
      case 'ongoing': return 'success';
      case 'completed': return 'default';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'upcoming': return '예정';
      case 'ongoing': return '진행중';
      case 'completed': return '완료';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">대회 관리</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateClick}
            sx={{ backgroundColor: brandColors.primary.main }}
          >
            새 대회 생성
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>대회명</TableCell>
                <TableCell>기간</TableCell>
                <TableCell>장소</TableCell>
                <TableCell>상태</TableCell>
                <TableCell>참가자</TableCell>
                <TableCell>참가비</TableCell>
                <TableCell>생성일</TableCell>
                <TableCell align="center">액션</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tournaments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="textSecondary">
                      등록된 대회가 없습니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                tournaments.map((tournament: Tournament) => (
                  <TableRow key={tournament.id}>
                    <TableCell>
                      <Typography variant="subtitle2">{tournament.name}</Typography>
                      {tournament.description && (
                        <Typography variant="caption" color="textSecondary">
                          {tournament.description.substring(0, 50)}
                          {tournament.description.length > 50 ? '...' : ''}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDateRange(tournament.startDate, tournament.endDate)}
                      </Typography>
                    </TableCell>
                    <TableCell>{tournament.location}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(tournament.status)}
                        color={getStatusColor(tournament.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {tournament.stats?.approvedParticipants || 0} / {tournament.maxParticipants}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {tournament.participantFee?.toLocaleString() || '0'}₫
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(tournament.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {onSelectTournamentForManagement && (
                          <IconButton
                            size="small"
                            onClick={() => handleSelectTournamentForManagement(tournament)}
                            color="info"
                            title="관리"
                          >
                            <Settings />
                          </IconButton>
                        )}
                        {onSelectTournament && (
                          <IconButton
                            size="small"
                            onClick={() => handleSelectTournament(tournament)}
                            color="success"
                            title="세부사항"
                          >
                            <Visibility />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          onClick={() => handleEditClick(tournament)}
                          color="primary"
                          title="편집"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(tournament)}
                          color="error"
                          title="삭제"
                          disabled={
                            (tournament.stats?.approvedParticipants || 0) > 0 ||
                            (tournament.stats?.totalBrackets || 0) > 0
                          }
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>

      {/* Create/Edit Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedTournament ? '대회 정보 수정' : '새 대회 생성'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="대회명"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="대회 설명"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DateInput
                fullWidth
                label="시작일"
                value={formData.startDate}
                onChange={(value) => setFormData({ ...formData, startDate: value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DateInput
                fullWidth
                label="종료일"
                value={formData.endDate}
                onChange={(value) => setFormData({ ...formData, endDate: value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DateInput
                fullWidth
                label="신청 시작일"
                value={formData.registrationStart}
                onChange={(value) => setFormData({ ...formData, registrationStart: value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DateInput
                fullWidth
                label="신청 마감일"
                value={formData.registrationEnd}
                onChange={(value) => setFormData({ ...formData, registrationEnd: value })}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="대회 장소"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="최대 참가인원"
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) || 0 })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="경기장명"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="참가비 (VND)"
                type="number"
                value={formData.participantFee}
                onChange={(e) => setFormData({ ...formData, participantFee: parseInt(e.target.value) || 0 })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>취소</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : (selectedTournament ? '수정' : '생성')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>대회 삭제 확인</DialogTitle>
        <DialogContent>
          <Typography>
            "{tournamentToDelete?.name}" 대회를 정말로 삭제하시겠습니까?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            참가자나 대진표가 있는 대회는 삭제할 수 없습니다.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>취소</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : '삭제'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default TournamentManager;