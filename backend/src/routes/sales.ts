import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (_req, res) => {
  const sales = await prisma.sale.findMany({
    orderBy: { createdAt: "asc" },
  });
  res.json({ sales });
});

router.post("/", async (req, res) => {
  const userId = req.user!.sub;
  const shopId = req.user?.shopId;
  const { paymentMethod, totalAmount, discount, items } = req.body ?? {};

  if (!shopId) {
    return res.status(400).json({ error: "User is not associated with any shop" });
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "No sale items provided" });
  }

  try {
    const billNo = `BILL-${Date.now().toString().slice(-6)}`;
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the parent Sale header (letting billNo auto-increment natively)
      const sale = await tx.sale.create({
        data: {
          userId,
          shopId,
          billNo,
          totalAmount,
          discount: discount || 0,
          paymentMethod,
          status: "completed",
        },
      });

      const createdSaleItems = [];

      // 2. Process each item in the cart using FIFO deduction
      for (const cartItem of items) {
        let remainingQtyToDeduct = Number(cartItem.quantity);
        const productId = cartItem.productId;

        // Fetch all available stock batches for this product in this shop, oldest first.
        // (Note: You can calculate remaining quantity per stock batch by checking total quantityReceived minus what's already been sold, 
        // or track remaining quantity directly. For simplicity in standard POS, we fetch active batches ordered by acquisition.)
        const availableStocks = await tx.stock.findMany({
          where: {
            productId,
            shopId,
          },
          orderBy: { dateAcquired: "asc" },
        });

        for (const batch of availableStocks) {
          if (remainingQtyToDeduct <= 0) break;

          // Calculate how much has already been sold from this specific batch
          const soldAggregate = await tx.saleItem.aggregate({
            where: { stockId: batch.id },
            _sum: { quantity: true },
          });
          const soldQtyFromBatch = soldAggregate._sum.quantity || 0;
          const batchRemainingQty = Number(batch.quantityReceived) - soldQtyFromBatch;

          if (batchRemainingQty <= 0) continue; // Batch is fully exhausted

          // Determine how much to take from this batch
          const qtyTakenFromBatch = Math.min(remainingQtyToDeduct, batchRemainingQty);

          // Create the sale item linked to this specific stock batch
          const saleItem = await tx.saleItem.create({
            data: {
              saleId: sale.id,
              stockId: batch.id,
              quantity: qtyTakenFromBatch,
              unitPriceSold: cartItem.unitPrice,
            },
          });

          createdSaleItems.push(saleItem);
          remainingQtyToDeduct -= qtyTakenFromBatch;
        }

        // If we ran out of stock entirely across all batches
        if (remainingQtyToDeduct > 0) {
          throw new Error(`Insufficient stock for product ID: ${productId}`);
        }
      }

      return { sale, createdSaleItems };
    });

    return res.status(201).json(result);
  } catch (err: any) {
    console.error("Sale processing error:", err);
    return res.status(500).json({ error: err.message || "Failed to process sale" });
  }
});

export default router;