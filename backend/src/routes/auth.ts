import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../db/prisma.js";
import { config } from "../config.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { Prisma, Role, type User } from "../generated/prisma/client.js";

const router = Router();
const ROLES = Object.values(Role);

const cookieOpts = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: config.isProd,
  maxAge: 8 * 60 * 60 * 1000,
};

const publicUser = (u: User) => ({
  id: u.id,
  email: u.email,
  fullName: u.fullName,
  role: u.role,
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== "string" || typeof password !== "string") {
    res.status(400).json({ error: "Email and password required" });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
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
  });
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  res.json({ user: publicUser(user) });
});

// Admin creates staff accounts
router.post("/users", requireAuth, requireRole("admin"), async (req, res) => {
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
      },
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
});

export default router;
