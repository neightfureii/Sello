import { Router } from 'express';
import { prisma } from '../db/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { Prisma } from '../generated/prisma/client.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (_req, res) => {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });
  res.json({ products });
});

router.post('/', requireRole('admin', 'manager'), async (req, res) => {
  const { sku, name, price, stockQty = 0, reorderLevel = 0 } = req.body ?? {};
  if (
    typeof sku !== 'string' ||
    typeof name !== 'string' ||
    !(typeof price === 'number' || typeof price === 'string') ||
    !(Number(price) >= 0) ||
    !Number.isInteger(stockQty) ||
    !Number.isInteger(reorderLevel)
  ) {
    res.status(400).json({ error: 'sku, name, a valid price and integer quantities are required' });
    return;
  }
  try {
    const product = await prisma.product.create({
      data: { sku, name, price: String(price), stockQty, reorderLevel },
    });
    res.status(201).json({ product });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      res.status(409).json({ error: 'SKU already exists' });
      return;
    }
    throw err;
  }
});

export default router;