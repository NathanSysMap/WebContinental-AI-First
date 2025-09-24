import { PrismaClient } from "@prisma/client";
import { parse } from 'csv-parse/sync';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();

export async function createProduct(data: any, userId: string) {
    const product = await prisma.product.create({
        data: {
            name: data.name,
            description: data.description,
            price: data.price,
            weight: data.weight,
            height: data.height,
            width: data.width,
            length: data.length,
            brand: data.brand,
            model: data.model,
            voltage: data.voltage,
            category: data.category,
            subcategory: data.subcategory,
            imageUrl: data.imageUrl,
            stock: data.stock,
            active: data.active ?? true,
            tags: data.tags,
            userId
        }
    });

    await createProductHistory(product, "CREATE", userId);

    return product;
}

export async function getAllProducts() {
    return await prisma.product.findMany();
}

export async function getProductByQuery(query: string) {
    if(!query || query.trim() === "") {
        return await prisma.product.findMany({
            where: {active: true}
        });
    }

    const terms = query.toLowerCase().split(' ').filter(Boolean);

    return await prisma.product.findMany({
        where: {
            active: true,
            OR: terms.map(term => ({
                OR: [
                    {
                        name: {contains: term, mode: 'insensitive'}
                    },
                    {
                        description: {contains: term, mode: 'insensitive'}
                    },
                    {
                        category: {contains: term, mode: 'insensitive'}
                    },
                    {
                        subcategory: {contains: term, mode: 'insensitive'}
                    },
                    {
                        tags: {hasSome: [term]}
                    },
                ]
            })),
        },
    });
}

export async function getProductById(id: number) {
    return await prisma.product.findUnique({ where: { id } });
}

export async function updateProduct(id: number, data: any, userId: string) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if(!existing) throw new Error("Produto não encontrado!");

    await createProductHistory(existing, "UPDATE", userId);

    const updated = await prisma.product.update({
        where: { id },
        data
    });

    return updated;
}

export async function deleteProduct(id: number, userId: string) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if(!existing) throw new Error("Produto não encontrado!");

    await createProductHistory(existing, "DELETE", userId);

    const updated = await prisma.product.update({
        where: { id },
        data: {
            active: false,
        }
    });

    return updated;
}

export async function createProductHistory(productData: any, action: "CREATE" | "UPDATE" | "DELETE", changedBy: string) {
    await prisma.productHistory.create({
        data: {
            productId: productData.id,
            name: productData.name,
            description: productData.description,
            price: productData.price,
            weight: productData.weight,
            height: productData.height,
            width: productData.width,
            length: productData.length,
            brand: productData.brand,
            model: productData.model,
            ean: productData.ean,
            voltage: productData.voltage,
            category: productData.category,
            subcategory: productData.subcategory,
            imageUrl: productData.imageUrl,
            stock: productData.stock,
            active: productData.active ?? true,
            tags: productData.tags,
            action,
            changedBy
        },
    });
}

export function generateProductTemplate(): Buffer {
    const headers = [{
        name: 'Ex: Bicicleta Ergomética Gallant Trainer Vertical até 100KG (GBE1HBTA-PT)',
        description: 'Ex: Bicicleta ergomética vertical modelo GBE1HBTA-PT.',
        price: 429.3,
        weight: 10.1,
        height: 42,
        width: 20.5,
        length: 59,
        brand: "Gallant",
        model: "GBE1HBTA-PT",
        voltage: "Não possui",
        category: 'Bicicleta',
        subcategory: 'Ergométrica',
        imageUrl: 'https://exemplo.com/imagem.jpg',
        stock: 50,
        active: true,
        tags: 'fitness,cardio,bike'
    }];

    const worksheet = XLSX.utils.json_to_sheet(headers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Produtos');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

export async function importProducts(fileBuffer: Buffer, fileName: string, userId: string) {
    let rows: any[] = [];

    if (fileName.endsWith('.xlsx')) {
        const workbook = XLSX.read(fileBuffer);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        rows = XLSX.utils.sheet_to_json(sheet);
    } else if (fileName.endsWith('.csv')) {
        rows = parse(fileBuffer, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        });
    } else {
        throw new Error('Formato de arquivo não suportado! Envie um document .csv ou .xlsx');
    }

    const results: { name: string; status: string; error?: string }[] = [];

    for (const row of rows) {
        try {
            await prisma.product.create({
                data: {
                    name: row.name,
                    description: row.description,
                    price: parseFloat(row.price),
                    weight: parseFloat(row.weight),
                    height: parseFloat(row.height),
                    width: parseFloat(row.width),
                    length: parseFloat(row.length),
                    brand: row.brand,
                    model: row.model,
                    voltage: row.voltage,
                    category: row.category,
                    subcategory: row.subcategory,
                    imageUrl: row.imageUrl,
                    stock: parseInt(row.stock ?? 0),
                    active: row.active ?? true,
                    tags: typeof row.tags === 'string' ? row.tags.split(',').map((t: string) => t.trim()):[],
                    userId
                }
            });

            results.push({ name: row.name, status: 'importado'});
        } catch(err: any) {
            results.push({ name: row.name, status: 'erro', error: err.message});
        }
    }
    return results;
}