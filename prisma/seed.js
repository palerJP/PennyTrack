const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const DEFAULT_EXPENSES = [
  { name: 'Food & Dining', icon: 'Utensils', color: '#f59e0b', type: 'EXPENSE' },
  { name: 'Housing & Rent', icon: 'Home', color: '#3b82f6', type: 'EXPENSE' },
  { name: 'Transportation', icon: 'Car', color: '#06b6d4', type: 'EXPENSE' },
  { name: 'Utilities & Bills', icon: 'Zap', color: '#eab308', type: 'EXPENSE' },
  { name: 'Groceries', icon: 'ShoppingCart', color: '#10b981', type: 'EXPENSE' },
  { name: 'Healthcare', icon: 'HeartPulse', color: '#ef4444', type: 'EXPENSE' },
  { name: 'Entertainment', icon: 'Film', color: '#8b5cf6', type: 'EXPENSE' },
  { name: 'Personal Care', icon: 'Smile', color: '#ec4899', type: 'EXPENSE' },
  { name: 'Education', icon: 'GraduationCap', color: '#6366f1', type: 'EXPENSE' },
  { name: 'Shopping', icon: 'ShoppingBag', color: '#f97316', type: 'EXPENSE' },
  { name: 'Subscriptions', icon: 'CreditCard', color: '#14b8a6', type: 'EXPENSE' },
  { name: 'Others', icon: 'MoreHorizontal', color: '#64748b', type: 'EXPENSE' },
];

const DEFAULT_INCOMES = [
  { name: 'Salary & Wages', icon: 'Briefcase', color: '#10b981', type: 'INCOME' },
  { name: 'Freelance & Projects', icon: 'Laptop', color: '#3b82f6', type: 'INCOME' },
  { name: 'Investments & Dividends', icon: 'TrendingUp', color: '#8b5cf6', type: 'INCOME' },
  { name: 'Allowances & Gifts', icon: 'Gift', color: '#f59e0b', type: 'INCOME' },
  { name: 'Side Business', icon: 'Store', color: '#06b6d4', type: 'INCOME' },
  { name: 'Other Income', icon: 'PlusCircle', color: '#64748b', type: 'INCOME' },
];

