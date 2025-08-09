import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Alert,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Divider,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Person, LocationOn, Payment, Info } from '@mui/icons-material';
import apiService from '../services/api';
import { formatDateRange } from '../utils/dateFormat';

interface FormData {
  name: string;
  gender: 'male' | 'female';
  birthYear: number;
  province: string;
  district: string;
  phone: string;
  experience: string;
  skillLevel: 'A' | 'B' | 'C';
  eventType: 'men_singles' | 'women_singles' | 'men_doubles' | 'women_doubles' | 'mixed_doubles';
  partnerName: string;
  partnerPhone: string;
}

interface FormErrors {
  name?: string;
  gender?: string;
  birthYear?: string;
  province?: string;
  district?: string;
  phone?: string;
  experience?: string;
  skillLevel?: string;
  eventType?: string;
  partnerName?: string;
  partnerPhone?: string;
}

interface VietnamLocation {
  id: string;
  nameEn: string;
  nameVi: string;
  nameKo?: string;
  type: string;
  code: string;
}

const RegistrationPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');
  const [provinces, setProvinces] = useState<VietnamLocation[]>([]);
  const [districts, setDistricts] = useState<VietnamLocation[]>([]);
  const [tournamentInfo, setTournamentInfo] = useState<any>(null);
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    gender: 'male',
    birthYear: new Date().getFullYear() - 25,
    province: '',
    district: '',
    phone: '',
    experience: '',
    skillLevel: 'B',
    eventType: 'men_singles',
    partnerName: '',
    partnerPhone: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const steps = ['개인정보', '지역정보', '경기정보', '경력정보', '확인'];

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (formData.province) {
      loadDistricts(formData.province);
      setFormData(prev => ({ ...prev, district: '' }));
    }
  }, [formData.province]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load tournament info
      const tournamentResponse = await apiService.getTournamentInfo();
      if (tournamentResponse.success) {
        setTournamentInfo(tournamentResponse.data);
      }

      // Simple static location data (Hanoi and Ho Chi Minh City only)
      setProvinces([
        { id: 'HCM', nameEn: 'Ho Chi Minh City', nameVi: 'Thành phố Hồ Chí Minh', nameKo: '호치민시', type: 'province', code: 'HCM' },
        { id: 'HN', nameEn: 'Hanoi', nameVi: 'Hà Nội', nameKo: '하노이', type: 'province', code: 'HN' },
      ]);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      setError('초기 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadDistricts = (provinceCode: string) => {
    // Static district data based on province selection
    if (provinceCode === 'HCM') {
      setDistricts([
        { id: 'HCM-Q1', nameEn: 'District 1', nameVi: 'Quận 1', nameKo: '1군', type: 'district', code: 'HCM-Q1' },
        { id: 'HCM-Q3', nameEn: 'District 3', nameVi: 'Quận 3', nameKo: '3군', type: 'district', code: 'HCM-Q3' },
        { id: 'HCM-Q5', nameEn: 'District 5', nameVi: 'Quận 5', nameKo: '5군', type: 'district', code: 'HCM-Q5' },
        { id: 'HCM-Q7', nameEn: 'District 7', nameVi: 'Quận 7', nameKo: '7군', type: 'district', code: 'HCM-Q7' },
        { id: 'HCM-Q10', nameEn: 'District 10', nameVi: 'Quận 10', nameKo: '10군', type: 'district', code: 'HCM-Q10' },
        { id: 'HCM-BT', nameEn: 'Binh Thanh', nameVi: 'Bình Thạnh', nameKo: '빈탄군', type: 'district', code: 'HCM-BT' },
        { id: 'HCM-PN', nameEn: 'Phu Nhuan', nameVi: 'Phú Nhuận', nameKo: '푸뉴안군', type: 'district', code: 'HCM-PN' },
        { id: 'HCM-TD', nameEn: 'Thu Duc', nameVi: 'Thủ Đức', nameKo: '투득시', type: 'district', code: 'HCM-TD' },
      ]);
    } else if (provinceCode === 'HN') {
      setDistricts([
        { id: 'HN-HK', nameEn: 'Hoan Kiem', nameVi: 'Hoàn Kiếm', nameKo: '환끼엠군', type: 'district', code: 'HN-HK' },
        { id: 'HN-BD', nameEn: 'Ba Dinh', nameVi: 'Ba Đình', nameKo: '바딘군', type: 'district', code: 'HN-BD' },
        { id: 'HN-CG', nameEn: 'Cau Giay', nameVi: 'Cầu Giấy', nameKo: '까우저이군', type: 'district', code: 'HN-CG' },
        { id: 'HN-DD', nameEn: 'Dong Da', nameVi: 'Đống Đa', nameKo: '동다군', type: 'district', code: 'HN-DD' },
        { id: 'HN-HM', nameEn: 'Ha Dong', nameVi: 'Hà Đông', nameKo: '하동군', type: 'district', code: 'HN-HM' },
        { id: 'HN-TB', nameEn: 'Thanh Xuan', nameVi: 'Thanh Xuân', nameKo: '탄쑤안군', type: 'district', code: 'HN-TB' },
      ]);
    } else {
      setDistricts([]);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    switch (step) {
      case 0: // Personal Info
        if (!formData.name.trim()) newErrors.name = '이름을 입력해주세요.';
        if (formData.birthYear < 1950 || formData.birthYear > new Date().getFullYear() - 10) {
          newErrors.birthYear = '올바른 출생년도를 입력해주세요.';
        }
        break;

      case 1: // Location Info
        if (!formData.province) newErrors.province = '지역을 선택해주세요.';
        if (!formData.district) newErrors.district = '구/군을 선택해주세요.';
        if (!formData.phone.trim()) {
          newErrors.phone = '전화번호를 입력해주세요.';
        } else if (!/^0\d{9}$/.test(formData.phone)) {
          newErrors.phone = '올바른 베트남 전화번호 형식이 아닙니다. (예: 0987654321)';
        }
        break;

      case 2: // Event Info
        if (!formData.eventType) newErrors.eventType = '경기 종목을 선택해주세요.';
        // 복식 종목인 경우 파트너 정보 검증
        if (['men_doubles', 'women_doubles', 'mixed_doubles'].includes(formData.eventType)) {
          if (!formData.partnerName.trim()) {
            newErrors.partnerName = '파트너 이름을 입력해주세요.';
          }
          if (!formData.partnerPhone.trim()) {
            newErrors.partnerPhone = '파트너 전화번호를 입력해주세요.';
          } else if (!/^0\d{9}$/.test(formData.partnerPhone)) {
            newErrors.partnerPhone = '올바른 베트남 전화번호 형식이 아닙니다. (예: 0987654321)';
          }
        }
        break;

      case 3: // Experience Info
        if (!formData.experience.trim()) newErrors.experience = '경력을 선택해주세요.';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field as keyof FormErrors]: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    try {
      setLoading(true);
      setError('');

      const registrationData = {
        ...formData,
        tournamentId: tournamentInfo?.id || 'sample-tournament-id',
      };

      const response = await apiService.applyParticipant(registrationData);

      if (response.success) {
        setSubmitSuccess(true);
        setActiveStep(4);
      } else {
        setError(response.message || '신청 중 오류가 발생했습니다.');
      }
    } catch (error: any) {
      setError(
        error.response?.data?.message || 
        error.message || 
        '신청 중 오류가 발생했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Person sx={{ mr: 1 }} /> 개인정보 입력
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="이름 *"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  error={!!errors.name}
                  helperText={errors.name}
                  placeholder="홍길동"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">성별 *</FormLabel>
                  <RadioGroup
                    row
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                  >
                    <FormControlLabel value="male" control={<Radio />} label="남성" />
                    <FormControlLabel value="female" control={<Radio />} label="여성" />
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="출생년도 *"
                  value={formData.birthYear}
                  onChange={(e) => handleInputChange('birthYear', parseInt(e.target.value))}
                  error={!!errors.birthYear}
                  helperText={errors.birthYear || '예: 1995'}
                  InputProps={{
                    inputProps: { min: 1950, max: new Date().getFullYear() - 10 }
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationOn sx={{ mr: 1 }} /> 거주지 및 연락처
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.province}>
                  <InputLabel>거주도시 *</InputLabel>
                  <Select
                    value={formData.province}
                    onChange={(e) => handleInputChange('province', e.target.value)}
                    label="거주도시 *"
                  >
                    {provinces.map((province) => (
                      <MenuItem key={province.id} value={province.code}>
                        {province.nameKo || province.nameEn}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.province && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {errors.province}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.district}>
                  <InputLabel>구/군 *</InputLabel>
                  <Select
                    value={formData.district}
                    onChange={(e) => handleInputChange('district', e.target.value)}
                    label="구/군 *"
                    disabled={!formData.province}
                  >
                    {districts.map((district) => (
                      <MenuItem key={district.id} value={district.code}>
                        {district.nameKo || district.nameEn}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.district && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {errors.district}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="전화번호 *"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  error={!!errors.phone}
                  helperText={errors.phone || '베트남 전화번호 10자리 (예: 0987654321)'}
                  placeholder="0987654321"
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Info sx={{ mr: 1 }} /> 경기 종목 선택
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.eventType}>
                  <InputLabel>경기 종목 *</InputLabel>
                  <Select
                    value={formData.eventType}
                    onChange={(e) => {
                      handleInputChange('eventType', e.target.value);
                      // 경기 종목 변경시 성별도 자동 설정
                      if (e.target.value === 'men_singles' || e.target.value === 'men_doubles') {
                        handleInputChange('gender', 'male');
                      } else if (e.target.value === 'women_singles' || e.target.value === 'women_doubles') {
                        handleInputChange('gender', 'female');
                      }
                      // 단식으로 변경시 파트너 정보 초기화
                      if (e.target.value === 'men_singles' || e.target.value === 'women_singles') {
                        handleInputChange('partnerName', '');
                        handleInputChange('partnerPhone', '');
                      }
                    }}
                    label="경기 종목 *"
                  >
                    <MenuItem value="men_singles">남자단식</MenuItem>
                    <MenuItem value="women_singles">여자단식</MenuItem>
                    <MenuItem value="men_doubles">남자복식</MenuItem>
                    <MenuItem value="women_doubles">여자복식</MenuItem>
                    <MenuItem value="mixed_doubles">혼성복식</MenuItem>
                  </Select>
                  {errors.eventType && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {errors.eventType}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* 복식 종목인 경우에만 파트너 정보 입력 필드 표시 */}
              {['men_doubles', 'women_doubles', 'mixed_doubles'].includes(formData.eventType) && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="파트너 이름 *"
                      value={formData.partnerName}
                      onChange={(e) => handleInputChange('partnerName', e.target.value)}
                      error={!!errors.partnerName}
                      helperText={errors.partnerName}
                      placeholder="파트너 이름을 입력하세요"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="파트너 전화번호 *"
                      value={formData.partnerPhone}
                      onChange={(e) => handleInputChange('partnerPhone', e.target.value)}
                      error={!!errors.partnerPhone}
                      helperText={errors.partnerPhone || '베트남 전화번호 10자리 (예: 0987654321)'}
                      placeholder="0987654321"
                    />
                  </Grid>
                </>
              )}
            </Grid>

            <Alert severity="info" sx={{ mt: 2 }}>
              복식 종목을 선택하신 경우 파트너의 정보도 함께 입력해주세요.
              혼성복식의 경우 남녀가 한 팀을 이룹니다.
            </Alert>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Info sx={{ mr: 1 }} /> 경력 및 실력 레벨
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.experience}>
                  <InputLabel>배드민턴 경력 *</InputLabel>
                  <Select
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    label="배드민턴 경력 *"
                  >
                    <MenuItem value="6개월~1년">6개월~1년</MenuItem>
                    <MenuItem value="1년~2년">1년~2년</MenuItem>
                    <MenuItem value="2년~3년">2년~3년</MenuItem>
                    <MenuItem value="3년~5년">3년~5년</MenuItem>
                    <MenuItem value="5년 이상">5년 이상</MenuItem>
                  </Select>
                  {errors.experience && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {errors.experience}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">등급 선택 *</FormLabel>
                  <RadioGroup
                    value={formData.skillLevel}
                    onChange={(e) => handleInputChange('skillLevel', e.target.value)}
                  >
                    <FormControlLabel 
                      value="A" 
                      control={<Radio />} 
                      label="A조 - 고수준 (대회 입상 경험, 전문적 훈련)" 
                    />
                    <FormControlLabel 
                      value="B" 
                      control={<Radio />} 
                      label="B조 - 중급 (동호회 활동, 기본기 숙련)" 
                    />
                    <FormControlLabel 
                      value="C" 
                      control={<Radio />} 
                      label="C조 - 초급 (취미 수준, 기본기 학습 중)" 
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
            </Grid>

            <Alert severity="info" sx={{ mt: 2 }}>
              실력 레벨은 대진표 구성에 활용됩니다. 정확한 선택을 부탁드립니다.
            </Alert>
          </Box>
        );

      case 4:
        if (submitSuccess) {
          return (
            <Box sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                신청이 완료되었습니다!
              </Typography>
              <Typography color="textSecondary" paragraph>
                관리자 승인 후 결제 정보가 안내됩니다.
              </Typography>
              
              <Paper sx={{ p: 3, mt: 3, bgcolor: 'grey.50' }}>
                <Typography variant="h6" gutterBottom>
                  결제 정보
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>참가비:</strong> {tournamentInfo?.participantFee ? `${tournamentInfo.participantFee.toLocaleString()} VND` : '200,000 VND'}<br />
                  <strong>은행:</strong> Vietcombank<br />
                  <strong>계좌번호:</strong> 1234567890<br />
                  <strong>예금주:</strong> MIIRACER SPORTS
                </Typography>
              </Paper>

              <Button
                component={Link}
                to="/"
                variant="contained"
                sx={{ mt: 3 }}
              >
                홈으로 돌아가기
              </Button>
            </Box>
          );
        } else {
          return (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Payment sx={{ mr: 1 }} /> 신청 내용 확인
              </Typography>
              
              <Paper sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">이름</Typography>
                    <Typography variant="body1">{formData.name}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">성별</Typography>
                    <Typography variant="body1">{formData.gender === 'male' ? '남성' : '여성'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">출생년도</Typography>
                    <Typography variant="body1">{formData.birthYear}년</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">나이</Typography>
                    <Typography variant="body1">{new Date().getFullYear() - formData.birthYear}세</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">거주지</Typography>
                    <Typography variant="body1">
                      {provinces.find(p => p.code === formData.province)?.nameKo} - {districts.find(d => d.code === formData.district)?.nameKo}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">전화번호</Typography>
                    <Typography variant="body1">{formData.phone}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">경기 종목</Typography>
                    <Typography variant="body1">
                      {formData.eventType === 'men_singles' && '남자단식'}
                      {formData.eventType === 'women_singles' && '여자단식'}
                      {formData.eventType === 'men_doubles' && '남자복식'}
                      {formData.eventType === 'women_doubles' && '여자복식'}
                      {formData.eventType === 'mixed_doubles' && '혼성복식'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">등급</Typography>
                    <Chip label={`${formData.skillLevel}조`} color="primary" />
                  </Grid>
                  {['men_doubles', 'women_doubles', 'mixed_doubles'].includes(formData.eventType) && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="textSecondary">파트너 이름</Typography>
                        <Typography variant="body1">{formData.partnerName}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="textSecondary">파트너 전화번호</Typography>
                        <Typography variant="body1">{formData.partnerPhone}</Typography>
                      </Grid>
                    </>
                  )}
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">경력</Typography>
                    <Typography variant="body1">
                      {formData.experience}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Alert severity="warning" sx={{ mb: 2 }}>
                신청 후에는 정보 수정이 어렵습니다. 내용을 다시 한번 확인해주세요.
              </Alert>
            </Box>
          );
        }

      default:
        return 'Unknown step';
    }
  };

  if (loading && !tournamentInfo) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          🏸 배드민턴 토너먼트 참가 신청
        </Typography>
        {tournamentInfo && (
          <Typography variant="h6" color="textSecondary">
            {tournamentInfo.name}
          </Typography>
        )}
      </Box>

      <Card>
        <CardContent sx={{ p: 4 }}>
          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Step Content */}
          <Box sx={{ mb: 3 }}>
            {getStepContent(activeStep)}
          </Box>

          {/* Navigation Buttons */}
          {!submitSuccess && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
              >
                이전
              </Button>
              
              <Box>
                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : undefined}
                  >
                    {loading ? '신청 중...' : '신청 완료'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                  >
                    다음
                  </Button>
                )}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Tournament Info */}
      {tournamentInfo && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              대회 정보
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">일정</Typography>
                <Typography variant="body1">
                  {formatDateRange(tournamentInfo.startDate, tournamentInfo.endDate)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">장소</Typography>
                <Typography variant="body1">{tournamentInfo.location}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">참가비</Typography>
                <Typography variant="body1">{tournamentInfo.participantFee?.toLocaleString()} VND</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">최대 참가인원</Typography>
                <Typography variant="body1">{tournamentInfo.maxParticipants}명</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default RegistrationPage;