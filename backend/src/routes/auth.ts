import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../db/prisma.js";
import { config } from "../config.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { Prisma, Role, type User } from "@prisma/client";
import { upload } from "../middleware/upload.js";

const router = Router();
const ROLES = Object.values(Role);

const cookieOpts = {
  httpOnly: true,
  sameSite: config.isProd ? ("none" as const) : ("lax" as const),
  secure: config.isProd,
  maxAge: 8 * 60 * 60 * 1000,
};

type UserWithShop = Prisma.UserGetPayload<{
  include: { shop: true };
}>;

const publicUser = (u: UserWithShop) => ({
  id: u.id,
  email: u.email,
  fullName: u.fullName,
  role: u.role,
  imageUrl: u.imageUrl,
  imageCldPubId: u.imageCldPubId,
  shopId: u.shopId,
  shop: u.shop
    ? {
        id: u.shop.id,
        name: u.shop.name,
        location: u.shop.location,
        type: u.shop.type,
        imageUrl: u.shop.imageUrl,
      }
    : null,
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== "string" || typeof password !== "string") {
    res.status(400).json({ error: "Email and password required" });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: { shop: true },
  });
  const ok =
    user &&
    user.isActive &&
    (await bcrypt.compare(password, user.passwordHash));
  if (!user || !ok) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = jwt.sign(
    { sub: user.id, role: user.role, shopId: user.shopId },
    config.jwtSecret,
    {
      expiresIn: "8h",
    },
  );
  res.cookie("token", token, cookieOpts).json({ user: publicUser(user) });
});

router.post("/logout", (_req, res) => {
  res
    .clearCookie("token", { ...cookieOpts, maxAge: undefined })
    .json({ ok: true });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findFirst({
    where: { id: req.user!.sub, isActive: true },
    include: { shop: true },
  });
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  res.json({ user: publicUser(user) });
});

// Admin creates staff accounts
router.post(
  "/users",
  upload.single("image"),
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    const imageUrl = req.file?.path || null;
    const imageCldPubId = req.file?.filename || null;
    const { email, password, fullName, role, shopId } = req.body ?? {};
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      password.length < 8 ||
      typeof fullName !== "string" ||
      !ROLES.includes(role)
    ) {
      res.status(400).json({ error: "Invalid input (password min 8 chars)" });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 12);

    try {
      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash,
          fullName,
          role,
          shopId,
          imageUrl,
          imageCldPubId,
        },
        include: { shop: true },
      });
      res.status(201).json({ user: publicUser(user) });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        res.status(409).json({ error: "Email already exists" });
        return;
      }
      throw err;
    }
  },
);

router.get("/users", requireAuth, async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { fullName: "asc" },
    include: { shop: true },
  });
  res.json({ users });
});

// Update logged-in user's profile (name & image)
router.patch(
  "/profile",
  requireAuth,
  upload.single("image"),
  async (req, res) => {
    const userId = req.user!.sub;
    const imageUrl = req.file?.path || undefined;
    const imageCldPubId = req.file?.filename || undefined;
    const { fullName } = req.body ?? {};

    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(fullName && { fullName }),
          ...(imageUrl && { imageUrl }),
          ...(imageCldPubId && { imageCldPubId }),
        },
        include: { shop: true },
      });

      res.json({ user: publicUser(updatedUser) });
    } catch (err) {
      console.error("Profile update error:", err);
      res.status(500).json({ error: "Failed to update profile" });
    }
  },
);

export default router;
