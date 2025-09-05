import express from "express";
import { saveTenant } from "../controllers/tenantController.js";

const tenantRouter = express.Router();

// tenantRouter.get("/tenant",);
// tenantRouter.get("/tenant:/id",);
tenantRouter.post("/tenant", saveTenant);

export default tenantRouter;
