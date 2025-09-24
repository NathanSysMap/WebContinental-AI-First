import { Request, Response } from "express";
import { createAvailability, updateAvailability, listAvailabilitiesByInstaller, findAvailableInstallers, occupyAvailability, generateInstallerAvailabilities} from "../services/installerAvailabilityService.js";
import { Shift } from "@prisma/client";

export async function createAvailabilityHandler(req: Request, res: Response) {
  try {
    const { installerId, date, shift } = req.body;
    const availability = await createAvailability({
      installerId: installerId,
      date: new Date(date),
      shift: shift as Shift,
    });
    return res.status(201).json(availability);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}

export async function updateAvailabilityHandler(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const availability = await updateAvailability(id, req.body);
    return res.status(200).json(availability);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}

export async function listAvailabilitiesHandler(req: Request, res: Response) {
  try {
    const installerId = req.params.installerId;
    const availabilities = await listAvailabilitiesByInstaller(installerId);
    return res.status(200).json(availabilities);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}

export async function findAvailableInstallersHandler(req: Request, res: Response) {
  try {
    const { city, state, minDate } = req.body;
    const installersAvailables = await findAvailableInstallers(
      String(city),
      String(state),
      new Date(String(minDate))
    );
    return res.status(200).json(installersAvailables);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}

export async function occupyAvailabilityHandler(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const occupiedAvailability = await occupyAvailability(id);
    return res.status(200).json(occupiedAvailability);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}

export async function generateInstallerAvailabilitiesHandler(req: Request, res: Response) {
  try {
    const { installerId, days } = req.body;
    const availability = await generateInstallerAvailabilities(installerId, days);
    return res.status(201).json({message: `Disponibilidades geradas para o instalador ${installerId} para ${days} dias`});
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}