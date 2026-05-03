import { PrismaClient, FoodSection } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const snackItems = [
  { name: 'Samosa', price: 10, category: 'Snacks', isPriorityOnly: false },
  { name: 'Bread Omelette', price: 25, category: 'Snacks', isPriorityOnly: false },
  { name: 'Veg Puff', price: 15, category: 'Snacks', isPriorityOnly: false },
  { name: 'Egg Puff', price: 20, category: 'Snacks', isPriorityOnly: false },
  { name: 'Paneer Puff', price: 25, category: 'Snacks', isPriorityOnly: false },
  { name: 'Masala Chai', price: 10, category: 'Beverages', isPriorityOnly: false },
  { name: 'Filter Coffee', price: 15, category: 'Beverages', isPriorityOnly: false },
  { name: 'Lemon Tea', price: 12, category: 'Beverages', isPriorityOnly: false },
  { name: 'Biscuit / Parle-G', price: 5, category: 'Packaged', isPriorityOnly: false },
  { name: 'Frooti / Cold Drink', price: 20, category: 'Beverages', isPriorityOnly: false },
  { name: 'Banana', price: 10, category: 'Fruits', isPriorityOnly: false },
  { name: 'Apple', price: 15, category: 'Fruits', isPriorityOnly: false },
  { name: 'Chips Packet', price: 10, category: 'Packaged', isPriorityOnly: false },
  { name: 'Chocolate Bar', price: 20, category: 'Packaged', isPriorityOnly: false },
  { name: 'Buttermilk', price: 15, category: 'Beverages', isPriorityOnly: false },
];

const cookToOrderItems = [
  { name: 'Plain Dosa', price: 30, etaMinutes: 10, category: 'South Indian', isPriorityOnly: false },
  { name: 'Masala Dosa', price: 40, etaMinutes: 12, category: 'South Indian', isPriorityOnly: false },
  { name: 'Ghee Roast Dosa', price: 50, etaMinutes: 12, category: 'South Indian', isPriorityOnly: true },
  { name: 'Idli (2 pcs)', price: 20, etaMinutes: 8, category: 'South Indian', isPriorityOnly: false },
  { name: 'Vada (2 pcs)', price: 20, etaMinutes: 8, category: 'South Indian', isPriorityOnly: false },
  { name: 'Pongal', price: 25, etaMinutes: 10, category: 'South Indian', isPriorityOnly: false },
  { name: 'Upma', price: 20, etaMinutes: 8, category: 'South Indian', isPriorityOnly: false },
  { name: 'Rava Idli', price: 25, etaMinutes: 10, category: 'South Indian', isPriorityOnly: false },
  { name: 'Curd Rice', price: 30, etaMinutes: 5, category: 'Rice', isPriorityOnly: false },
  { name: 'Lemon Rice', price: 25, etaMinutes: 5, category: 'Rice', isPriorityOnly: false },
  { name: 'Vegetable Rice', price: 40, etaMinutes: 15, category: 'Rice', isPriorityOnly: false },
  { name: 'Vegetable Biryani', price: 60, etaMinutes: 20, category: 'Rice', isPriorityOnly: true },
  { name: 'Chapati with Sabzi (3 pcs)', price: 35, etaMinutes: 15, category: 'North Indian', isPriorityOnly: false },
  { name: 'Parotta with Salna (2 pcs)', price: 40, etaMinutes: 15, category: 'Kerala', isPriorityOnly: false },
  { name: 'Poori with Potato Curry (3 pcs)', price: 35, etaMinutes: 12, category: 'North Indian', isPriorityOnly: false },
  { name: 'Paneer Butter Masala with Chapati', price: 70, etaMinutes: 18, category: 'North Indian', isPriorityOnly: true },
  { name: 'Veg Noodles', price: 45, etaMinutes: 15, category: 'Chinese', isPriorityOnly: false },
  { name: 'Veg Fried Rice', price: 45, etaMinutes: 15, category: 'Chinese', isPriorityOnly: false },
  { name: 'Gobi Manchurian', price: 50, etaMinutes: 15, category: 'Chinese', isPriorityOnly: false },
  { name: 'Paneer Fried Rice', price: 60, etaMinutes: 18, category: 'Chinese', isPriorityOnly: true },
];

const comboItems = [
  { name: 'Student Combo (Idli + Vada + Filter Coffee)', price: 45, etaMinutes: 10, category: 'Combo', isPriorityOnly: false },
  { name: 'Dosa Combo (Masala Dosa + Filter Coffee)', price: 50, etaMinutes: 12, category: 'Combo', isPriorityOnly: false },
  { name: 'South Indian Breakfast (Idli + Vada + Pongal + Chai)', price: 65, etaMinutes: 12, category: 'Combo', isPriorityOnly: false },
  { name: 'North Indian Meal (Chapati + Sabzi + Rice + Curd)', price: 70, etaMinutes: 18, category: 'Combo', isPriorityOnly: false },
  { name: 'Premium Combo (Ghee Roast + Vada + Filter Coffee)', price: 80, etaMinutes: 15, category: 'Combo', isPriorityOnly: true },
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
          isPriorityOnly: item.isPriorityOnly,
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
          isPriorityOnly: item.isPriorityOnly,
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
          isPriorityOnly: item.isPriorityOnly,
          isAvailable: true,
        },
      });
    }

    console.log(`  📋 Added ${snackItems.length + cookToOrderItems.length + comboItems.length} menu items`);
  }

  // Create staff users for each cafeteria
  const cafeteriaList = await prisma.cafeteria.findMany();
  
  const staffAccounts = [
    { name: 'Admin User', email: 'admin@amrita.edu', password: 'admin123', cafeteriaIndex: 0 },
    { name: 'Rajesh Kumar', email: 'rajesh@amrita.edu', password: 'staff123', cafeteriaIndex: 0 },
    { name: 'Priya Sharma', email: 'priya@amrita.edu', password: 'staff456', cafeteriaIndex: 1 },
    { name: 'Arun Menon', email: 'arun@amrita.edu', password: 'staff789', cafeteriaIndex: 2 },
  ];

  for (const staff of staffAccounts) {
    const hashedPassword = await bcrypt.hash(staff.password, 10);
    const cafeteria = cafeteriaList[staff.cafeteriaIndex];
    
    if (cafeteria) {
      await prisma.staff.create({
        data: {
          name: staff.name,
          email: staff.email,
          password: hashedPassword,
          cafeteriaId: cafeteria.id,
        },
      });
      console.log(`👤 Created staff user: ${staff.email} / ${staff.password} (${cafeteria.name})`);
    }
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
