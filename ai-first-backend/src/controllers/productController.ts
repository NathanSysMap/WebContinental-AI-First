import { Request, Response, RequestHandler } from "express";
import { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct, generateProductTemplate, importProducts, getProductByQuery } from "../services/productService.js";
import { uploadImage } from "../services/uploadService.js";
import { error } from "console";
import { userRequest } from "../types/express/index.js";


export async function createProductHandler(req: Request, res: Response) {
    try {
        const userId = (req as any).user?.id;
        const product = await createProduct(req.body, userId);
        res.status(201).json(product);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
}

export async function listProductsHandler(req: Request, res: Response) {
    try {
        const products = await getAllProducts();
        res.status(200).json(products);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export async function listProductsByQueryHandler(req:Request, res: Response) {
    const query = req.params.query ?? "";

    try {
        const filteredProducts = await getProductByQuery(query);
        res.status(200).json(filteredProducts);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
}

export async function getProductHandler(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        const product = await getProductById(id);
        if (!product) {
            res.status(404).json({ error: "Produto não encontrado!" });
        }
        res.status(200).json(product);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function updateProductHandler(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        const userId = (req as any).user?.id;

        const product = await updateProduct(id, req.body, userId);
        if (!product) {
            res.status(404).json({ error: "Produto não encontrado!" });
        }
        res.status(200).json(product);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
}

export async function deleteProductHandler(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        const userId = (req as any).user?.id;

        const product = await deleteProduct(id, userId);
        if (!product) {
           res.status(404).json({ error: "Produto não encontrado!" });
        }
        res.status(204).end();
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
}


export async function uploadProductImageHandler(req: Request, res: Response) {
    try {
        if (!req.file) {
            res.status(400).json({ error: "Arquivo não enviado" });
        }
        const imageUrl = await uploadImage(req.file!, "product-images");
        res.status(200).json({ imageUrl });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
}

export function generateProductTemplateHandler(req: Request, res: Response) {
    try {
        const buffer = generateProductTemplate();

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.attachment('modelo_produtos.xlsx');

        res.send(buffer);
    } catch(err:any) {
        console.error('Erro ao gerar planilha: ', err);
        res.status(500).json({error: 'Erro ao gerar a planilha.'});
    }
}

export async function importProductsHandler(req: userRequest, res: Response) {
    const file = req.file;
    const userId = req.user!.id;

    if (!file) {
        res.status(400).json({ error: 'Arquivo não anexado!' });
    }

    try {
        const result = await importProducts(file!.buffer, file!.originalname, userId);
        res.json({ message: 'Importação realizada com sucesso! ', result });
    } catch (err: any) {
        res.status(500).json({ error: 'Falha na importação! ', detail: err.message });
    }
}


