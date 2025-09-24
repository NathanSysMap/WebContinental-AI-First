import { Request, Response } from "express";
import { createOrder, getAllOrders, updateOrderStatus, getOrdersByCustomer } from "../services/orderService.js";
import { error } from "console";
import { userRequest } from "../types/express";

export async function createOrderHandler(req: Request, res: Response) {
    try {
        const {cartId, customerId, shippingCost, shippingMethod, deliveryMinDate, shift, installerId, assemblyDate} = req.body;

        const order = await createOrder(cartId, customerId, shippingCost, shippingMethod, deliveryMinDate, shift, installerId, assemblyDate);
        res.status(201).json(order);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
}

export async function updateOrderStatusHandler(req: Request, res: Response) {
    try {
        const id = Number(req.params);
        const { status } = req.body;

        const updatedOrderStatus = await updateOrderStatus(id, status);
        res.status(200).json(updatedOrderStatus);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
}

export async function getAllOrdersHandler(req: userRequest, res: Response) {
    try {
        const orders = await getAllOrders();
        res.status(200).json(orders);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
}

export async function getOrdersByCustomerHandler(req: userRequest, res: Response) {
    const {cpf} = req.params;

    if(!cpf) {
        res.status(400).json({error: "CPF obrigatório!"});
    }

    try {
        const orders = await getOrdersByCustomer(cpf);

        if(!orders || orders.length === 0){
            res.status(404).json({ message: "Não foi encontrado nenhum pedido para esse CPF!"});
        }
        res.status(200).json(orders);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
}
