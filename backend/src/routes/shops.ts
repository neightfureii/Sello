import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (_req, res) => {
  const shops = await prisma.shop.findMany({
    orderBy: { name: "asc" },
  });
  res.json({ shops });
});

router.post(
  "/",
  upload.single("image"),
  requireRole("admin"),
  async (req, res) => {
    const imageUrl = req.file?.path || null;
    const imageCldPubId = req.file?.filename || null;
    const { name, location, type } = req.body ?? {};

    try {
      const newShop = await prisma.shop.create({
        data: {
          name,
          location,
          type,
          imageUrl, // Storing the URL string
          imageCldPubId, // Storing the Cloudinary Public ID for future deletions/updates
        },
      });
      res.status(201).json({ newShop });
    } catch (err) {
      res.status(500).json({ error: "Failed to create new shop" });
    }
  },
);

export default router;