async function main() {
  console.log('Seeding PennyTrack database...');

  // Create default categories
  const allDefaults = [...DEFAULT_EXPENSES, ...DEFAULT_INCOMES];
  for (const cat of allDefaults) {
    const existing = await prisma.category.findFirst({
      where: { name: cat.name, isDefault: true }
    });
    if (!existing) {
      await prisma.category.create({
        data: {
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
          type: cat.type,
          isDefault: true,
        }
      });
    }
  }

  // Create Demo User
  const demoEmail = 'demo@pennytrack.com';
  let demoUser = await prisma.user.findUnique({
    where: { email: demoEmail }
  });

  const hashedPassword = await bcrypt.hash('pennytrack123', 10);

  if (!demoUser) {
    demoUser = await prisma.user.create({
      data: {
        name: 'Alex Rivera',
        email: demoEmail,
        password: hashedPassword,
        currency: 'PHP',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        theme: 'light',
        emailAlerts: true,
        budgetAlerts: true,
      }
    });
    console.log(`Created demo user: ${demoUser.email} / pennytrack123`);
  }

  // Fetch all categories for user linking
  const categories = await prisma.category.findMany();
  const getCat = (name) => categories.find(c => c.name === name)?.id;

  // Clear existing transactions & budgets for demo user to have fresh realistic data
  await prisma.transaction.deleteMany({ where: { userId: demoUser.id } });
  await prisma.budget.deleteMany({ where: { userId: demoUser.id } });
  await prisma.recurringTransaction.deleteMany({ where: { userId: demoUser.id } });
  await prisma.notification.deleteMany({ where: { userId: demoUser.id } });

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // Seed Budgets for current month
  const budgetData = [
    { catName: 'Food & Dining', limit: 8000 },
    { catName: 'Housing & Rent', limit: 15000 },
    { catName: 'Transportation', limit: 4000 },
    { catName: 'Groceries', limit: 9000 },
    { catName: 'Utilities & Bills', limit: 5500 },
    { catName: 'Entertainment', limit: 3000 },
    { catName: 'Shopping', limit: 5000 },
    { catName: 'Subscriptions', limit: 1500 },
  ];

  for (const b of budgetData) {
    const catId = getCat(b.catName);
    if (catId) {
      await prisma.budget.create({
        data: {
          userId: demoUser.id,
          categoryId: catId,
          amountLimit: b.limit,
          month: currentMonthStr,
        }
      });
    }
  }

  // Seed Sample Transactions (Income & Expenses across past 45 days)
  const sampleTransactions = [
    // Incomes
    { desc: 'Monthly Software Engineer Salary', amount: 55000, type: 'INCOME', cat: 'Salary & Wages', daysAgo: 1 },
    { desc: 'Web Development Client Milestone 1', amount: 18000, type: 'INCOME', cat: 'Freelance & Projects', daysAgo: 5 },
    { desc: 'Stock Portfolio Dividend Payout', amount: 3200, type: 'INCOME', cat: 'Investments & Dividends', daysAgo: 12 },
    { desc: 'Previous Month Salary', amount: 55000, type: 'INCOME', cat: 'Salary & Wages', daysAgo: 31 },
    { desc: 'Mobile UI Design Consulting', amount: 12500, type: 'INCOME', cat: 'Freelance & Projects', daysAgo: 24 },

    // Expenses
    { desc: 'Condo Monthly Rental', amount: 14500, type: 'EXPENSE', cat: 'Housing & Rent', daysAgo: 2, tags: 'housing,fixed' },
    { desc: 'Supermarket Weekly Restock', amount: 3420.50, type: 'EXPENSE', cat: 'Groceries', daysAgo: 3, tags: 'food,essential' },
    { desc: 'Meralco Electricity Bill', amount: 3150, type: 'EXPENSE', cat: 'Utilities & Bills', daysAgo: 4, tags: 'bills' },
    { desc: 'Dinner with College Friends at Ramen Nagi', amount: 1650, type: 'EXPENSE', cat: 'Food & Dining', daysAgo: 4, tags: 'dining,social' },
    { desc: 'GrabCar Rides to Tech Meetup', amount: 480, type: 'EXPENSE', cat: 'Transportation', daysAgo: 6, tags: 'commute' },
    { desc: 'Fiber Internet 200Mbps Monthly', amount: 1699, type: 'EXPENSE', cat: 'Utilities & Bills', daysAgo: 7, tags: 'internet,work' },
    { desc: 'Uniqlo Casual Work Shirts', amount: 2490, type: 'EXPENSE', cat: 'Shopping', daysAgo: 8, tags: 'clothes' },
    { desc: 'Weekend Cafe Brunch & Coffee', amount: 620, type: 'EXPENSE', cat: 'Food & Dining', daysAgo: 9, tags: 'coffee' },
    { desc: 'Gas Station Full Tank', amount: 2200, type: 'EXPENSE', cat: 'Transportation', daysAgo: 10, tags: 'fuel' },
    { desc: 'Netflix Premium 4K Plan', amount: 549, type: 'EXPENSE', cat: 'Subscriptions', daysAgo: 11, tags: 'entertainment' },
    { desc: 'Spotify Duo Subscription', amount: 199, type: 'EXPENSE', cat: 'Subscriptions', daysAgo: 11, tags: 'music' },
    { desc: 'Cinema IMAX Movie Tickets', amount: 950, type: 'EXPENSE', cat: 'Entertainment', daysAgo: 13, tags: 'leisure' },
    { desc: 'Pharmacy Vitamins & Supplements', amount: 1250, type: 'EXPENSE', cat: 'Healthcare', daysAgo: 15, tags: 'health' },
    { desc: 'Local Wet Market Fresh Produce', amount: 1450, type: 'EXPENSE', cat: 'Groceries', daysAgo: 16, tags: 'groceries' },
    { desc: 'Mid-week Quick Lunch Poke Bowl', amount: 380, type: 'EXPENSE', cat: 'Food & Dining', daysAgo: 17, tags: 'lunch' },
    { desc: 'Online Course Web Dev Certification', amount: 2100, type: 'EXPENSE', cat: 'Education', daysAgo: 18, tags: 'upskill' },
    { desc: 'Barbershop Haircut & Grooming', amount: 450, type: 'EXPENSE', cat: 'Personal Care', daysAgo: 19, tags: 'grooming' },
    { desc: 'Water Utility Bill', amount: 480, type: 'EXPENSE', cat: 'Utilities & Bills', daysAgo: 20, tags: 'bills' },
    { desc: 'Artisanal Bakery Breads & Pastries', amount: 520, type: 'EXPENSE', cat: 'Food & Dining', daysAgo: 22, tags: 'food' },
    { desc: 'Expressway RFID Toll Reload', amount: 1000, type: 'EXPENSE', cat: 'Transportation', daysAgo: 25, tags: 'transport' },
    { desc: 'Steam Game Summer Sale', amount: 1250, type: 'EXPENSE', cat: 'Entertainment', daysAgo: 27, tags: 'gaming' },
    { desc: 'Previous Month Rent Payment', amount: 14500, type: 'EXPENSE', cat: 'Housing & Rent', daysAgo: 32, tags: 'rent' },
    { desc: 'Bulk Grocery Shopping at Landers', amount: 5600, type: 'EXPENSE', cat: 'Groceries', daysAgo: 34, tags: 'groceries' },
  ];

  for (const t of sampleTransactions) {
    const catId = getCat(t.cat);
    if (catId) {
      const txDate = new Date();
      txDate.setDate(txDate.getDate() - t.daysAgo);
      await prisma.transaction.create({
        data: {
          userId: demoUser.id,
          categoryId: catId,
          amount: t.amount,
          type: t.type,
          description: t.desc,
          date: txDate,
          tags: t.tags || null,
          notes: `Auto-recorded entry for ${t.desc}`,
        }
      });
    }
  }

  // Seed Recurring Transactions
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 4);
  const nextMonth = new Date();
  nextMonth.setDate(nextMonth.getDate() + 15);

  const subCatId = getCat('Subscriptions');
  const rentCatId = getCat('Housing & Rent');
  const utilCatId = getCat('Utilities & Bills');
  const salaryCatId = getCat('Salary & Wages');

  if (subCatId) {
    await prisma.recurringTransaction.create({
      data: {
        userId: demoUser.id,
        categoryId: subCatId,
        amount: 549,
        type: 'EXPENSE',
        frequency: 'MONTHLY',
        nextDate: nextWeek,
        description: 'Netflix 4K Ultra HD Family Subscription',
        isActive: true,
      }
    });
  }

  if (utilCatId) {
    await prisma.recurringTransaction.create({
      data: {
        userId: demoUser.id,
        categoryId: utilCatId,
        amount: 1699,
        type: 'EXPENSE',
        frequency: 'MONTHLY',
        nextDate: nextMonth,
        description: 'PLDT Home Fiber 200Mbps',
        isActive: true,
      }
    });
  }

  if (salaryCatId) {
    await prisma.recurringTransaction.create({
      data: {
        userId: demoUser.id,
        categoryId: salaryCatId,
        amount: 55000,
        type: 'INCOME',
        frequency: 'MONTHLY',
        nextDate: nextMonth,
        description: 'Monthly Base Payroll Deposit',
        isActive: true,
      }
    });
  }

  // Seed Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: demoUser.id,
        title: 'Budget Alert: Food & Dining',
        message: 'You have used 78% of your ₱8,000 monthly food & dining budget.',
        type: 'BUDGET_ALERT',
        isRead: false,
      },
      {
        userId: demoUser.id,
        title: 'Upcoming Bill Reminder',
        message: 'Netflix subscription (₱549.00) is scheduled in 4 days.',
        type: 'RECURRING_DUE',
        isRead: false,
      },
      {
        userId: demoUser.id,
        title: 'Smart Spending Insight',
        message: 'Great job! Your savings rate this month is currently 38%, which is 5% higher than last month.',
        type: 'INSIGHT',
        isRead: true,
      }
    ]
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
