// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Tournament Types
export interface Tournament {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  registrationStart: string;
  registrationEnd: string;
  location: string;
  locationLat?: number;
  locationLng?: number;
  venue: string;
  posterImage?: string;
  rulesDocument?: string;
  contactPhone?: string;
  contactSns?: string;
  organizerInfo?: {
    organizer?: string;
    host?: string;
    sponsors?: string[];
    sponsorImages?: string[];
  };
  participantFee: number;
  bankInfo?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  maxParticipants: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  createdAt: string;
  updatedAt: string;
  stats?: {
    approvedParticipants: number;
    availableSlots: number;
    daysUntilStart: number;
    daysUntilRegEnd: number;
    isRegistrationOpen: boolean;
    isRegistrationFull: boolean;
  };
}

// Participant Types
export interface Participant {
  id: string;
  name: string;
  gender: 'male' | 'female';
  birthYear: number;
  province: string;
  district: string;
  phone: string;
  experience?: string;
  skillLevel: 'A' | 'B' | 'C';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  paymentStatus: 'pending' | 'completed' | 'cancelled';
  registrationDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface ParticipantApplication {
  name: string;
  gender: 'male' | 'female';
  birthYear: number;
  province: string;
  district: string;
  phone: string;
  experience?: string;
  skillLevel: 'A' | 'B' | 'C';
}

// Location Types
export interface VietnamLocation {
  id: string;
  nameEn: string;
  nameVi: string;
  nameKo?: string;
  code: string;
  type: 'province' | 'district';
  parentId?: string;
  parent?: {
    nameEn: string;
    nameVi: string;
    nameKo?: string;
  };
}

// Admin Types
export interface Admin {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  admin: Admin;
}

// Bracket Types
export interface Bracket {
  id: string;
  name: string;
  skillLevel: 'A' | 'B' | 'C';
  gender: 'male' | 'female' | 'mixed';
  type: 'single_elimination' | 'double_elimination' | 'round_robin';
  participants: string[];
  bracketData?: any;
  status: 'draft' | 'published' | 'ongoing' | 'completed';
  createdAt: string;
  updatedAt: string;
}

// Match Types
export interface Match {
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
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  courtNumber?: number;
  scheduledTime?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Schedule Types
export interface Schedule {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  courtNumber?: number;
  type: 'match' | 'break' | 'ceremony';
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

// UI Types
export interface MenuItem {
  title: string;
  path: string;
  icon?: React.ReactNode;
  adminOnly?: boolean;
}

export interface Theme {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
}

// Form Types
export interface FormErrors {
  [key: string]: string;
}

// Pagination Types
export interface PaginationParams {
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationParams;
}

// Language Types
export type Language = 'ko' | 'vi' | 'en';

export interface LanguageOption {
  code: Language;
  name: string;
  flag: string;
}