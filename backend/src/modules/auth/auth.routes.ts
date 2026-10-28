import { randomBytes } from "node:crypto";
import { loginSchema, type SesionUsuario } from "@abastos/shared";
import argon2 from "argon2";
import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middlewares/error-handler.js";
import { requiereSesion } from "../../middlewares/requiere-sesion.js";
import {
  COOKIE_SESION,
  crearSesion,
  eliminarSesion,
  opcionesCookie,
} from "./sesiones.js";

export const authRouter = Router();

/** 10 intentos fallidos por IP cada 15 minutos */
const limiteLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    mensaje: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.",
  },
});

/** Hash de relleno: si el usuario no existe se verifica igual, para que la
 * respuesta tarde lo mismo y no se pueda adivinar qué usuarios existen. */
let hashRelleno: Promise<string> | undefined;
const obtenerHashRelleno = () =>
  (hashRelleno ??= argon2.hash(randomBytes(16).toString("hex")));

authRouter.post("/login", limiteLogin, async (req, res) => {
  const { usuario, contrasena } = loginSchema.parse(req.body);

  const encontrado = await prisma.usuario.findUnique({ where: { usuario } });
  const hash = encontrado?.hashContrasena ?? (await obtenerHashRelleno());
  const valida = await argon2.verify(hash, contrasena);

  if (!encontrado || !valida) {
    throw new AppError(401, "Usuario o contraseña incorrectos");
  }

  const { token, expiraEn } = await crearSesion(encontrado.id);
  res.cookie(COOKIE_SESION, token, { ...opcionesCookie, expires: expiraEn });
  res.json({ usuario: encontrado.usuario } satisfies SesionUsuario);
});

authRouter.post("/logout", async (req, res) => {
  const token: unknown = req.cookies?.[COOKIE_SESION];
  if (typeof token === "string" && token) await eliminarSesion(token);
  res.clearCookie(COOKIE_SESION, opcionesCookie);
  res.status(204).end();
});

authRouter.get("/yo", requiereSesion, (_req, res) => {
  res.json({ usuario: res.locals.usuario.usuario } satisfies SesionUsuario);
});
