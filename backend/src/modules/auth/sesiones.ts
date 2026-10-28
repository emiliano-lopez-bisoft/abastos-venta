import { CookieOptions } from "express";
import { env } from "../../config/env.js";
import { createHash, randomBytes } from "crypto";
import { prisma } from "../../lib/prisma.js";

export const COOKIE_SESION = "sesion";

const DIA_MS = 24 * 60 * 60 * 1000;
const DURACION_MS = 30 * DIA_MS;

const RENOVAR_SI_QUEDAN_MS = 15 * DIA_MS;

export const opcionesCookie: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
};

const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

export async function crearSesion(usuarioId: number) {
  await prisma.sesion.deleteMany({ where: { expiraEn: { lt: new Date() } } });

  const token = randomBytes(32).toString("base64url");
  const expiraEn = new Date(Date.now() + DURACION_MS);
  await prisma.sesion.create({
    data: { tokenHash: hashToken(token), usuarioId, expiraEn },
  });
  return { token, expiraEn };
}

export async function validarSesion(token: string) {
  const sesion = await prisma.sesion.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { usuario: { select: { id: true, usuario: true } } },
  });
  if (!sesion) return null;

  const restante = sesion.expiraEn.getTime() - Date.now();
  if (restante <= 0) {
    await prisma.sesion.deleteMany({ where: { id: sesion.id } });
    return null;
  }

  if (restante < RENOVAR_SI_QUEDAN_MS) {
    const expiraEn = new Date(Date.now() + DURACION_MS);
    await prisma.sesion.update({
      where: { id: sesion.id },
      data: { expiraEn },
    });
    return { usuario: sesion.usuario, expiraEn, renovada: true };
  }

  return {
    usuario: sesion.usuario,
    expiraEn: sesion.expiraEn,
    renovada: false,
  };
}

export async function eliminarSesion(token: string) {
  await prisma.sesion.deleteMany({ where: { tokenHash: hashToken(token) } });
}
