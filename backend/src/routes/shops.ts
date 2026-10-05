import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.get("/", requireAuth, async (_req, res) => {
  const shops = await prisma.shop.findMany({
    orderBy: { name: "asc" },
  });
  res.json({ shops });
});

router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  upload.single("image"),
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
          imageUrl,
          imageCldPubId,
        },
      });
      res.status(201).json({ newShop });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create new shop" });
    }
  },
);

export default router;