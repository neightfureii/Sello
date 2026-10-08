import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.get("/", requireAuth, async (_req, res) => {
  const shops = await prisma.shop.findMany({
    orderBy: { name: "asc" },
    where: { isActive: true },
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

router.patch(
  "/:id",
  requireAuth,
  requireRole("admin"),
  upload.single("image"),
  async (req, res) => {
    // Ensure shopId is handled as a single string
    const shopId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const imageUrl = req.file?.path;
    const imageCldPubId = req.file?.filename;
    const { name, location, type } = req.body ?? {};

    try {
      const updateData: any = {
        name,
        location,
        type,
      };

      if (imageUrl) {
        updateData.imageUrl = imageUrl;
        updateData.imageCldPubId = imageCldPubId;
      }

      const updatedShop = await prisma.shop.update({
        where: { id: shopId },
        data: updateData,
      });

      res.json({ message: "Shop updated successfully", updatedShop });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update shop" });
    }
  },
);

router.patch(
  "/:id/delete",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    const shopId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    try {
      const updatedShop = await prisma.shop.update({
        where: { id: shopId },
        data: { isActive: false },
      });

      res.json({ message: "Shop updated successfully", updatedShop });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update shop" });
    }
  },
);

export default router;
