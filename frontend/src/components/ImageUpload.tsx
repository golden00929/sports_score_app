import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Image as ImageIcon,
  Close,
} from '@mui/icons-material';

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  initialImage?: string;
  maxSizeInMB?: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUploaded,
  initialImage,
  maxSizeInMB = 5,
}) => {
  const [uploadedImage, setUploadedImage] = useState<string>(initialImage || '');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string>(initialImage || '');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 크기 체크
    if (file.size > maxSizeInMB * 1024 * 1024) {
      setError(`파일 크기는 ${maxSizeInMB}MB 이하여야 합니다.`);
      return;
    }

    // 이미지 파일 체크
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    setError('');
    setUploading(true);
    setUploadProgress(0);

    // 미리보기 이미지 생성
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('miiracer_token');
      const response = await fetch('/api/upload/single', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('업로드 실패');
      }

      const data = await response.json();
      
      if (data.success) {
        const imageUrl = data.data.url;
        setUploadedImage(imageUrl);
        setPreviewImage(imageUrl);
        onImageUploaded(imageUrl);
        setUploadProgress(100);
      } else {
        throw new Error(data.message || '업로드 실패');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || '이미지 업로드 중 오류가 발생했습니다.');
      setPreviewImage(initialImage || '');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage('');
    setPreviewImage('');
    onImageUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const fileList = new DataTransfer();
      fileList.items.add(file);
      const fakeEvent = {
        target: { files: fileList.files },
        currentTarget: { files: fileList.files }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(fakeEvent);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <Box>
      {/* 이미지 미리보기 */}
      {previewImage && (
        <Card sx={{ mb: 2, position: 'relative' }}>
          <Box
            component="img"
            src={previewImage}
            alt="슬라이드 이미지"
            sx={{
              width: '100%',
              height: 200,
              objectFit: 'cover',
              borderRadius: 1,
            }}
          />
          <IconButton
            onClick={handleRemoveImage}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
              },
            }}
            size="small"
          >
            <Close />
          </IconButton>
          {uploading && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                borderRadius: 1,
              }}
            >
              <CircularProgress sx={{ color: 'white' }} />
            </Box>
          )}
        </Card>
      )}

      {/* 업로드 영역 */}
      {!previewImage && (
        <Card
          sx={{
            border: '2px dashed #ccc',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'rgba(25, 118, 210, 0.04)',
            },
            ...(uploading && { pointerEvents: 'none', opacity: 0.7 }),
          }}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <CardContent>
            {uploading ? (
              <Box>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  이미지 업로드 중...
                </Typography>
              </Box>
            ) : (
              <Box>
                <ImageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  이미지 업로드
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  파일을 여기에 드래그하거나 클릭하여 선택하세요
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  지원 형식: JPG, PNG, GIF • 최대 크기: {maxSizeInMB}MB
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* 업로드 진행률 */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
          <Typography variant="caption" color="text.secondary" align="center" sx={{ mt: 1, display: 'block' }}>
            {uploadProgress}% 업로드 완료
          </Typography>
        </Box>
      )}

      {/* 업로드 버튼 (미리보기가 있을 때) */}
      {previewImage && (
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<CloudUpload />}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            size="small"
          >
            이미지 변경
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={handleRemoveImage}
            disabled={uploading}
            size="small"
          >
            이미지 제거
          </Button>
        </Box>
      )}

      {/* 파일 입력 (숨김) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* 에러 메시지 */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default ImageUpload;