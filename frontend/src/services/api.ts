import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse } from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    // For mobile/production deployment, fall back to mock data if no backend URL
    const apiURL = process.env.REACT_APP_API_URL || '/api';
    
    this.api = axios.create({
      baseURL: apiURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: apiURL.startsWith('http') ? false : true, // Disable cookies for external APIs
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('miiracer_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('miiracer_token');
          localStorage.removeItem('miiracer_admin');
          
          // Only redirect to login if we're on admin routes
          const isAdminRoute = window.location.pathname.startsWith('/admin');
          
          if (isAdminRoute) {
            window.location.href = '/admin/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Helper method to check if we're in static deployment mode
  private isStaticDeployment(): boolean {
    return !process.env.REACT_APP_API_URL || process.env.REACT_APP_API_URL.includes('your-backend-api-url.com');
  }

  // Auth API
  async login(email: string, password: string) {
    try {
      const response = await this.api.post<ApiResponse>('/auth/login', {
        email,
        password,
      });
      return response.data;
    } catch (error: any) {
      // For static deployment, provide demo login
      if (this.isStaticDeployment() && email === 'admin@miiracer.com' && password === 'admin123!') {
        const mockToken = 'demo-admin-token-' + Date.now();
        localStorage.setItem('miiracer_token', mockToken);
        localStorage.setItem('miiracer_admin', JSON.stringify({
          id: 'demo-admin',
          email: 'admin@miiracer.com',
          name: '관리자',
          role: 'admin'
        }));
        
        return {
          success: true,
          message: '데모 모드로 로그인되었습니다.',
          data: {
            token: mockToken,
            admin: {
              id: 'demo-admin',
              email: 'admin@miiracer.com',
              name: '관리자',
              role: 'admin'
            }
          }
        };
      }
      throw error;
    }
  }

  async getProfile() {
    const response = await this.api.get<ApiResponse>('/auth/profile');
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string) {
    const response = await this.api.post<ApiResponse>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  }

  async logout() {
    const response = await this.api.post<ApiResponse>('/auth/logout');
    return response.data;
  }

  // Tournament API
  async getTournamentInfo() {
    try {
      const response = await this.api.get<ApiResponse>('/tournament');
      return response.data;
    } catch (error) {
      // Fallback mock data for static deployment
      return {
        success: true,
        data: {
          id: 1,
          name: "2025 호치민 배드민턴 챔피언십",
          description: "Miiracer Sports Score가 제공하는 프리미엄 배드민턴 토너먼트! A조부터 C조까지 모든 레벨의 선수가 참가할 수 있으며, 실시간 스코어 관리 시스템을 제공합니다.",
          location: "호치민시 7군 스포츠 센터",
          startDate: "2025-08-15",
          endDate: "2025-08-16",
          maxParticipants: 64,
          participantFee: 200000,
          status: "upcoming",
          stats: {
            approvedParticipants: 32,
            availableSlots: 32,
            totalBrackets: 4,
            daysUntilStart: 6,
            isRegistrationOpen: true
          }
        }
      };
    }
  }

  async getAllTournaments() {
    try {
      const response = await this.api.get<ApiResponse>('/tournament/all');
      return response.data;
    } catch (error) {
      // Fallback mock data for static deployment
      return {
        success: true,
        data: [
          {
            id: 1,
            name: "2025 호치민 배드민턴 챔피언십",
            description: "A조부터 C조까지 모든 레벨 참가 가능",
            location: "호치민시 7군 스포츠 센터",
            startDate: "2025-08-15",
            status: "upcoming",
            maxParticipants: 64,
            stats: {
              approvedParticipants: 32,
              totalBrackets: 4
            }
          },
          {
            id: 2,
            name: "주말 배드민턴 리그",
            description: "매주 토요일 정기 리그전",
            location: "호치민시 1군 배드민턴장",
            startDate: "2025-08-10",
            status: "ongoing",
            maxParticipants: 32,
            stats: {
              approvedParticipants: 28,
              totalBrackets: 2
            }
          },
          {
            id: 3,
            name: "초급자 배드민턴 대회",
            description: "배드민턴 입문자를 위한 친선 대회",
            location: "호치민시 3군 스포츠 센터",
            startDate: "2025-08-20",
            status: "upcoming",
            maxParticipants: 48,
            stats: {
              approvedParticipants: 18,
              totalBrackets: 3
            }
          }
        ]
      };
    }
  }

  async createOrUpdateTournament(formData: FormData) {
    const response = await this.api.post<ApiResponse>('/tournament', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // JSON으로 새 대회 생성 (파일 업로드 없는 경우)
  async createTournamentJSON(data: any) {
    const response = await this.api.post<ApiResponse>('/tournament/simple', data);
    return response.data;
  }

  async updateTournament(tournamentId: string, tournamentData: any) {
    const response = await this.api.put<ApiResponse>(`/tournament/${tournamentId}`, tournamentData);
    return response.data;
  }

  async deleteTournament(tournamentId: string) {
    const response = await this.api.delete<ApiResponse>(`/tournament/${tournamentId}`);
    return response.data;
  }

  async updateTournamentStatus(status: string) {
    const response = await this.api.put<ApiResponse>('/tournament/status', {
      status,
    });
    return response.data;
  }

  async getTournamentStats() {
    const response = await this.api.get<ApiResponse>('/tournament/stats');
    return response.data;
  }

  // Participant API
  async applyParticipant(participantData: any) {
    try {
      const response = await this.api.post<ApiResponse>(
        '/participants/apply',
        participantData
      );
      return response.data;
    } catch (error: any) {
      // For static deployment, simulate successful registration
      if (this.isStaticDeployment()) {
        const mockApplication = {
          id: 'demo-participant-' + Date.now(),
          name: participantData.name,
          email: participantData.email,
          phone: participantData.phone,
          skillLevel: participantData.skillLevel,
          eventType: participantData.eventType,
          status: 'pending',
          submittedAt: new Date().toISOString()
        };
        
        // Store in localStorage for demo purposes
        const existingApplications = JSON.parse(localStorage.getItem('demo_applications') || '[]');
        existingApplications.push(mockApplication);
        localStorage.setItem('demo_applications', JSON.stringify(existingApplications));
        
        return {
          success: true,
          message: '데모 모드: 참가 신청이 접수되었습니다. 실제 환경에서는 관리자 승인 후 확정됩니다.',
          data: mockApplication
        };
      }
      throw error;
    }
  }

  async getParticipants(params?: {
    page?: number;
    limit?: number;
    status?: string;
    skillLevel?: string;
    gender?: string;
    search?: string;
  }) {
    const response = await this.api.get<ApiResponse>('/participants', {
      params,
    });
    return response.data;
  }

  async updateParticipantApproval(
    participantId: string,
    approvalStatus: string,
    reason?: string
  ) {
    const response = await this.api.put<ApiResponse>(
      `/participants/${participantId}/approval`,
      { approvalStatus, reason }
    );
    return response.data;
  }

  async updateParticipantPayment(
    participantId: string,
    paymentStatus: string,
    paymentNote?: string
  ) {
    const response = await this.api.put<ApiResponse>(
      `/participants/${participantId}/payment`,
      { paymentStatus, paymentNote }
    );
    return response.data;
  }

  async updateParticipant(participantId: string, updateData: any) {
    const response = await this.api.put<ApiResponse>(
      `/participants/${participantId}`,
      updateData
    );
    return response.data;
  }

  async deleteParticipant(participantId: string) {
    const response = await this.api.delete<ApiResponse>(
      `/participants/${participantId}`
    );
    return response.data;
  }

  async exportParticipants() {
    const response = await this.api.get('/participants/export', {
      responseType: 'blob',
    });
    return response;
  }

  // Location API
  async getProvinces() {
    const response = await this.api.get<ApiResponse>('/locations/provinces');
    return response.data;
  }

  async getDistricts(provinceId: string) {
    const response = await this.api.get<ApiResponse>(
      `/locations/districts/${provinceId}`
    );
    return response.data;
  }

  async searchLocations(query: string, lang = 'en') {
    const response = await this.api.get<ApiResponse>('/locations/search', {
      params: { query, lang },
    });
    return response.data;
  }

  async getLocationDetail(locationId: string) {
    const response = await this.api.get<ApiResponse>(
      `/locations/${locationId}`
    );
    return response.data;
  }

  // Upload API
  async uploadSingle(file: File) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await this.api.post<ApiResponse>(
      '/upload/single',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async uploadMultiple(files: { [key: string]: File[] }) {
    const formData = new FormData();

    Object.keys(files).forEach(fieldname => {
      files[fieldname].forEach(file => {
        formData.append(fieldname, file);
      });
    });

    const response = await this.api.post<ApiResponse>(
      '/upload/multiple',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async deleteFile(filename: string, type: 'images' | 'documents') {
    const response = await this.api.delete<ApiResponse>(
      `/upload/${type}/${filename}`
    );
    return response.data;
  }

  // Bracket API
  async getBrackets(tournamentId: string) {
    const response = await this.api.get<ApiResponse>(`/bracket/tournament/${tournamentId}`);
    return response.data;
  }

  async getSuggestedBrackets(tournamentId: string) {
    const response = await this.api.get<ApiResponse>(`/bracket/tournament/${tournamentId}/suggestions`);
    return response.data;
  }

  async createBracket(tournamentId: string, bracketData: {
    name: string;
    skillLevel: string;
    eventType: string;
    type?: string;
    participantIds: string[];
    teamCount?: number;
    membersPerTeam?: number;
    bracketSize?: number;
  }) {
    console.log('API createBracket called with:', bracketData);
    const response = await this.api.post<ApiResponse>(
      `/bracket/tournament/${tournamentId}`,
      bracketData
    );
    console.log('API createBracket response:', response.data);
    return response.data;
  }

  async updateBracketStatus(bracketId: string, status: string) {
    const response = await this.api.put<ApiResponse>(
      `/bracket/${bracketId}/status`,
      { status }
    );
    return response.data;
  }

  async updateMatchResult(matchId: string, resultData: {
    player1Score: number;
    player2Score: number;
    winnerId: string;
    notes?: string;
  }) {
    const response = await this.api.put<ApiResponse>(
      `/bracket/match/${matchId}/result`,
      resultData
    );
    return response.data;
  }

  async updateBracketMatches(bracketId: string, matches: any[]) {
    const response = await this.api.put<ApiResponse>(
      `/bracket/${bracketId}/matches`,
      { matches }
    );
    return response.data;
  }

  async deleteBracket(bracketId: string) {
    const response = await this.api.delete<ApiResponse>(`/bracket/${bracketId}`);
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;