import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse } from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || '/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
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
          
          // Only redirect to login if we're on admin routes or the error came from an admin API
          const isAdminRoute = window.location.pathname.startsWith('/admin');
          const isAdminAPI = error.config?.url?.includes('/admin') || 
                            error.config?.url?.includes('/profile') ||
                            error.config?.url?.includes('/tournament') ||
                            error.config?.url?.includes('/bracket');
          
          if (isAdminRoute) {
            window.location.href = '/admin/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth API
  async login(email: string, password: string) {
    const response = await this.api.post<ApiResponse>('/auth/login', {
      email,
      password,
    });
    return response.data;
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
    const response = await this.api.get<ApiResponse>('/tournament');
    return response.data;
  }

  async getAllTournaments() {
    const response = await this.api.get<ApiResponse>('/tournament/all');
    return response.data;
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
    const response = await this.api.post<ApiResponse>(
      '/participants/apply',
      participantData
    );
    return response.data;
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