import { prisma } from './prisma';
import { hashPassword } from './auth';
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from './constants';

let isSeeded = false;

export async function ensureDefaultAccountsAndCategories() {
  if (isSeeded) return;

  try {
    // 1. Ensure Default Categories
    const allDefaults = [...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES];
    for (const cat of allDefaults) {
      const existing = await prisma.category.findFirst({
        where: { name: cat.name, isDefault: true },
      });
      if (!existing) {
        await prisma.category.create({
          data: {
            name: cat.name,
            icon: cat.icon,
            color: cat.color,
            type: cat.type,
            isDefault: true,
          },
        }).catch(() => {});
      }
    }

    // 2. Ensure Super Admin Account (admin@pennytrack.com)
    const adminEmail = 'admin@pennytrack.com';
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const hashedAdminPassword = await hashPassword('admin123456');
      await prisma.user.create({
        data: {
          name: 'PennyTrack Admin',
          email: adminEmail,
          password: hashedAdminPassword,
          role: 'ADMIN',
          currency: 'PHP',
          avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin',
          theme: 'system',
        },
      }).catch(() => {});
    } else if (existingAdmin.role !== 'ADMIN') {
      await prisma.user.update({
        where: { email: adminEmail },
        data: { role: 'ADMIN' },
      }).catch(() => {});
    }

    // 3. Ensure Japhet's Admin Account (palerjaphet@gmail.com)
    const personalEmail = 'palerjaphet@gmail.com';
    const existingPersonal = await prisma.user.findUnique({
      where: { email: personalEmail },
    });

    if (!existingPersonal) {
      const hashedPersonalPassword = await hashPassword('admin123456');
      await prisma.user.create({
        data: {
          name: 'Japhet Paler',
          email: personalEmail,
          password: hashedPersonalPassword,
          role: 'ADMIN',
          currency: 'PHP',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Japhet',
          theme: 'system',
        },
      }).catch(() => {});
    } else if (existingPersonal.role !== 'ADMIN') {
      await prisma.user.update({
        where: { email: personalEmail },
        data: { role: 'ADMIN' },
      }).catch(() => {});
    }

    // 4. Ensure Demo User (demo@pennytrack.com)
    const demoEmail = 'demo@pennytrack.com';
    const existingDemo = await prisma.user.findUnique({
      where: { email: demoEmail },
    });

    if (!existingDemo) {
      const hashedDemoPassword = await hashPassword('pennytrack123');
      await prisma.user.create({
        data: {
          name: 'Alex Rivera (Demo)',
          email: demoEmail,
          password: hashedDemoPassword,
          role: 'USER',
          currency: 'PHP',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          theme: 'light',
        },
      }).catch(() => {});
    }

    isSeeded = true;
  } catch (err) {
    console.error('ensureDefaultAccountsAndCategories error:', err);
  }
}
