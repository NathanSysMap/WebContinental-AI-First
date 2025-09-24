import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createInstaller(data: any) {
    const existing = await prisma.installer.findUnique({
        where: { cpf: data.cpf },
    });

    if (existing) {
        throw new Error("Profissional já existente!");
    }

    const installer = await prisma.installer.create({
        data: {
            name: data.name,
            cpf: data.cpf,
            phone: data.phone,
            email: data.email,
            city: data.city,
            state: data.state
        }
    });

    return installer;
}

export async function updateInstaller(id: string, data: any) {
    const existing = await prisma.installer.findUnique({
        where: {id},
    });

    if (!existing) {
        throw new Error("Profissional não encontrado!");
    }

    return prisma.installer.update({
        where: {id},
        data,
    })
}

export async function deleteInstaller(id: string) {
    const existing = await prisma.installer.findUnique({
        where: {id},
    });

    if (!existing) {
        throw new Error("Profissional não encontrado!");
    }

    return prisma.installer.update({
        where: {id},
        data: {active: false},
    })
}

export async function getInstallerByCPF(cpf: string) {
    const installer = await prisma.installer.findUnique({
        where: { cpf },
        include: { availability: true }
    });

    if (!installer) {
        throw new Error("Profissional não encontrado!");
    }

    return installer;
}

export async function getInstallers() {
    return prisma.installer.findMany({
        where: {active: true},
        include: {availability: true},
        orderBy: {name: "asc"}
    })
}