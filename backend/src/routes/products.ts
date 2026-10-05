import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const shopId = (req as any).user?.shopId;
  
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
    where: { shopId: shopId },
    include: { 
      category: true, 
      shop: true,
      stocks: {
        include: {
          saleItems: true, // Includes sales linked to each stock batch for FIFO calculation
        }
      }
    },
  });

  // Calculate available quantity dynamically for each product
  const productsWithStock = products.map((product) => {
    const totalReceived = product.stocks.reduce(
      (sum, stock) => sum + Number(stock.quantityReceived), 
      0
    );

    const totalSold = product.stocks.reduce((sum, stock) => {
      const soldInBatch = stock.saleItems.reduce(
        (itemSum, item) => itemSum + Number(item.quantity), 
        0
      );
      return sum + soldInBatch;
    }, 0);

    const availableQty = Math.max(0, totalReceived - totalSold);

    // Remove raw stock relation array from response payload if unneeded, keeping availableQty
    const { stocks, ...productData } = product;
    return {
      ...productData,
      availableQty,
    };
  });

  res.json({ products: productsWithStock });
});

router.post(
  "/",
  upload.single("image"),
  requireRole("admin", "manager"),
  async (req, res) => {
    const imageUrl = req.file?.path || null;
    const imageCldPubId = req.file?.filename || null;
    const { name, unitPrice, unit, minStockAllowed, categoryId } = req.body ?? {};
    const shopId = (req as any).user?.shopId;

    if (!shopId) {
      return res.status(400).json({ error: "User is not associated with any shop" });
    }

    try {
      const newProduct = await prisma.product.create({
        data: {
          name,
          unitPrice: Number(unitPrice || 0),
          minStockAllowed: Number(minStockAllowed || 0),
          categoryId,
          unit,
          imageUrl,
          imageCldPubId,
          shopId,
        },
      });
      res.status(201).json({ newProduct });
    } catch (err) {
      res.status(500).json({ error: "Failed to create new product" });
    }
  },
);

export default router;