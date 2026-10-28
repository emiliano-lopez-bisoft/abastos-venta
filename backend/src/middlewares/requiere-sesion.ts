import { RequestHandler } from "express";
import {
  COOKIE_SESION,
  opcionesCookie,
  validarSesion,
} from "../modules/auth/sesiones.js";

export const requiereSesion: RequestHandler = async (req, res, next) => {
  const token: unknown = req.cookies?.[COOKIE_SESION];
  if (typeof token !== "string" || !token) {
    res.status(401).json({ mensaje: "Inicia sesión para continuar" });
    return;
  }

  const sesion = await validarSesion(token);
  if (!sesion) {
    res.clearCookie(COOKIE_SESION, opcionesCookie);
    res.status(401).json({ mensaje: "Tu sesión expiró, vuelve a entrar" });
    return;
  }

  if (sesion.renovada) {
    res.cookie(COOKIE_SESION, token, {
      ...opcionesCookie,
      expires: sesion.expiraEn,
    });
  }
  res.locals.usuario = sesion.usuario;
  next();
};
