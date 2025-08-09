"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleSchema = exports.matchResultSchema = exports.bracketSchema = exports.participantSchema = exports.tournamentInfoSchema = exports.adminLoginSchema = exports.formatVietnamesePhone = void 0;
const joi_1 = __importDefault(require("joi"));
// 베트남 전화번호 검증 (10자리)
const vietnamPhoneRegex = /^(0[3-9])[0-9]{8}$/;
// 베트남 전화번호 포맷팅
const formatVietnamesePhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
    }
    return phone;
};
exports.formatVietnamesePhone = formatVietnamesePhone;
// 관리자 로그인 검증
exports.adminLoginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        'string.email': '유효한 이메일 주소를 입력해주세요.',
        'any.required': '이메일은 필수입니다.',
    }),
    password: joi_1.default.string().min(6).required().messages({
        'string.min': '비밀번호는 최소 6자 이상이어야 합니다.',
        'any.required': '비밀번호는 필수입니다.',
    }),
});
// 대회 정보 검증
exports.tournamentInfoSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(100).required().messages({
        'string.min': '대회명은 최소 2자 이상이어야 합니다.',
        'string.max': '대회명은 100자를 초과할 수 없습니다.',
        'any.required': '대회명은 필수입니다.',
    }),
    description: joi_1.default.string().max(1000).allow('').optional(),
    startDate: joi_1.default.date().required().messages({
        'any.required': '시작 날짜는 필수입니다.',
    }),
    endDate: joi_1.default.date().greater(joi_1.default.ref('startDate')).required().messages({
        'date.greater': '종료 날짜는 시작 날짜보다 늦어야 합니다.',
        'any.required': '종료 날짜는 필수입니다.',
    }),
    registrationStart: joi_1.default.date().required(),
    registrationEnd: joi_1.default.date().greater(joi_1.default.ref('registrationStart')).required(),
    location: joi_1.default.string().min(2).max(200).required(),
    locationLat: joi_1.default.number().min(-90).max(90).optional(),
    locationLng: joi_1.default.number().min(-180).max(180).optional(),
    venue: joi_1.default.string().min(2).max(200).required(),
    contactPhone: joi_1.default.string().pattern(vietnamPhoneRegex).optional().messages({
        'string.pattern.base': '유효한 베트남 전화번호를 입력해주세요. (10자리)',
    }),
    contactSns: joi_1.default.string().max(200).optional(),
    participantFee: joi_1.default.number().min(0).default(0),
    maxParticipants: joi_1.default.number().min(1).max(1000).default(100),
});
// 참가자 신청 검증
exports.participantSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(50).required().messages({
        'string.min': '이름은 최소 2자 이상이어야 합니다.',
        'string.max': '이름은 50자를 초과할 수 없습니다.',
        'any.required': '이름은 필수입니다.',
    }),
    gender: joi_1.default.string().valid('male', 'female').required().messages({
        'any.only': '성별을 선택해주세요.',
        'any.required': '성별은 필수입니다.',
    }),
    birthYear: joi_1.default.number()
        .min(1950)
        .max(new Date().getFullYear())
        .required()
        .messages({
        'number.min': '유효한 출생년도를 입력해주세요.',
        'number.max': '유효한 출생년도를 입력해주세요.',
        'any.required': '출생년도는 필수입니다.',
    }),
    province: joi_1.default.string().min(2).max(50).required().messages({
        'any.required': '거주 시/성을 선택해주세요.',
    }),
    district: joi_1.default.string().min(2).max(50).required().messages({
        'any.required': '거주 구/군을 선택해주세요.',
    }),
    phone: joi_1.default.string().pattern(vietnamPhoneRegex).required().messages({
        'string.pattern.base': '유효한 베트남 전화번호를 입력해주세요. (10자리)',
        'any.required': '전화번호는 필수입니다.',
    }),
    experience: joi_1.default.string().valid('6개월~1년', '1년~2년', '2년~3년', '3년~5년', '5년 이상').optional(),
    skillLevel: joi_1.default.string().valid('A', 'B', 'C').required().messages({
        'any.only': '등급(A조/B조/C조)을 선택해주세요.',
        'any.required': '등급은 필수입니다.',
    }),
    eventType: joi_1.default.string().valid('men_singles', 'women_singles', 'men_doubles', 'women_doubles', 'mixed_doubles').required().messages({
        'any.only': '경기 종목을 선택해주세요.',
        'any.required': '경기 종목은 필수입니다.',
    }),
    partnerName: joi_1.default.string().allow('').optional().messages({
        'string.min': '파트너 이름은 최소 2자 이상이어야 합니다.',
        'string.max': '파트너 이름은 50자를 초과할 수 없습니다.',
    }),
    partnerPhone: joi_1.default.string().allow('').optional().messages({
        'string.pattern.base': '유효한 베트남 전화번호를 입력해주세요. (10자리)',
    }),
    tournamentId: joi_1.default.string().optional(),
});
// 대진표 생성 검증
exports.bracketSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(100).required(),
    skillLevel: joi_1.default.string().valid('A', 'B', 'C').required(),
    eventType: joi_1.default.string().valid('men_singles', 'women_singles', 'men_doubles', 'women_doubles', 'mixed_doubles').required(),
    type: joi_1.default.string().valid('single_elimination', 'double_elimination', 'round_robin').default('single_elimination'),
    participantIds: joi_1.default.array().items(joi_1.default.string()).min(2).required(),
});
// 경기 결과 입력 검증
exports.matchResultSchema = joi_1.default.object({
    player1Score: joi_1.default.number().min(0).required(),
    player2Score: joi_1.default.number().min(0).required(),
    winnerId: joi_1.default.string().uuid().required(),
    notes: joi_1.default.string().max(500).optional(),
});
// 일정 생성 검증
exports.scheduleSchema = joi_1.default.object({
    title: joi_1.default.string().min(2).max(100).required(),
    description: joi_1.default.string().max(500).optional(),
    startTime: joi_1.default.date().required(),
    endTime: joi_1.default.date().greater(joi_1.default.ref('startTime')).required(),
    courtNumber: joi_1.default.number().min(1).optional(),
    type: joi_1.default.string().valid('match', 'break', 'ceremony').default('match'),
    isPublic: joi_1.default.boolean().default(true),
});
//# sourceMappingURL=validation.js.map