import { Request, Response } from "express";
import { createInstaller, getInstallerByCPF, updateInstaller, deleteInstaller, getInstallers } from "../services/installerService.js";
import { error } from "console";

export async function createInstallerHandler(req: Request, res: Response) {
    try {
        const installer = await createInstaller(req.body);
        return res.status(201).json(installer);
    } catch(err: any) {
        return res.status(400).json({error: err.message});
    }
}

export async function updateInstallerHandler(req: Request, res: Response) {
    try {
        const updatedInstaller = await updateInstaller(req.params.id, req.body);
        return res.status(200).json(updatedInstaller);
    } catch(err: any) {
        return res.status(400).json({error: err.message});
    }
}

export async function deleteInstallerHandler(req: Request, res: Response) {
    try {
        const installer = await deleteInstaller(req.params.id);
        return res.status(200).json(installer);
    } catch(err: any) {
        return res.status(400).json({error: err.message});
    }
}

export async function getInstallersHandler(req: Request, res: Response) {
    try {
        const installers = await getInstallers();
        return res.status(200).json(installers);
    } catch(err: any) {
        return res.status(400).json({error: err.message});
    }
}

export async function getInstallerByCPFHandler(req: Request, res: Response) {
    const cpf = req.body.cpf;
    try {
        const installer = await getInstallerByCPF(cpf);
        return res.status(200).json(installer);
    } catch(err: any) {
        return res.status(400).json({error: err.message});
    }
}