import { Router } from "express";
import { generateInstallerAvailabilitiesHandler, createAvailabilityHandler, listAvailabilitiesHandler, occupyAvailabilityHandler, updateAvailabilityHandler, findAvailableInstallersHandler } from "../controllers/installerAvailabilityController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const installerAvailabilityRouter = Router();

installerAvailabilityRouter.get("/", findAvailableInstallersHandler);
installerAvailabilityRouter.get("/:installerId", listAvailabilitiesHandler);
installerAvailabilityRouter.post("/:id/occupy", occupyAvailabilityHandler);

installerAvailabilityRouter.use(isAuthenticated);

installerAvailabilityRouter.post("/", createAvailabilityHandler);
installerAvailabilityRouter.put("/:id", updateAvailabilityHandler);
installerAvailabilityRouter.post("/generate", generateInstallerAvailabilitiesHandler);

export default installerAvailabilityRouter;