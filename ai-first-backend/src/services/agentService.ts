import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function upsertPrompt(systemPrompt: string) {
    const existing = await prisma.agentPrompt.findFirst();

    if (existing) {
        return prisma.agentPrompt.update({
            where: { id: existing.id },
            data: { systemPrompt }
        });
    }

    return prisma.agentPrompt.create({
        data: { systemPrompt }
    });

}

export async function getPrompt() {
    return prisma.agentPrompt.findFirst();
}


