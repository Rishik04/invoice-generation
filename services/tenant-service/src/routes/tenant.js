import express from "express";
import { getTenanyBySlug, saveTenant } from "../controllers/tenantController.js";

const tenantRouter = express.Router();

// tenantRouter.get("/tenant:/id",);
tenantRouter.get("/tenant/:slug",getTenanyBySlug);
tenantRouter.post("/tenant", saveTenant);

export default tenantRouter;
