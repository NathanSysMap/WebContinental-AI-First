import { Router } from "express";
import { uploadProductImageHandler, createProductHandler, listProductsHandler, getProductHandler, updateProductHandler, deleteProductHandler, generateProductTemplateHandler, importProductsHandler, listProductsByQueryHandler } from "../controllers/productController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";

const productRouter = Router();

productRouter.get("/template", generateProductTemplateHandler);
productRouter.get("/", listProductsHandler);
productRouter.get("/public/:query", listProductsByQueryHandler);
productRouter.get("/:id", getProductHandler);


productRouter.use(isAuthenticated);

productRouter.post("/", createProductHandler);
productRouter.put("/:id", updateProductHandler);
productRouter.delete("/:id", deleteProductHandler);
productRouter.post("/upload-image", isAuthenticated, upload.single("image"), uploadProductImageHandler);
productRouter.post('/import', upload.single('file'), importProductsHandler);

export default productRouter;

