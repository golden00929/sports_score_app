const { PrismaClient } = require('@prisma/client');

async function updateTournament() {
  const prisma = new PrismaClient();
  
  try {
    const now = new Date();
    const futureDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from now
    
    const updated = await prisma.tournamentInfo.update({
      where: {
        id: 'sample-tournament-id'
      },
      data: {
        registrationEnd: futureDate
      }
    });
    
    console.log('Tournament registration end date updated to:', updated.registrationEnd);
  } catch (error) {
    console.error('Error updating tournament:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateTournament();