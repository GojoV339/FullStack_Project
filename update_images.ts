import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateImages() {
  try {
    console.log('Connecting to database...');
    
    // Update Butter Milk
    const updateButterMilk = await prisma.menuItem.updateMany({
      where: {
        name: {
          contains: 'Butter Milk',
          mode: 'insensitive' // case-insensitive search
        }
      },
      data: {
        imageUrl: '/images/menu/Butter_Milk.jpg'
      }
    });
    console.log(`Updated ${updateButterMilk.count} items matching "Butter Milk"`);

    // Update Filter Coffee
    const updateCoffee = await prisma.menuItem.updateMany({
      where: {
        name: {
          contains: 'Filter Coffee',
          mode: 'insensitive'
        }
      },
      data: {
        imageUrl: '/images/menu/Filter_Coffee.jpg'
      }
    });
    console.log(`Updated ${updateCoffee.count} items matching "Filter Coffee"`);

    console.log('Images successfully linked in the database!');
  } catch (error) {
    console.error('Error updating images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateImages();
