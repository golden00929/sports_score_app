// 날짜 포맷팅 유틸리티
export const formatDate = (dateString: string | Date, format: 'short' | 'long' | 'withTime' = 'short'): string => {
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  switch (format) {
    case 'long':
      // DD/MM/YYYY (Monday)
      const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
      const weekday = weekdays[date.getDay()];
      return `${day}/${month}/${year} (${weekday})`;
    
    case 'withTime':
      // DD/MM/YYYY HH:mm
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    
    case 'short':
    default:
      // DD/MM/YYYY
      return `${day}/${month}/${year}`;
  }
};

// 날짜 범위 포맷 (시작일 - 종료일)
export const formatDateRange = (startDate: string | Date, endDate: string | Date): string => {
  const start = formatDate(startDate);
  const end = formatDate(endDate);
  
  if (start === end) {
    return start;
  }
  
  return `${start} ~ ${end}`;
};

// D-Day 계산
export const calculateDDay = (targetDate: string | Date): number => {
  const today = new Date();
  const target = new Date(targetDate);
  
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

// D-Day 표시 텍스트
export const getDDayText = (targetDate: string | Date): string => {
  const dDay = calculateDDay(targetDate);
  
  if (dDay > 0) {
    return `D-${dDay}`;
  } else if (dDay === 0) {
    return 'D-Day';
  } else {
    return `D+${Math.abs(dDay)}`;
  }
};

// 상대적 시간 표시 (예: "3일 전", "2시간 후")
export const getRelativeTime = (dateString: string | Date): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = date.getTime() - now.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (Math.abs(diffInDays) >= 1) {
    return diffInDays > 0 ? `${diffInDays}일 후` : `${Math.abs(diffInDays)}일 전`;
  } else if (Math.abs(diffInHours) >= 1) {
    return diffInHours > 0 ? `${diffInHours}시간 후` : `${Math.abs(diffInHours)}시간 전`;
  } else if (Math.abs(diffInMinutes) >= 1) {
    return diffInMinutes > 0 ? `${diffInMinutes}분 후` : `${Math.abs(diffInMinutes)}분 전`;
  } else {
    return '방금 전';
  }
};

// ISO 날짜 문자열 (YYYY-MM-DD)을 YYYY-MM-DD 형식으로 변환 (form input용)
export const convertISOToFormDate = (isoDateString: string): string => {
  if (!isoDateString) return '';
  
  // ISO 날짜에서 날짜 부분만 추출 (YYYY-MM-DD)
  return isoDateString.split('T')[0];
};

// 현재 날짜를 YYYY-MM-DD 형식으로 반환 (form input용)
export const getTodayForForm = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};