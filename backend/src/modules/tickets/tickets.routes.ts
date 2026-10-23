import {
  crearTicketSchema,
  idParamSchema,
  listarTicketsQuerySchema,
} from "@abastos/shared";
import { Router } from "express";
import * as servicio from "./tickets.service.js";

export const ticketsRouter = Router();

ticketsRouter.get("/", async (req, res) => {
  const { fecha, estado } = listarTicketsQuerySchema.parse(req.query);
  res.json(await servicio.listarTickets(fecha, estado));
});

ticketsRouter.get("/:id", async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  res.json(await servicio.obtenerTicket(id));
});

ticketsRouter.post("/", async (req, res) => {
  const datos = crearTicketSchema.parse(req.body);
  res.status(201).json(await servicio.crearTicket(datos));
});

ticketsRouter.post("/:id/cancelar", async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  res.json(await servicio.cancelarTicket(id));
});
