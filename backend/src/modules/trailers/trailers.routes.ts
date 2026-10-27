import {
  actualizarManifiestoLineaSchema,
  actualizarTrailerSchema,
  crearTrailerSchema,
  idParamSchema,
  listarCerradosQuerySchema,
  listarTrailersQuerySchema,
  manifiestoLineaParamsSchema,
  manifiestoLineaSchema,
} from "@abastos/shared";
import { Router } from "express";
import * as servicio from "./trailers.service.js";

// Express 5 manda al errorHandler los errores de funciones async,
// incluidos los ZodError de .parse() (responden 400 con el detalle por campo).
export const trailersRouter = Router();

trailersRouter.get("/", async (req, res) => {
  const { estado } = listarTrailersQuerySchema.parse(req.query);
  res.json(await servicio.listarTrailers(estado));
});

// Va antes de '/:id' para que "cerrados" no se tome como un id.
trailersRouter.get("/cerrados", async (req, res) => {
  const { q, desde } = listarCerradosQuerySchema.parse(req.query);
  res.json(await servicio.listarCerrados(q, desde));
});

trailersRouter.get("/:id", async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  res.json(await servicio.obtenerTrailer(id));
});

trailersRouter.post("/", async (req, res) => {
  const datos = crearTrailerSchema.parse(req.body);
  res.status(201).json(await servicio.crearTrailer(datos));
});

trailersRouter.patch("/:id", async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const datos = actualizarTrailerSchema.parse(req.body);
  res.json(await servicio.actualizarTrailer(id, datos));
});

trailersRouter.post("/:id/cerrar", async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  res.json(await servicio.cambiarEstado(id, "CERRADO"));
});

trailersRouter.post("/:id/reabrir", async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  res.json(await servicio.cambiarEstado(id, "ACTIVO"));
});

trailersRouter.post("/:id/manifiesto", async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const linea = manifiestoLineaSchema.parse(req.body);
  res.status(201).json(await servicio.agregarLinea(id, linea));
});

trailersRouter.patch("/:id/manifiesto/:lineaId", async (req, res) => {
  const { id, lineaId } = manifiestoLineaParamsSchema.parse(req.params);
  const datos = actualizarManifiestoLineaSchema.parse(req.body);
  res.json(await servicio.actualizarLinea(id, lineaId, datos));
});

trailersRouter.delete("/:id/manifiesto/:lineaId", async (req, res) => {
  const { id, lineaId } = manifiestoLineaParamsSchema.parse(req.params);
  res.json(await servicio.eliminarLinea(id, lineaId));
});
