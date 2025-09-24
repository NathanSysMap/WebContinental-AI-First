import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function register(email: string, password: string, name: string) {
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
        throw new Error('Usuário já existe!');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name
        }
    });

    return user;
}

export async function login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error('Usuário não encontrado!');
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        throw new Error('Senha inválida!');
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

    return { token, user };
}

export async function updateUser(userId: string, data: any) {
    const existing = await prisma.user.findUnique({ where: { id: userId } });

    if(!existing){
        throw new Error("Usuário não encontrado!");
    }

    return await prisma.user.update({
        where: { id: userId },
        data
    });

}