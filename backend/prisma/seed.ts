import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 관리자 계정 생성
  const adminPassword = await hashPassword(process.env.ADMIN_PASSWORD || 'admin123!');
  
  const admin = await prisma.admin.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@miiracer.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@miiracer.com',
      password: adminPassword,
      name: 'Miiracer Admin',
      role: 'admin',
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // 베트남 지역 데이터 시딩
  const vietnamLocations = [
    // 주요 시/성
    { nameEn: 'Ho Chi Minh City', nameVi: 'Thành phố Hồ Chí Minh', nameKo: '호치민시', type: 'province', code: 'HCM' },
    { nameEn: 'Hanoi', nameVi: 'Hà Nội', nameKo: '하노이', type: 'province', code: 'HN' },
    { nameEn: 'Da Nang', nameVi: 'Đà Nẵng', nameKo: '다낭', type: 'province', code: 'DN' },
    { nameEn: 'Can Tho', nameVi: 'Cần Thơ', nameKo: '껀터', type: 'province', code: 'CT' },
    { nameEn: 'Hai Phong', nameVi: 'Hải Phòng', nameKo: '하이퐁', type: 'province', code: 'HP' },
    { nameEn: 'Bien Hoa', nameVi: 'Biên Hòa', nameKo: '비엔호아', type: 'province', code: 'BH' },
    { nameEn: 'Nha Trang', nameVi: 'Nha Trang', nameKo: '나트랑', type: 'province', code: 'NT' },
    { nameEn: 'Vung Tau', nameVi: 'Vũng Tàu', nameKo: '붕따우', type: 'province', code: 'VT' },
    { nameEn: 'Hue', nameVi: 'Huế', nameKo: '후에', type: 'province', code: 'HUE' },
    { nameEn: 'Buon Ma Thuot', nameVi: 'Buôn Ma Thuột', nameKo: '부온마투옷', type: 'province', code: 'BMT' },
  ];

  for (const location of vietnamLocations) {
    await prisma.vietnamLocation.upsert({
      where: { code: location.code },
      update: {},
      create: location,
    });
  }

  // 호치민시 주요 구 데이터
  const hcmProvinceId = await prisma.vietnamLocation.findUnique({
    where: { code: 'HCM' },
  });

  if (hcmProvinceId) {
    const hcmDistricts = [
      { nameEn: 'District 1', nameVi: 'Quận 1', nameKo: '1군', type: 'district', code: 'HCM-Q1', parentId: hcmProvinceId.id },
      { nameEn: 'District 3', nameVi: 'Quận 3', nameKo: '3군', type: 'district', code: 'HCM-Q3', parentId: hcmProvinceId.id },
      { nameEn: 'District 5', nameVi: 'Quận 5', nameKo: '5군', type: 'district', code: 'HCM-Q5', parentId: hcmProvinceId.id },
      { nameEn: 'District 7', nameVi: 'Quận 7', nameKo: '7군', type: 'district', code: 'HCM-Q7', parentId: hcmProvinceId.id },
      { nameEn: 'District 10', nameVi: 'Quận 10', nameKo: '10군', type: 'district', code: 'HCM-Q10', parentId: hcmProvinceId.id },
      { nameEn: 'Binh Thanh', nameVi: 'Bình Thạnh', nameKo: '빈탄군', type: 'district', code: 'HCM-BT', parentId: hcmProvinceId.id },
      { nameEn: 'Phu Nhuan', nameVi: 'Phú Nhuận', nameKo: '푸뉴안군', type: 'district', code: 'HCM-PN', parentId: hcmProvinceId.id },
      { nameEn: 'Thu Duc', nameVi: 'Thủ Đức', nameKo: '투득시', type: 'district', code: 'HCM-TD', parentId: hcmProvinceId.id },
    ];

    for (const district of hcmDistricts) {
      await prisma.vietnamLocation.upsert({
        where: { code: district.code },
        update: {},
        create: district,
      });
    }
  }

  console.log('✅ Vietnam locations seeded');

  // 샘플 대회 정보 생성
  const sampleTournament = await prisma.tournamentInfo.upsert({
    where: { id: 'sample-tournament-id' },
    update: {},
    create: {
      id: 'sample-tournament-id',
      name: '2024 Miiracer 배드민턴 오픈 토너먼트',
      description: '베트남 호치민에서 개최되는 배드민턴 토너먼트입니다. 모든 레벨의 선수들이 참가할 수 있으며, A, B, C 그룹으로 나누어 진행됩니다.',
      startDate: new Date('2024-12-01T08:00:00Z'),
      endDate: new Date('2024-12-01T18:00:00Z'),
      registrationStart: new Date('2024-11-01T00:00:00Z'),
      registrationEnd: new Date('2024-11-25T23:59:59Z'),
      location: '호치민시 7군 스포츠 센터',
      locationLat: 10.7354,
      locationLng: 106.7212,
      venue: 'Saigon Sports Complex',
      contactPhone: '0901234567',
      contactSns: 'https://facebook.com/miiracer',
      organizerInfo: JSON.stringify({
        organizer: 'Miiracer Sports',
        host: '베트남 배드민턴 협회',
        sponsors: ['Nike', 'Yonex', 'Victor'],
      }),
      participantFee: 200000, // 200,000 VND
      bankInfo: JSON.stringify({
        bankName: 'Vietcombank',
        accountNumber: '1234567890',
        accountName: 'MIIRACER SPORTS',
      }),
      maxParticipants: 64,
      status: 'upcoming',
    },
  });

  console.log('✅ Sample tournament created');

  // 샘플 참가자들 생성
  const sampleParticipants = [
    {
      name: '김민수',
      gender: 'male',
      birthYear: 1990,
      province: 'Ho Chi Minh City',
      district: 'District 1',
      phone: '0901234567',
      experience: '3년',
      skillLevel: 'A',
      eventType: 'men_singles',
      approvalStatus: 'pending',
    },
    {
      name: '이영희',
      gender: 'female',
      birthYear: 1995,
      province: 'Ho Chi Minh City',
      district: 'District 3',
      phone: '0907654321',
      experience: '2년',
      skillLevel: 'B',
      eventType: 'women_singles',
      approvalStatus: 'pending',
    },
    {
      name: '박철수',
      gender: 'male',
      birthYear: 1988,
      province: 'Ho Chi Minh City',
      district: 'District 7',
      phone: '0909876543',
      experience: '5년 이상',
      skillLevel: 'A',
      eventType: 'men_singles',
      approvalStatus: 'approved',
    },
    {
      name: '최수정',
      gender: 'female',
      birthYear: 1992,
      province: 'Ho Chi Minh City',
      district: 'Binh Thanh',
      phone: '0905432100',
      experience: '1년',
      skillLevel: 'C',
      eventType: 'women_singles',
      approvalStatus: 'pending',
    },
    {
      name: '장현우',
      gender: 'male',
      birthYear: 1985,
      province: 'Ho Chi Minh City',
      district: 'District 5',
      phone: '0908765432',
      experience: '4년',
      skillLevel: 'B',
      eventType: 'men_singles',
      approvalStatus: 'approved',
    },
    {
      name: '강지영',
      gender: 'female',
      birthYear: 1993,
      province: 'Ho Chi Minh City',
      district: 'Phu Nhuan',
      phone: '0903456789',
      experience: '2년',
      skillLevel: 'B',
      eventType: 'women_singles',
      approvalStatus: 'pending',
    },
    {
      name: '윤동현',
      gender: 'male',
      birthYear: 1991,
      province: 'Ho Chi Minh City',
      district: 'District 10',
      phone: '0906543210',
      experience: '3년',
      skillLevel: 'A',
      eventType: 'men_singles',
      approvalStatus: 'approved',
    },
    {
      name: '송미래',
      gender: 'female',
      birthYear: 1996,
      province: 'Ho Chi Minh City',
      district: 'Thu Duc',
      phone: '0904567890',
      experience: '1년',
      skillLevel: 'C',
      eventType: 'women_singles',
      approvalStatus: 'pending',
    },
    {
      name: '정태웅',
      gender: 'male',
      birthYear: 1987,
      province: 'Ho Chi Minh City',
      district: 'District 1',
      phone: '0902345678',
      experience: '6년 이상',
      skillLevel: 'A',
      eventType: 'men_singles',
      approvalStatus: 'approved',
    },
    {
      name: '한소희',
      gender: 'female',
      birthYear: 1994,
      province: 'Ho Chi Minh City',
      district: 'District 3',
      phone: '0909988776',
      experience: '2년',
      skillLevel: 'B',
      eventType: 'women_singles',
      approvalStatus: 'pending',
    },
  ];

  for (const participant of sampleParticipants) {
    await prisma.participant.create({
      data: {
        ...participant,
        tournamentId: 'sample-tournament-id',
      },
    });
  }

  console.log(`✅ ${sampleParticipants.length} sample participants created`);

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });