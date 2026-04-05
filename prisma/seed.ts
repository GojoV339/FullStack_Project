import { PrismaClient, FoodSection } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const snackItems = [
  { name: 'Samosa', price: 10, category: 'Snacks' },
  { name: 'Bread Omelette', price: 25, category: 'Snacks' },
  { name: 'Veg Puff', price: 15, category: 'Snacks' },
  { name: 'Masala Chai', price: 10, category: 'Beverages' },
  { name: 'Filter Coffee', price: 15, category: 'Beverages' },
  { name: 'Biscuit / Parle-G', price: 5, category: 'Packaged' },
  { name: 'Frooti / Cold Drink', price: 20, category: 'Beverages' },
  { name: 'Banana', price: 10, category: 'Fruits' },
];

const cookToOrderItems = [
  { name: 'Plain Dosa', price: 30, etaMinutes: 10, category: 'South Indian' },
  { name: 'Masala Dosa', price: 40, etaMinutes: 12, category: 'South Indian' },
  { name: 'Idli (2 pcs)', price: 20, etaMinutes: 8, category: 'South Indian' },
  { name: 'Vada (2 pcs)', price: 20, etaMinutes: 8, category: 'South Indian' },
  { name: 'Pongal', price: 25, etaMinutes: 10, category: 'South Indian' },
  { name: 'Upma', price: 20, etaMinutes: 8, category: 'South Indian' },
  { name: 'Rava Idli', price: 25, etaMinutes: 10, category: 'South Indian' },
  { name: 'Curd Rice', price: 30, etaMinutes: 5, category: 'Rice' },
  { name: 'Lemon Rice', price: 25, etaMinutes: 5, category: 'Rice' },
  { name: 'Vegetable Rice', price: 40, etaMinutes: 15, category: 'Rice' },
  { name: 'Chapati with Sabzi', price: 35, etaMinutes: 15, category: 'North Indian' },
  { name: 'Parotta with Salna', price: 40, etaMinutes: 15, category: 'Kerala' },
];

const comboItems = [
  { name: 'Student Combo (Idli + Vada + Filter Coffee)', price: 45, etaMinutes: 10, category: 'Combo' },
  { name: 'Dosa Combo (Masala Dosa + Filter Coffee)', price: 50, etaMinutes: 12, category: 'Combo' },
  { name: 'South Indian Breakfast (Idli + Vada + Pongal + Chai)', price: 65, etaMinutes: 12, category: 'Combo' },
];

const cafeterias = [
  { name: 'Samridhi', location: 'Ground Floor, Main Block' },
  { name: 'Canteen Main', location: 'Near Admin Block' },
  { name: 'E Block Canteen', location: 'E Block, Ground Floor' },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.cafeteria.deleteMany();
  await prisma.pushSubscription.deleteMany();
  await prisma.student.deleteMany();
  await prisma.staff.deleteMany();

  // Create cafeterias
  for (const cafe of cafeterias) {
    const created = await prisma.cafeteria.create({
      data: {
        name: cafe.name,
        location: cafe.location,
        isOpen: true,
        avgWaitMinutes: 10,
      },
    });

    console.log(`🏪 Created cafeteria: ${created.name}`);

    // Create snack items
    for (const item of snackItems) {
      await prisma.menuItem.create({
        data: {
          cafeteriaId: created.id,
          name: item.name,
          section: FoodSection.SNACK,
          category: item.category,
          price: item.price,
          etaMinutes: 0,
          isCombo: false,
          isPriorityOnly: false,
          isAvailable: true,
        },
      });
    }

    // Create cook-to-order items
    for (const item of cookToOrderItems) {
      await prisma.menuItem.create({
        data: {
          cafeteriaId: created.id,
          name: item.name,
          section: FoodSection.COOK_TO_ORDER,
          category: item.category,
          price: item.price,
          etaMinutes: item.etaMinutes,
          isCombo: false,
          isPriorityOnly: false,
          isAvailable: true,
        },
      });
    }

    // Create combo items
    for (const item of comboItems) {
      await prisma.menuItem.create({
        data: {
          cafeteriaId: created.id,
          name: item.name,
          section: FoodSection.COOK_TO_ORDER,
          category: item.category,
          price: item.price,
          etaMinutes: item.etaMinutes,
          isCombo: true,
          isPriorityOnly: false,
          isAvailable: true,
        },
      });
    }

    console.log(`  📋 Added ${snackItems.length + cookToOrderItems.length + comboItems.length} menu items`);
  }

  // Create a demo staff user (password: admin123)
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const firstCafe = await prisma.cafeteria.findFirst();
  if (firstCafe) {
    await prisma.staff.create({
      data: {
        name: 'Admin',
        email: 'admin@amrita.edu',
        password: hashedPassword,
        cafeteriaId: firstCafe.id,
      },
    });
    console.log('👤 Created staff user: admin@amrita.edu / admin123');
  }

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
