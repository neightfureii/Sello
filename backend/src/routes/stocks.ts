import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { Prisma } from "../generated/prisma/client.js";
import { upload } from "../middleware/upload.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (_req, res) => {
  const stocks = await prisma.stock.findMany({
    orderBy: { createdAt: "asc" },
  });
  res.json({ stocks });
});

export default router;