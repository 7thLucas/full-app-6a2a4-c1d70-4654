import { Router } from "express";
import {
  listContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  listInteractions,
  createInteraction,
  deleteInteraction,
  listDeals,
  createDeal,
  updateDeal,
  moveDeal,
  deleteDeal,
} from "./crm.controller";

const router = Router();

// Contacts
router.get("/crm/contacts", listContacts);
router.post("/crm/contacts", createContact);
router.get("/crm/contacts/:id", getContact);
router.patch("/crm/contacts/:id", updateContact);
router.delete("/crm/contacts/:id", deleteContact);

// Interactions
router.get("/crm/interactions", listInteractions);
router.post("/crm/interactions", createInteraction);
router.delete("/crm/interactions/:id", deleteInteraction);

// Deals
router.get("/crm/deals", listDeals);
router.post("/crm/deals", createDeal);
router.patch("/crm/deals/:id", updateDeal);
router.post("/crm/deals/:id/move", moveDeal);
router.delete("/crm/deals/:id", deleteDeal);

export default router;
