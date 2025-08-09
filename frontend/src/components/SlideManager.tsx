import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  IconButton,
  Alert,
  Snackbar,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  DragHandle,
  Save,
  Cancel,
  Image,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import ImageUpload from './ImageUpload';

interface PromoSlide {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const SlideManager: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  // Get token from localStorage
  const getToken = () => localStorage.getItem('miiracer_token');
  const [slides, setSlides] = useState<PromoSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<PromoSlide | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, slideId: '', slideName: '' });

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    imageUrl: '',
    orderIndex: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const response = await fetch('/api/slides/admin', {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSlides(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch slides:', error);
      showSnackbar('슬라이드 목록을 불러올 수 없습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCreateSlide = () => {
    setEditingSlide(null);
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      imageUrl: '',
      orderIndex: slides.length,
      isActive: true,
    });
    setDialogOpen(true);
  };

  const handleEditSlide = (slide: PromoSlide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle || '',
      description: slide.description || '',
      imageUrl: slide.imageUrl || '',
      orderIndex: slide.orderIndex,
      isActive: slide.isActive,
    });
    setDialogOpen(true);
  };

  const handleDeleteSlide = (slide: PromoSlide) => {
    setDeleteDialog({ open: true, slideId: slide.id, slideName: slide.title });
  };

  const confirmDeleteSlide = async () => {
    try {
      const response = await fetch(`/api/slides/${deleteDialog.slideId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      });

      if (response.ok) {
        showSnackbar('슬라이드가 삭제되었습니다.', 'success');
        fetchSlides();
      } else {
        throw new Error('삭제 실패');
      }
    } catch (error) {
      console.error('Delete slide error:', error);
      showSnackbar('슬라이드 삭제 중 오류가 발생했습니다.', 'error');
    }
    setDeleteDialog({ open: false, slideId: '', slideName: '' });
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      showSnackbar('제목을 입력해주세요.', 'error');
      return;
    }

    try {
      const url = editingSlide ? `/api/slides/${editingSlide.id}` : '/api/slides';
      const method = editingSlide ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showSnackbar(
          editingSlide ? '슬라이드가 수정되었습니다.' : '슬라이드가 생성되었습니다.',
          'success'
        );
        setDialogOpen(false);
        fetchSlides();
      } else {
        throw new Error('저장 실패');
      }
    } catch (error) {
      console.error('Save slide error:', error);
      showSnackbar('슬라이드 저장 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleToggleActive = async (slide: PromoSlide) => {
    try {
      const response = await fetch(`/api/slides/${slide.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          ...slide,
          isActive: !slide.isActive,
        }),
      });

      if (response.ok) {
        showSnackbar(
          `슬라이드가 ${!slide.isActive ? '활성화' : '비활성화'}되었습니다.`,
          'success'
        );
        fetchSlides();
      } else {
        throw new Error('상태 변경 실패');
      }
    } catch (error) {
      console.error('Toggle slide error:', error);
      showSnackbar('슬라이드 상태 변경 중 오류가 발생했습니다.', 'error');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <Typography>로딩 중...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          🎨 슬라이드 관리
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateSlide}
        >
          슬라이드 추가
        </Button>
      </Box>

      {/* Slides Grid */}
      <Grid container spacing={3}>
        {slides.map((slide) => (
          <Grid item xs={12} md={6} lg={4} key={slide.id}>
            <Card sx={{ height: '100%', position: 'relative' }}>
              {/* Status Badge */}
              <Chip
                label={slide.isActive ? '활성' : '비활성'}
                color={slide.isActive ? 'success' : 'default'}
                size="small"
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  zIndex: 1,
                }}
              />

              {/* Image Preview */}
              <Box
                sx={{
                  height: 120,
                  bgcolor: 'grey.100',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundImage: slide.imageUrl ? `url(${slide.imageUrl.startsWith('/uploads/') ? 'http://localhost:5000' + slide.imageUrl : slide.imageUrl})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                }}
              >
                {!slide.imageUrl && (
                  <Image sx={{ fontSize: 40, color: 'grey.400' }} />
                )}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(45deg, rgba(229, 30, 46, 0.3) 0%, rgba(0, 0, 0, 0.2) 100%)',
                  }}
                />
              </Box>

              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom noWrap>
                  {slide.title}
                </Typography>
                {slide.subtitle && (
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom noWrap>
                    {slide.subtitle}
                  </Typography>
                )}
                {slide.description && (
                  <Typography variant="body2" color="text.secondary" sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {slide.description}
                  </Typography>
                )}
                <Box mt={1}>
                  <Chip label={`순서: ${slide.orderIndex + 1}`} size="small" variant="outlined" />
                </Box>
              </CardContent>

              <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                <Box>
                  <IconButton
                    size="small"
                    onClick={() => handleToggleActive(slide)}
                    color={slide.isActive ? 'primary' : 'default'}
                  >
                    {slide.isActive ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleEditSlide(slide)}
                    color="primary"
                  >
                    <Edit />
                  </IconButton>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteSlide(slide)}
                  color="error"
                >
                  <Delete />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}

        {slides.length === 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                등록된 슬라이드가 없습니다
              </Typography>
              <Typography color="text.secondary" paragraph>
                첫 번째 슬라이드를 추가해보세요.
              </Typography>
              <Button variant="contained" startIcon={<Add />} onClick={handleCreateSlide}>
                슬라이드 추가
              </Button>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingSlide ? '슬라이드 수정' : '슬라이드 추가'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="제목 *"
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <TextField
              label="부제목"
              fullWidth
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            />
            <TextField
              label="설명"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                이미지
              </Typography>
              <ImageUpload
                onImageUploaded={(imageUrl) => setFormData({ ...formData, imageUrl })}
                initialImage={formData.imageUrl}
                maxSizeInMB={10}
              />
            </Box>
            <TextField
              label="이미지 URL (직접 입력)"
              fullWidth
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
              helperText="파일 업로드 대신 URL을 직접 입력할 수도 있습니다"
              size="small"
            />
            <TextField
              label="순서"
              type="number"
              value={formData.orderIndex}
              onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value) || 0 })}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              }
              label="활성화"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} startIcon={<Cancel />}>
            취소
          </Button>
          <Button onClick={handleSubmit} variant="contained" startIcon={<Save />}>
            {editingSlide ? '수정' : '생성'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, slideId: '', slideName: '' })}
      >
        <DialogTitle>슬라이드 삭제 확인</DialogTitle>
        <DialogContent>
          <Typography>
            정말로 "<strong>{deleteDialog.slideName}</strong>" 슬라이드를 삭제하시겠습니까?
            <br />
            이 작업은 되돌릴 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialog({ open: false, slideId: '', slideName: '' })}
          >
            취소
          </Button>
          <Button 
            onClick={confirmDeleteSlide} 
            variant="contained" 
            color="error"
            startIcon={<Delete />}
          >
            삭제
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SlideManager;