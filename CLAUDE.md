# Miiracer Badminton Tournament Management System - Project Documentation

## Project Overview
Vietnamese badminton tournament management system with React TypeScript frontend and Node.js Express backend using Prisma ORM and SQLite database.

## Development Environment
- **Working Directory**: `/home/jay/miiracer-badminton/frontend`
- **Platform**: WSL2 Linux
- **Frontend**: React 18 + TypeScript + Material-UI
- **Backend**: Node.js + Express + Prisma + SQLite
- **Frontend Port**: 3000 (already running)
- **Backend Port**: 5000 (already running)

## Admin Credentials
```json
{
  "email": "admin@miiracer.com",
  "password": "admin123!"
}
```
Access: http://localhost:3000/admin/login

## Current Project State

### ✅ Completed Features

#### 1. Logo Integration
- **What**: Replaced racket emoji (🏸) with actual Miiracer logo in admin dashboard header
- **File**: `src/pages/AdminDashboard.tsx:294-302`
- **Implementation**: 
```tsx
<img 
  src="/miiracer-logo.jpg" 
  alt="Miiracer Logo" 
  style={{ height: 40, marginRight: 16, borderRadius: 4 }} 
/>
```

#### 2. Admin Dashboard Restructuring
- **What**: Reordered tabs - SlideManager first, then TournamentManager
- **File**: `src/pages/AdminDashboard.tsx:415-443`
- **Layout**: 
  1. 슬라이드 관리 (Slide Management)
  2. 대회 관리 (Tournament Management)
  3. Tournament list with selection buttons

#### 3. Dashboard Cleanup
- **What**: Removed unnecessary statistics cards and tournament info sections
- **Files Modified**: `src/pages/AdminDashboard.tsx`
- **Removed**: Statistics overview cards, redundant tournament information display

#### 4. Tournament Context System
- **What**: Selected tournament filters all management tabs (participants, brackets, schedules, files)
- **File**: `src/pages/AdminDashboard.tsx:51-63`
- **Implementation**:
```tsx
const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
const [selectedTournamentForManagement, setSelectedTournamentForManagement] = useState<Tournament | null>(null);
```

#### 5. Tournament Creation 500 Error Fix ⭐
- **Problem**: FormData approach triggering upload middleware when no files uploaded
- **Solution**: Created JSON-based endpoint bypassing upload middleware
- **Backend**: 
  - Route: `POST /tournament/simple` (`src/routes/tournament.ts:22-26`)
  - Controller: `createSimpleTournament` (`src/controllers/tournamentController.ts:379-440`)
- **Frontend**:
  - API: `createTournamentJSON` (`src/services/api.ts:96-99`)
  - Integration: `TournamentManager.tsx:223`

## Key Technical Components

### Date Formatting System
- **Format**: DD/MM/YYYY (Vietnamese standard)
- **Utilities**: `src/utils/dateFormat.ts`
- **Component**: `src/components/DateInput.tsx`
- **Functions**:
  - `getTodayForForm()`: Returns today in DD/MM/YYYY format
  - `convertISOToFormDate()`: Converts ISO to form format
  - `formatDate()`: Display formatting

### Tournament Management Architecture
```
AdminDashboard (Main Container)
├── SlideManager (Tab 0)
├── TournamentManager (Tab 1)
│   ├── Tournament List Table
│   ├── Management Button (Settings icon) → setSelectedTournamentForManagement
│   └── Details Button (Visibility icon) → setSelectedTournament
├── ParticipantManager (Filtered by selectedTournamentForManagement)
├── BracketManager (Filtered by selectedTournamentForManagement)
├── ScheduleManager (Filtered by selectedTournamentForManagement)
└── FileManager (Filtered by selectedTournamentForManagement)
```

### API Endpoints Structure
- **Tournament Creation**: `POST /tournament/simple` (JSON, no files)
- **Tournament Update**: `PUT /tournament/:id` 
- **Tournament List**: `GET /tournament/all`
- **Tournament Delete**: `DELETE /tournament/:id`

## Development Commands

### Start Services
```bash
# Backend (from /home/jay/miiracer-badminton/backend)
npm run dev

# Frontend (from /home/jay/miiracer-badminton/frontend) 
npm start
```

### Build & Testing
```bash
# Frontend build
npm run build

# Type checking
npm run typecheck  # If available

# Linting
npm run lint      # If available
```

## Project File Structure

### Critical Frontend Files
- `src/pages/AdminDashboard.tsx` - Main admin interface with tournament context
- `src/components/TournamentManager.tsx` - Tournament CRUD operations  
- `src/components/DateInput.tsx` - Custom date input with DD/MM/YYYY format
- `src/services/api.ts` - API service layer with authentication
- `src/utils/dateFormat.ts` - Date formatting utilities

### Critical Backend Files
- `src/controllers/tournamentController.ts` - Tournament business logic
- `src/routes/tournament.ts` - Tournament API routes
- `src/middleware/auth.ts` - Authentication middleware
- `src/config/database.ts` - Prisma database configuration

## Known Issues & Solutions

### ✅ RESOLVED: Tournament Creation 500 Error
- **Error**: "서버 내부 오류가 발생했습니다"
- **Cause**: FormData + upload middleware conflict
- **Solution**: JSON endpoint `/tournament/simple`
- **Status**: Fixed and deployed

### Database Schema
- Uses Prisma ORM with SQLite
- Tournament status: 'upcoming' | 'ongoing' | 'completed'
- Participant approval: 'pending' | 'approved' | 'rejected'
- Payment status: 'pending' | 'completed' | 'failed'

## Recent Development Activity

### Last Session Summary
1. **Logo Integration**: Successfully replaced racket emoji with Miiracer logo
2. **Dashboard Restructure**: Reordered tabs, removed unnecessary sections
3. **Context System**: Implemented tournament selection for filtered management
4. **500 Error Fix**: Resolved tournament creation failure with JSON API approach
5. **Testing**: Verified both frontend (port 3000) and backend (port 5000) are running

### Development Priorities for Next Session
1. Test tournament creation functionality end-to-end
2. Implement slide management features if needed
3. Enhance tournament context filtering across all management tabs
4. Add any missing validation or error handling
5. Performance optimization if required

## Environment Setup
- Node.js and npm installed
- Both servers configured to run simultaneously
- Authentication working with stored admin credentials
- File upload system configured for images and documents
- Vietnamese timezone (UTC+7) configured in backend

## Code Style & Standards
- TypeScript strict mode enabled
- Material-UI components for consistent design
- Korean UI labels with English code comments
- DD/MM/YYYY date format throughout
- Error messages in Korean
- RESTful API design patterns

---

**Last Updated**: Current session - Tournament creation 500 error resolved
**Next Steps**: Continue development from current stable state with both servers running