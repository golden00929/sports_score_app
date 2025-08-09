"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = exports.formatVietnamTime = exports.getVietnamTime = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
    errorFormat: 'pretty',
});
exports.prisma = prisma;
// 베트남 시간대 설정 헬퍼 함수
const getVietnamTime = (date) => {
    const vietnamTime = new Date(date || new Date());
    vietnamTime.setHours(vietnamTime.getHours() + 7); // UTC+7
    return vietnamTime;
};
exports.getVietnamTime = getVietnamTime;
// 베트남 시간대로 날짜 포맷팅
const formatVietnamTime = (date, format = 'datetime') => {
    const vietnamDate = (0, exports.getVietnamTime)(date);
    const options = {
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
exports.formatVietnamTime = formatVietnamTime;
// 연결 테스트
async function connectDB() {
    try {
        await prisma.$connect();
        console.log('✅ Database connected successfully');
        console.log('🌏 Timezone configured for Vietnam (UTC+7)');
    }
    catch (error) {
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
exports.default = prisma;
//# sourceMappingURL=database.js.map