import { Router } from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { createOrderHandler, getAllOrdersHandler, updateOrderStatusHandler, getOrdersByCustomerHandler } from "../controllers/orderController.js";

const orderRouter =  Router();

orderRouter.post("/", createOrderHandler);
orderRouter.get("/customer/:cpf", getOrdersByCustomerHandler);

orderRouter.use(isAuthenticated);
orderRouter.get("/", getAllOrdersHandler);
orderRouter.patch("/:id/status", updateOrderStatusHandler);

export default orderRouter;