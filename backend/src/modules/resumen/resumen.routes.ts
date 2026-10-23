import { idParamSchema, resumenDiaQuerySchema } from "@abastos/shared";
import { Router } from "express";
import * as servicio from "./resumen.service.js";

export const resumenRouter = Router();

resumenRouter.get("/dia", async (req, res) => {
  const { fecha } = resumenDiaQuerySchema.parse(req.query);
  res.json(await servicio.resumenDelDia(fecha));
});

resumenRouter.get("/trailers/:id", async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  res.json(await servicio.liquidacionTrailer(id));
});
