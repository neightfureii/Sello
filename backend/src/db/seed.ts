import bcrypt from 'bcryptjs';
import { prisma } from './prisma.js';
import { required } from '../config.js';
import crypto from 'crypto';

const email = required('ADMIN_EMAIL').toLowerCase();
const passwordHash = await bcrypt.hash(required('ADMIN_PASSWORD'), 12);

await prisma.user.upsert({
  where: { email },
  update: {},
  create: { 
    id: crypto.randomUUID(),
    email, 
    passwordHash, 
    fullName: 'Amantha', 
    role: 'admin', 
    isActive: true 
  },
});

console.log('Admin user ready:', email);
await prisma.$disconnect();