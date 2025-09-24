import { Router } from "express";
import { upsertCartHandler, getCartHandler, removeItemFromCartHandler, calcShippingCartHandler, deleteCarteHandler, decreaseItemQuantityHandler } from "../controllers/cartController.js";

const cartRouter = Router();

cartRouter.post('/', upsertCartHandler);
cartRouter.get('/:customerPhone', getCartHandler);
cartRouter.delete('/:id/item/:productId', removeItemFromCartHandler);
cartRouter.post('/:id/shipping', calcShippingCartHandler);
cartRouter.delete('/delete-cart', deleteCarteHandler);
cartRouter.put('/:id/decrease', decreaseItemQuantityHandler);

export default cartRouter;