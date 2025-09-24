import { PrismaClient } from "@prisma/client";
import cartRouter from "../routes/cartRoutes";

const prisma = new PrismaClient();

export async function upsertCart(
    customerPhone: string,
    items: { productId: number; quantity: number }[]
) {
    const existingCart = await prisma.cart.findFirst({
        where: {
            customerPhone,
            status: "ATIVO",
        },
        include: { items: true },
    });

    const products = await prisma.product.findMany({
        where: { id: { in: items.map((i) => i.productId) } },
    });

    if (products.length !== items.length) {
        const foundIds = products.map((p) => p.id);
        const notFound = items.filter((i) => !foundIds.includes(i.productId));
        throw new Error(`Produtos não encontrados: ${ notFound.map((i) => i.productId).join(", ") }`);
    }

    if (existingCart) {
        for (const item of items) {
            const product = products.find((p) => p.id === item.productId)!;
            const existingItem = existingCart.items.find(
                (i) => i.productId === item.productId
            );

            if (existingItem) {
                await prisma.cartItem.update({
                    where: { id: existingItem.id },
                    data: { quantity: existingItem.quantity + item.quantity },
                });
            } else {
                await prisma.cartItem.create({
                    data: {
                        cartId: existingCart.id,
                        productId: item.productId,
                        quantity: item.quantity,
                        name: product.name,
                        unitPrice: product.price,
                    },
                });
            }
        }

        return await prisma.cart.findUnique({
            where: { id: existingCart.id },
            include: { items: true },
        });
    }


    const cart = await prisma.cart.create({
        data: {
            customerPhone,
            status: "ATIVO",
            items: {
                create: items.map((item) => {
                    const product = products.find((p) => p.id === item.productId)!;
                    return {
                        productId: item.productId,
                        quantity: item.quantity,
                        name: product.name,
                        unitPrice: product.price,
                    };
                }),
            },
        },
        include: { items: true },
    });

    return cart;
}

export async function removeItemFromCart(cartId: number, productId: number) {
    const cartItem = await prisma.cartItem.findFirst({
        where: { cartId, productId },
    });

    if (!cartItem) {
        throw new Error("Item não encontrado!");
    }

    await prisma.cartItem.delete({
        where: { id: cartItem.id },
    });

    return { message: "Item removido do carrinho." };
}

export async function getCart(customerPhone: string) {
    const cart = await prisma.cart.findFirst({
        where: {
            customerPhone,
            status: "ATIVO",
        },
        include: { items: true },
    });

    if (!cart) {
        throw new Error("Carrinho não encontrado!");
    }

    const total = cart.items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

    return {...cart, total};
}

export async function getCartDimensions(cartId: number) {
    //console.log("id recebido: ", cartId);
    const dimensionsCart = await prisma.cart.findUnique({
        where: { id: cartId },
        include: {
            items: {
                include: {
                    product: true,
                },
            },
        },
    });

    console.log("Carrinho encontrado: ", dimensionsCart);

    if (!dimensionsCart) {
        throw new Error("Carrinho não encontrado!");
    }
    

    let totalWeight = 0;
    let totalHeight = 0;
    let maxWidth = 0;
    let maxLength = 0;

    for(const i of dimensionsCart.items){
        const {weight, height, width, length} = i.product;

        if(!height || !width || !length || !weight){
            throw new Error(`Produto ${i.productId} não possui todas as dimensões cadastradas!`);
        }

        
        totalWeight += weight * i.quantity;
        totalHeight += height * i.quantity;

        if(width > maxWidth) maxWidth = width;
        if(length > maxLength) maxLength = length;
    }

    console.log(totalWeight, totalHeight, maxWidth, maxLength);

    return {
        /*totalWeight: Number(totalWeight.toFixed(2)),
        cartHeight: Math.ceil(totalHeight),
        cartWidth: Math.ceil(maxWidth),
        cartLength: Math.ceil(maxLength),*/

        totalWeight: 1,
        cartHeight: 4,
        cartWidth: 12,
        cartLength: 17,
    };

}

const MELHOR_ENVIO_TOKEN = process.env.MELHOR_ENVIO_TOKEN as string;
const ORIGIN_ZIP_CODE = process.env.ORIGIN_ZIP_CODE as string;

export async function calcShippingCart(cartId: number, destinyZipCode: string) {
    const cart = await prisma.cart.findUnique({
        where: { id: cartId },
        include: { items: true },
    });

    if (!cart) {
        throw new Error("Carrinho não encontrado!");
    }

    const dimensions = await getCartDimensions(cartId);

    const params = {
        from: {
            postal_code: ORIGIN_ZIP_CODE,
        },
        to: {
            postal_code: destinyZipCode,
        },
        package: {
            height: dimensions.cartHeight,
            width: dimensions.cartWidth,
            length: dimensions.cartLength,
            weight: dimensions.totalWeight,
        },
    };

    const response = await fetch('https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${MELHOR_ENVIO_TOKEN}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'User-Agent': 'AIFIRST contato.nathanlima@hotmail.com'
        },
        body: JSON.stringify(params),
    });

    if (!response.ok) {
        const errorResponse = await response.json();
        console.error(errorResponse);
        throw new Error(`Erro na API do MelhorEnvio: ${response.statusText}`);
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
        throw new Error("Nenhuma opção de frete encontrada!");
    }


    console.log("Opções recebidas: ", data);
    const sedex = data.find((opt: any) => opt.name.toUpperCase().includes("SEDEX") && opt.price != null);

    /*const shippingOptions = data.filter((option: any) => option.price != null && option.delivery_time != null)
    .map((option: any) => ({
        shippingMethod: option.name.replace(/[\s.]/g, '').toUpperCase(),
        exhibitionName: `${option.company.name} - ${option.name}`,
        shippingPrice: Number(option.price),
        deliveryTime: Number(option.delivery_time),
        shippingCompany: option.company.name,
        service: option.name,
    }));*/

    return {
        shippingMethod: sedex.name.replace(/[\s.]/g, '').toUpperCase(),
        exhibitionName: `${sedex.company.name} - ${sedex.name}`,
        shippingPrice: Number(sedex.price),
        deliveryTime: Number(sedex.delivery_time),
        dilveryMinDate: new Date(Date.now() + Number(sedex.delivery_time) * 24 * 60 * 60 * 1000),
        shippingCompany: sedex.company.name,
        service: sedex.name
    };
}

export async function deleteCart(customerPhone:string) {
    const selectedCart = await prisma.cart.findFirst({
        where: {customerPhone, status: "ATIVO"},
    });

    if(selectedCart) {
        await prisma.cartItem.deleteMany({where: {cartId: selectedCart.id}});
        await prisma.cart.delete({where: {id: selectedCart.id}});
    }

    return {message: "Carrinho excluído com sucesso!"};
}

export async function decreaseItemQuantity(cartId: number, productId: number, quantity: number) {
    const item = await prisma.cartItem.findFirst({
        where: { cartId, productId }
    });
    
    if(!item) {
        throw new Error("O produto informado não foi encontrado no carrinho!");
    }

    if(quantity <= 0) {
        throw new Error("Quantidade inválida informada!");
    }

    if(item.quantity <= quantity) {
        await prisma.cartItem.delete({
            where: { id: cartId }
        });

        return {message: `Item de id: ${productId} foi completamente removido do carrinho.`};
    }

    const updatedItem = await prisma.cartItem.update({
        where: { id: item.id },
        data: {
            quantity: item.quantity - quantity
        }
    });

    return updatedItem;
}