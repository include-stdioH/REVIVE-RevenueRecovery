import { Router, type IRouter } from "express";
import { UpdateGuardrailsBody } from "@workspace/api-zod";
import {
  getAnalytics,
  getAudit,
  getCustomer,
  getCustomers,
  getDashboard,
  getGuardrails,
  getOpportunity,
  getOpportunities,
  getWorkflows,
  runAgent,
  runDemo,
  search,
  updateGuardrails,
} from "../lib/revive";

const router: IRouter = Router();

router.get("/dashboard", (_req, res) => res.json(getDashboard()));
router.get("/opportunities", (_req, res) => res.json(getOpportunities()));
router.get("/opportunities/:id", (req, res) => {
  const item = getOpportunity(req.params.id);
  if (!item) return res.status(404).json({ error: "Opportunity not found" });
  return res.json(item);
});
router.get("/customers", (_req, res) => res.json(getCustomers()));
router.get("/customers/:id", (req, res) => {
  const item = getCustomer(req.params.id);
  if (!item) return res.status(404).json({ error: "Customer not found" });
  return res.json(item);
});
router.get("/workflows", (_req, res) => res.json(getWorkflows()));
router.get("/audit", (_req, res) => res.json(getAudit()));
router.get("/analytics", (_req, res) => res.json(getAnalytics()));
router.get("/guardrails", (_req, res) => res.json(getGuardrails()));
router.put("/guardrails", (req, res) => {
  const parsed = UpdateGuardrailsBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid guardrail values" });
  return res.json(updateGuardrails(parsed.data));
});
router.get("/search", (req, res) => res.json(search(String(req.query.q ?? ""))));
router.post("/agent/run/:opportunityId", (req, res) => {
  const result = runAgent(req.params.opportunityId);
  if (!result) return res.status(404).json({ error: "Opportunity not found" });
  return res.json(result);
});
router.post("/demo/:scenario", (req, res) => res.json(runDemo(req.params.scenario)));

export default router;