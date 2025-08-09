const { PrismaClient } = require('@prisma/client');

async function checkAdmins() {
  const prisma = new PrismaClient();
  
  try {
    const admins = await prisma.admin.findMany();
    console.log('Existing admins:');
    console.log(admins);
  } catch (error) {
    console.error('Error checking admins:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmins();