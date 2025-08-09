import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addTestParticipants() {
  console.log('🌱 Adding test participants...');

  const testParticipants = [
    { id: 'test-01', name: '김민수', gender: 'male', birthYear: 1990, skillLevel: 'A' },
    { id: 'test-02', name: '이준호', gender: 'male', birthYear: 1992, skillLevel: 'A' },
    { id: 'test-03', name: '박성민', gender: 'male', birthYear: 1988, skillLevel: 'A' },
    { id: 'test-04', name: '정우진', gender: 'male', birthYear: 1993, skillLevel: 'B' },
    { id: 'test-05', name: '홍길동', gender: 'male', birthYear: 1991, skillLevel: 'B' },
    { id: 'test-06', name: '조현우', gender: 'male', birthYear: 1989, skillLevel: 'C' },
    { id: 'test-07', name: '김지영', gender: 'female', birthYear: 1994, skillLevel: 'A' },
    { id: 'test-08', name: '박소연', gender: 'female', birthYear: 1992, skillLevel: 'B' },
    { id: 'test-09', name: '이수정', gender: 'female', birthYear: 1990, skillLevel: 'A' },
    { id: 'test-10', name: '최민정', gender: 'female', birthYear: 1995, skillLevel: 'C' },
  ];

  for (const participant of testParticipants) {
    try {
      await prisma.participant.upsert({
        where: { id: participant.id },
        update: {},
        create: {
          id: participant.id,
          tournamentId: 'sample-tournament-id',
          name: participant.name,
          gender: participant.gender,
          birthYear: participant.birthYear,
          province: 'HCM',
          district: 'HCM-Q1',
          phone: `098765432${testParticipants.indexOf(participant) + 1}`,
          experience: 'intermediate',
          skillLevel: participant.skillLevel,
          approvalStatus: 'approved',
          paymentStatus: 'completed',
        },
      });
      console.log(`✅ ${participant.name} added`);
    } catch (error) {
      console.error(`❌ Error adding ${participant.name}:`, error);
    }
  }

  console.log('🎉 Test participants added successfully!');
}

addTestParticipants()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });