import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { Prisma } from "@prisma/client";
import { upload } from "../middleware/upload.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (_req, res) => {
  const stockRecords = await prisma.stockRecord.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      user: true,
      stocks: {
        include: {
          product: true,
        },
      },
    },
  });
  res.json({ stockRecords });
});

router.post("/", requireRole("admin", "manager"), async (req, res) => {
  const userId = req.user!.sub;
  const shopId = req.user?.shopId;
  const { paymentSource, items } = req.body ?? {};

  if (!shopId) {
    return res
      .status(400)
      .json({ error: "User is not associated with any shop" });
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "No stock items provided" });
  }

  try {
    // Generate a clean human-readable reference number
    const stockReference = `SR-${Date.now().toString().slice(-6)}`;

    // Execute as a single atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      // Step 1: Create 1 StockRecord (The Header)
      const stockRecord = await tx.stockRecord.create({
        data: {
          shopId,
          stockReference,
          paymentSource,
          status: "completed",
          userId,
        },
      });

      // Step 2: Create Multiple Stock Entries (The Line Items)
      const stockPromises = items.map((item: any) =>
        tx.stock.create({
          data: {
            stockRecordId: stockRecord.id, // Links each stock entry to the header
            productId: item.productId,
            shopId, // Ensures shop isolation
            unitCost: Number(item.unitCost || 0),
            quantityReceived: Number(item.quantity || 0),
            mfd: item.mfd ? new Date(item.mfd) : null,
            exp: item.exp ? new Date(item.exp) : null,
          },
        }),
      );

      const createdStocks = await Promise.all(stockPromises);

      return { stockRecord, createdStocks };
    });

    return res.status(201).json(result);
  } catch (err) {
    console.error("Stock record creation error:", err);
    return res
      .status(500)
      .json({ error: "Failed to save stock record entries" });
  }
});

router.patch("/:id/revert", async (req, res) => {
  const shopId = req.user?.shopId;
  const stockRecordId = req.params.id;

  if (!shopId) {
    return res.status(400).json({ error: "User is not associated with any shop" });
  }

  try {
    const updatedStockRecord = await prisma.$transaction(async (tx) => {
      const stockRecord = await tx.stockRecord.findFirst({
        where: { id: stockRecordId, shopId },
      });

      if (!stockRecord) {
        throw new Error("Stock record record not found");
      }

      if (stockRecord.status === "reverted") {
        throw new Error("Stock record is already reverted");
      }

      // Update stockRecord status to reverted
      return await tx.stockRecord.update({
        where: { id: stockRecordId },
        data: { status: "reverted" },
      });
    });

    return res.json({ message: "Stock record reverted successfully", updatedStockRecord });
  } catch (err: any) {
    console.error("Revert stock record error:", err);
    return res.status(500).json({ error: err.message || "Failed to revert stock record" });
  }
});

export default router;
