import { Response } from "express";
import { uploadAgentDocument } from "../services/uploadService.js";
import { userRequest } from "../types/express";
import { PrismaClient } from "@prisma/client";
import { getPrompt, upsertPrompt } from "../services/agentService.js";
import { error } from "console";

const prisma = new PrismaClient();

export async function uploadAgentDocumentHandler(req: userRequest, res: Response) {
    try {
        const file = req.file;

        const { fileUrl, extractedText, documentId, skipped } = await uploadAgentDocument(file!);
        res.status(200).json({ message: skipped ? "Documento ignorado por similaridade" : "Documento enviado com sucesso!", documentId, fileUrl});
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
}

export async function upsertPromptHandler(req: userRequest, res: Response) {
    try {
        const {systemPrompt} = req.body;

        const prompt = await upsertPrompt(systemPrompt);
        res.status(200).json({ message: "Prompt salvo com sucesso!", prompt });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function getPromptHandler(req: userRequest, res: Response) {
    try {
        const prompt = await getPrompt();

        if (!prompt) {
            res.status(404).json({ error: "Prompt não encontrado!" });
        }

        res.status(200).json(prompt);
    } catch(err:any){
        res.status(500).json({error: err.message});
    }
}