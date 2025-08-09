import Joi from 'joi';

// 베트남 전화번호 검증 (10자리)
const vietnamPhoneRegex = /^(0[3-9])[0-9]{8}$/;

// 베트남 전화번호 포맷팅
export const formatVietnamesePhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
  }
  return phone;
};

// 관리자 로그인 검증
export const adminLoginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': '유효한 이메일 주소를 입력해주세요.',
    'any.required': '이메일은 필수입니다.',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': '비밀번호는 최소 6자 이상이어야 합니다.',
    'any.required': '비밀번호는 필수입니다.',
  }),
});

// 대회 정보 검증
export const tournamentInfoSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': '대회명은 최소 2자 이상이어야 합니다.',
    'string.max': '대회명은 100자를 초과할 수 없습니다.',
    'any.required': '대회명은 필수입니다.',
  }),
  description: Joi.string().max(1000).allow('').optional(),
  startDate: Joi.date().required().messages({
    'any.required': '시작 날짜는 필수입니다.',
  }),
  endDate: Joi.date().greater(Joi.ref('startDate')).required().messages({
    'date.greater': '종료 날짜는 시작 날짜보다 늦어야 합니다.',
    'any.required': '종료 날짜는 필수입니다.',
  }),
  registrationStart: Joi.date().required(),
  registrationEnd: Joi.date().greater(Joi.ref('registrationStart')).required(),
  location: Joi.string().min(2).max(200).required(),
  locationLat: Joi.number().min(-90).max(90).optional(),
  locationLng: Joi.number().min(-180).max(180).optional(),
  venue: Joi.string().min(2).max(200).required(),
  contactPhone: Joi.string().pattern(vietnamPhoneRegex).optional().messages({
    'string.pattern.base': '유효한 베트남 전화번호를 입력해주세요. (10자리)',
  }),
  contactSns: Joi.string().max(200).optional(),
  participantFee: Joi.number().min(0).default(0),
  maxParticipants: Joi.number().min(1).max(1000).default(100),
});

// 참가자 신청 검증
export const participantSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.min': '이름은 최소 2자 이상이어야 합니다.',
    'string.max': '이름은 50자를 초과할 수 없습니다.',
    'any.required': '이름은 필수입니다.',
  }),
  gender: Joi.string().valid('male', 'female').required().messages({
    'any.only': '성별을 선택해주세요.',
    'any.required': '성별은 필수입니다.',
  }),
  birthYear: Joi.number()
    .min(1950)
    .max(new Date().getFullYear())
    .required()
    .messages({
      'number.min': '유효한 출생년도를 입력해주세요.',
      'number.max': '유효한 출생년도를 입력해주세요.',
      'any.required': '출생년도는 필수입니다.',
    }),
  province: Joi.string().min(2).max(50).required().messages({
    'any.required': '거주 시/성을 선택해주세요.',
  }),
  district: Joi.string().min(2).max(50).required().messages({
    'any.required': '거주 구/군을 선택해주세요.',
  }),
  phone: Joi.string().pattern(vietnamPhoneRegex).required().messages({
    'string.pattern.base': '유효한 베트남 전화번호를 입력해주세요. (10자리)',
    'any.required': '전화번호는 필수입니다.',
  }),
  experience: Joi.string().valid(
    '6개월~1년',
    '1년~2년', 
    '2년~3년', 
    '3년~5년', 
    '5년 이상'
  ).optional(),
  skillLevel: Joi.string().valid('A', 'B', 'C').required().messages({
    'any.only': '등급(A조/B조/C조)을 선택해주세요.',
    'any.required': '등급은 필수입니다.',
  }),
  eventType: Joi.string().valid(
    'men_singles',
    'women_singles', 
    'men_doubles',
    'women_doubles',
    'mixed_doubles'
  ).required().messages({
    'any.only': '경기 종목을 선택해주세요.',
    'any.required': '경기 종목은 필수입니다.',
  }),
  partnerName: Joi.string().allow('').optional().messages({
    'string.min': '파트너 이름은 최소 2자 이상이어야 합니다.',
    'string.max': '파트너 이름은 50자를 초과할 수 없습니다.',
  }),
  partnerPhone: Joi.string().allow('').optional().messages({
    'string.pattern.base': '유효한 베트남 전화번호를 입력해주세요. (10자리)',
  }),
  tournamentId: Joi.string().optional(),
});

// 대진표 생성 검증
export const bracketSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  skillLevel: Joi.string().valid('A', 'B', 'C').required(),
  eventType: Joi.string().valid(
    'men_singles',
    'women_singles', 
    'men_doubles',
    'women_doubles',
    'mixed_doubles'
  ).required(),
  type: Joi.string().valid('single_elimination', 'double_elimination', 'round_robin').default('single_elimination'),
  participantIds: Joi.array().items(Joi.string()).min(2).required(),
});

// 경기 결과 입력 검증
export const matchResultSchema = Joi.object({
  player1Score: Joi.number().min(0).required(),
  player2Score: Joi.number().min(0).required(),
  winnerId: Joi.string().uuid().required(),
  notes: Joi.string().max(500).optional(),
});

// 일정 생성 검증
export const scheduleSchema = Joi.object({
  title: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).optional(),
  startTime: Joi.date().required(),
  endTime: Joi.date().greater(Joi.ref('startTime')).required(),
  courtNumber: Joi.number().min(1).optional(),
  type: Joi.string().valid('match', 'break', 'ceremony').default('match'),
  isPublic: Joi.boolean().default(true),
});