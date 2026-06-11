import { Router } from "express";
// Import global routes (module auto-discovery)
import moduleRoutes from "./routes";
import { initializeModels } from "./models";

// CRM domain (explicitly registered, lives under app/api/crm)
import crmRoutes from "./crm/crm.routes";
import "./crm/contact.model";
import "./crm/interaction.model";
import "./crm/deal.model";

// Initialize auto-discovered models
await initializeModels();

const router = Router();
router.use(moduleRoutes);
router.use(crmRoutes);

export default router;
