import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { Prisma } from "../generated/prisma/client.js";
import { upload } from "../middleware/upload.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (_req, res) => {
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
  });
  res.json({ products });
});

router.post(
  "/",
  upload.single("image"),
  requireRole("admin", "manager"),
  async (req, res) => {
    const imageUrl = req.file?.path || null;
    const imageCldPubId = req.file?.filename || null;
    const { name, unitPrice, unit, minStockAllowed, categoryId } =
      req.body ?? {};
    const shopId = (req as any).user?.shopId;
    console.log(shopId);

    if (!shopId) {
      return res
        .status(400)
        .json({ error: "User is not associated with any shop" });
    }

    try {
      const newProduct = await prisma.product.create({
        data: {
          name,
          unitPrice: Number(unitPrice || 0),
          minStockAllowed: Number(minStockAllowed || 0),
          categoryId,
          unit,
          imageUrl, // Storing the URL string
          imageCldPubId, // Storing the Cloudinary Public ID for future deletions/updates
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
