import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  errorFormat: 'pretty',
});

// 베트남 시간대 설정 헬퍼 함수
export const getVietnamTime = (date?: Date): Date => {
  const vietnamTime = new Date(date || new Date());
  vietnamTime.setHours(vietnamTime.getHours() + 7); // UTC+7
  return vietnamTime;
};

// 베트남 시간대로 날짜 포맷팅
export const formatVietnamTime = (date: Date, format: 'date' | 'time' | 'datetime' = 'datetime'): string => {
  const vietnamDate = getVietnamTime(date);
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Ho_Chi_Minh',
  };

  switch (format) {
    case 'date':
      options.year = 'numeric';
      options.month = '2-digit';
      options.day = '2-digit';
      break;
    case 'time':
      options.hour = '2-digit';
      options.minute = '2-digit';
      options.hour12 = false;
      break;
    case 'datetime':
      options.year = 'numeric';
      options.month = '2-digit';
      options.day = '2-digit';
      options.hour = '2-digit';
      options.minute = '2-digit';
      options.hour12 = false;
      break;
  }

  return vietnamDate.toLocaleString('vi-VN', options);
};

// 연결 테스트
async function connectDB() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    console.log('🌏 Timezone configured for Vietnam (UTC+7)');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  console.log('🔌 Database disconnected');
});

connectDB();

export { prisma };
export default prisma;