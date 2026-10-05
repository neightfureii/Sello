import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const shopId = (req as any).user?.shopId;
  
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    where: { shopId: shopId },
    include: { 
      shop: true, 
      _count: {
        select: { products: true },
      },
    },
  });

  const categoriesWithNoOfProducts = categories.map((category) => {
    const { _count, ...categoryData } = category;
    return {
      ...categoryData,
      noOfProducts: _count?.products || 0,
    };
  });

  res.json({ categories: categoriesWithNoOfProducts });
});

router.post(
  "/",
  upload.single("image"),
  requireRole("admin", "manager"),
  async (req, res) => {
    const imageUrl = req.file?.path || null;
    const imageCldPubId = req.file?.filename || null;
    const { name, description } = req.body ?? {};
    const shopId = (req as any).user?.shopId;

    try {
      const newCategory = await prisma.category.create({
        data: {
          name,
          description,
          shopId,
          imageUrl, // Storing the URL string
          imageCldPubId, // Storing the Cloudinary Public ID for future deletions/updates
        },
      });
      res.status(201).json({ newCategory });
    } catch (err) {
      res.status(500).json({ error: "Failed to create new category" });
    }
  },
);

export default router;
