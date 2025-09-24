import { Router } from "express";
import { createInstallerHandler, updateInstallerHandler, deleteInstallerHandler, getInstallerByCPFHandler, getInstallersHandler } from "../controllers/installerController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const installerRouter = Router();

installerRouter.get("/", getInstallersHandler);
installerRouter.get("/:cpf", getInstallerByCPFHandler);

installerRouter.use(isAuthenticated);

installerRouter.post("/", createInstallerHandler);
installerRouter.put("/:id", updateInstallerHandler);
installerRouter.delete("/:id", deleteInstallerHandler);

export default installerRouter;