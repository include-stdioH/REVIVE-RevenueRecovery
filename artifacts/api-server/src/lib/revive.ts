type Stage = {
  name: string;
  status: string;
  result: string;
  timestamp?: string;
};

export type Opportunity = {
  id: string;
  customer: string;
  customerId?: string;
  type: string;
  amountAtRisk: number;
  riskScore: number;
  urgency: string;
  confidence: number;
  rootCause: string;
  recommendedAction: string;
  status: string;
  createdAt: string;
  lastAction: string;
  nextAction: string;
  stoppingRule: string;
  recoveryProbability?: number;
};

type Customer = {
  id: string;
  name: string;
  company: string;
  email: string;
  segment: string;
  lifetimeValue: number;
  health: string;
  lastPayment: string;
  openRisk: number;
};

type AuditEvent = {
  id: string;
  timestamp: string;
  opportunity: string;
  stage: string;
  action: string;
  actor: string;
  result: string;
  confidence: number;
  status: string;
};

const stageNames = ["Detect", "Diagnose", "Score", "Recommend", "Approve", "Execute", "Verify"];
const now = () => new Date().toISOString();
const money = (value: number) => Math.round(value);

const customerSeed = [
  ["Aarav Mehta", "Northstar Commerce", "aarav@northstar.example", "Enterprise", 420000, "Healthy"],
  ["Diya Iyer", "Kite & Co.", "diya@kite.example", "Growth", 184000, "At risk"],
  ["Rohan Kapoor", "Mango Labs", "rohan@mango.example", "Growth", 156000, "Healthy"],
  ["Ishita Rao", "Bluepine Health", "ishita@bluepine.example", "Enterprise", 510000, "At risk"],
  ["Kabir Shah", "Orbit Retail", "kabir@orbit.example", "SMB", 78000, "Watch"],
  ["Ananya Sen", "Lumen Works", "ananya@lumen.example", "Growth", 212000, "Healthy"],
  ["Vihaan Nair", "Cedar Finance", "vihaan@cedar.example", "Enterprise", 640000, "At risk"],
  ["Mira Joshi", "Paper Kite Studio", "mira@paperkite.example", "SMB", 52000, "Healthy"],
  ["Arjun Bhat", "Harbor Foods", "arjun@harbor.example", "Growth", 134000, "Watch"],
  ["Saanvi Menon", "Verde Mobility", "saanvi@verde.example", "Enterprise", 385000, "Healthy"],
  ["Neil Varma", "Pixel Pantry", "neil@pixel.example", "SMB", 44000, "At risk"],
  ["Tara Kulkarni", "Monsoon Travel", "tara@monsoon.example", "Growth", 118000, "Healthy"],
  ["Aditya Pillai", "Fable Systems", "aditya@fable.example", "Enterprise", 298000, "Watch"],
  ["Meera Chawla", "Nectar Foods", "meera@nectar.example", "Growth", 162000, "Healthy"],
  ["Yash Malhotra", "Stacked Goods", "yash@stacked.example", "SMB", 67000, "At risk"],
  ["Aditi Das", "Quiet River", "aditi@quietriver.example", "Enterprise", 445000, "Healthy"],
  ["Kunal Sethi", "Craftline", "kunal@craftline.example", "Growth", 104000, "Watch"],
  ["Nisha Ghosh", "Everyday Basket", "nisha@basket.example", "SMB", 39000, "Healthy"],
  ["Samar Roy", "Indigo Fleet", "samar@indigo.example", "Enterprise", 576000, "At risk"],
  ["Riya Sood", "Acorn Learning", "riya@acorn.example", "Growth", 148000, "Healthy"],
];

const customers: Customer[] = customerSeed.map((row, index) => ({
  id: `cus-${String(index + 1).padStart(3, "0")}`,
  name: row[0] as string,
  company: row[1] as string,
  email: row[2] as string,
  segment: row[3] as string,
  lifetimeValue: row[4] as number,
  health: row[5] as string,
  lastPayment: `${index % 3 === 0 ? "2026-08-28" : "2026-08-30"}T10:2${index}:00.000Z`,
  openRisk: 0,
}));

const opportunityTemplates = [
  ["Payment degradation", 24500, 88, "Insufficient funds", "Delayed retry", "High", "Auto-approved"],
  ["Failed subscription", 12500, 84, "Payment method expired", "Request payment update", "High", "Awaiting approval"],
  ["Checkout abandonment", 8900, 68, "Payment hesitation", "Send recovery reminder", "Medium", "Executing"],
  ["B2B overdue invoice", 76000, 79, "Invoice overdue · 18 days", "Send receivables reminder", "High", "Auto-approved"],
  ["Mandate failure", 18200, 73, "Bank decline", "Retry in 24 hours", "Medium", "Executing"],
  ["Promise-to-pay", 43500, 91, "Promise date approaching", "Schedule reminder", "High", "Awaiting approval"],
  ["Payment degradation", 6700, 62, "Network failure", "Retry payment", "Medium", "Auto-approved"],
  ["Checkout abandonment", 15600, 76, "Customer exit at payment", "Create payment link", "High", "Executing"],
  ["Failed subscription", 38900, 87, "Insufficient funds", "Delayed retry", "High", "Auto-approved"],
  ["B2B overdue invoice", 112000, 64, "Customer delayed", "Escalate to finance", "Critical", "Escalated"],
  ["Mandate failure", 9800, 81, "Authentication failure", "Request customer action", "Medium", "Auto-approved"],
  ["Promise-to-pay", 28500, 72, "Broken promise", "Escalate to human", "High", "Escalated"],
  ["Payment degradation", 53200, 89, "Bank declined", "Request customer action", "High", "Awaiting approval"],
  ["Checkout abandonment", 4200, 58, "Timeout", "Send recovery reminder", "Low", "Auto-approved"],
  ["Failed subscription", 21800, 78, "Payment method expired", "Request payment update", "High", "Awaiting approval"],
  ["B2B overdue invoice", 34800, 83, "Invoice overdue · 9 days", "Send payment request", "Medium", "Auto-approved"],
  ["Mandate failure", 24600, 75, "Insufficient funds", "Retry in 48 hours", "Medium", "Executing"],
  ["Promise-to-pay", 19400, 86, "Promise date today", "Schedule follow-up", "High", "Awaiting approval"],
  ["Payment degradation", 9200, 69, "Network failure", "Delayed retry", "Medium", "Auto-approved"],
  ["Checkout abandonment", 31800, 82, "Payment failure", "Create payment link", "High", "Executing"],
  ["Failed subscription", 7200, 61, "Bank decline", "Notify customer", "Low", "Stopped"],
  ["B2B overdue invoice", 58400, 77, "Invoice overdue · 31 days", "Follow up with finance", "High", "Escalated"],
  ["Mandate failure", 15100, 83, "Bank decline", "Retry in 24 hours", "Medium", "Auto-approved"],
  ["Promise-to-pay", 36200, 88, "Reminder due", "Schedule reminder", "High", "Awaiting approval"],
];

const opportunities: Opportunity[] = opportunityTemplates.map((template, index) => {
  const customer = customers[index % customers.length];
  const [type, amountAtRisk, riskScore, rootCause, recommendedAction, urgency, status] = template as string[];
  customer.openRisk += Number(amountAtRisk);
  return {
    id: `opp-${String(index + 1).padStart(3, "0")}`,
    customer: customer.name,
    customerId: customer.id,
    type,
    amountAtRisk: Number(amountAtRisk),
    riskScore: Number(riskScore),
    urgency,
    confidence: Math.min(96, Number(riskScore) + (index % 4)),
    rootCause,
    recommendedAction,
    status,
    createdAt: `2026-08-${String(31 - (index % 9)).padStart(2, "0")}T${String(8 + (index % 10)).padStart(2, "0")}:1${index}:00.000Z`,
    lastAction: index % 3 === 0 ? "Root cause identified" : "Opportunity detected",
    nextAction: status === "Awaiting approval" ? "Human review required" : recommendedAction,
    stoppingRule: type === "B2B overdue invoice" ? "Stop after customer confirms payment plan" : "Stop after success or 3 attempts",
    recoveryProbability: Math.min(94, Number(riskScore) - 3 + (index % 6)),
  };
});

const auditEvents: AuditEvent[] = [];
let sequence = 1;
const audit = (opportunity: Opportunity, stage: string, action: string, result: string, status = "Completed") => {
  const event = {
    id: `audit-${String(sequence++).padStart(4, "0")}`,
    timestamp: `2026-09-01T09:${String(sequence % 60).padStart(2, "0")}:00.000Z`,
    opportunity: opportunity.id,
    stage,
    action,
    actor: stage === "Approve" ? "Policy engine" : "REVIVE Agent",
    result,
    confidence: opportunity.confidence,
    status,
  };
  auditEvents.unshift(event);
  return event;
};

for (const opportunity of opportunities.slice(0, 10)) {
  audit(opportunity, "Detect", `${opportunity.type} detected`, `₹${opportunity.amountAtRisk.toLocaleString("en-IN")} at risk`);
  audit(opportunity, "Diagnose", opportunity.rootCause, `Confidence ${opportunity.confidence}%`);
}

const guardrails = {
  maxRetries: 3,
  minRetryIntervalHours: 6,
  maxContactsPerDay: 2,
  discountApprovalThreshold: 5000,
  highValueThreshold: 100000,
  lowConfidenceThreshold: 70,
  autoApprove: true,
  stopAfterSuccess: true,
  stopAfterOptOut: true,
};

const workflowNames = [
  ["Payment degradation", "Payments"],
  ["Checkout recovery", "Checkout"],
  ["Subscription recovery", "Subscriptions"],
  ["B2B receivables", "Receivables"],
  ["Mandate retry", "Mandates"],
  ["Promise-to-pay", "Receivables"],
];

const stagesFor = (opportunity: Opportunity): Stage[] =>
  stageNames.map((name, index) => ({
    name,
    status: index < 4 ? "Completed" : index === 4 && opportunity.status === "Awaiting approval" ? "Awaiting approval" : index === 5 && opportunity.status === "Executing" ? "Executing" : index === 6 && opportunity.status === "Completed" ? "Completed" : index < 5 ? "Completed" : "Pending",
    result:
      name === "Detect" ? "Signal captured from simulation" :
      name === "Diagnose" ? opportunity.rootCause :
      name === "Score" ? `${opportunity.riskScore}% risk · ${opportunity.recoveryProbability}% recovery probability` :
      name === "Recommend" ? opportunity.recommendedAction :
      name === "Approve" ? (opportunity.amountAtRisk > guardrails.highValueThreshold ? "Human approval required" : "Auto-approved under policy") :
      name === "Execute" ? opportunity.lastAction :
      "Awaiting payment verification",
    timestamp: index < 4 ? `2026-09-01T09:${String(12 + index).padStart(2, "0")}:00.000Z` : undefined,
  }));

const workflowPayload = () =>
  workflowNames.map(([name, category], index) => {
    const matching = opportunities.filter((opportunity) => opportunity.type.toLowerCase().includes(category.toLowerCase().replace("subscriptions", "subscription").replace("payments", "payment").replace("mandates", "mandate").replace("receivables", "invoice")));
    const recovered = money(matching.reduce((sum, opportunity) => sum + opportunity.amountAtRisk * (opportunity.status === "Completed" ? 0.81 : 0.37), 0));
    return {
      id: `workflow-${index + 1}`,
      name,
      category,
      status: index === 4 ? "Paused" : "Monitoring",
      activeCount: matching.length,
      recovered,
      successRate: Math.round(64 + index * 4),
      lastRun: "2 min ago",
      stages: stagesFor(matching[0] ?? opportunities[0]),
    };
  });

const metrics = () => {
  const revenueAtRisk = opportunities.reduce((sum, opportunity) => sum + opportunity.amountAtRisk, 0);
  const completed = opportunities.filter((opportunity) => opportunity.status === "Completed");
  const revenueRecovered = money(780000 + completed.reduce((sum, opportunity) => sum + opportunity.amountAtRisk * 0.08, 0));
  const active = opportunities.filter((opportunity) => !["Completed", "Stopped"].includes(opportunity.status)).length;
  return {
    revenueAtRisk,
    revenueRecovered,
    recoveryRate: Number(((revenueRecovered / (revenueAtRisk + revenueRecovered)) * 100).toFixed(1)),
    activeOpportunities: active,
    successfulInterventions: 86 + completed.length,
    preventedLoss: 320000,
  };
};

const activity = () => [
  { id: "activity-1", title: "Recovery verified", detail: "₹12,500 subscription payment recovered", stage: "Verify", timestamp: "2 min ago", tone: "success" },
  { id: "activity-2", title: "Intervention selected", detail: "Delayed retry recommended for Rohan Kapoor", stage: "Recommend", timestamp: "6 min ago", tone: "info" },
  { id: "activity-3", title: "High-value opportunity detected", detail: "₹1,12,000 invoice requires approval", stage: "Approve", timestamp: "11 min ago", tone: "warning" },
  { id: "activity-4", title: "Root cause identified", detail: "Insufficient funds across 3 attempts", stage: "Diagnose", timestamp: "18 min ago", tone: "neutral" },
  { id: "activity-5", title: "Workflow stopped", detail: "Customer opted out of recovery messages", stage: "Verify", timestamp: "32 min ago", tone: "danger" },
];

const timelineFor = (opportunity: Opportunity) => [
  { id: "timeline-1", title: "Payment signal detected", detail: `${opportunity.type} created for ${opportunity.customer}`, timestamp: "Today, 09:12", kind: "detect" },
  { id: "timeline-2", title: "Root cause identified", detail: opportunity.rootCause, timestamp: "Today, 09:13", kind: "diagnose" },
  { id: "timeline-3", title: "Recommendation made", detail: opportunity.recommendedAction, timestamp: "Today, 09:14", kind: "recommend" },
  { id: "timeline-4", title: "Next action", detail: opportunity.nextAction, timestamp: "Today, 09:15", kind: "execute" },
];

const detailFor = (opportunity: Opportunity) => ({
  ...opportunity,
  whyAtRisk: `${opportunity.customer} shows a ${opportunity.rootCause.toLowerCase()} signal. Recent behavior and payment history suggest this is recoverable with a bounded intervention.`,
  reasoning: `The agent chose ${opportunity.recommendedAction.toLowerCase()} because the recovery signal is ${opportunity.confidence}% confident and fits the active policy. It will stop after success, opt-out, or ${guardrails.maxRetries} attempts.`,
  timeline: timelineFor(opportunity),
  agentActions: auditEvents.filter((event) => event.opportunity === opportunity.id).slice(0, 6).map((event) => ({
    id: event.id,
    action: event.action,
    stage: event.stage,
    result: event.result,
    timestamp: event.timestamp,
    status: event.status,
  })),
});

const scenarioDetails: Record<string, { title: string; amount: number; action: string; root: string; message: string }> = {
  "payment-degradation": { title: "Payment degradation", amount: 24500, action: "Delayed retry", root: "Insufficient funds", message: "Customer historically succeeds after a delayed retry. One bounded attempt is scheduled." },
  checkout: { title: "Checkout abandonment", amount: 15600, action: "Create payment link", root: "Payment hesitation", message: "A payment link is ready with a single reminder. No further contact will be sent today." },
  subscription: { title: "Failed subscription", amount: 12500, action: "Request payment update", root: "Payment method expired", message: "The customer will receive a clear payment-method update request before any retry." },
  receivables: { title: "B2B overdue invoice", amount: 76000, action: "Send receivables reminder", root: "Invoice overdue · 18 days", message: "A professional reminder is queued with invoice context and a promise-to-pay option." },
  mandate: { title: "Mandate failure", amount: 18200, action: "Retry in 24 hours", root: "Bank decline", message: "The retry sequencer is active and will stop after three attempts." },
  hinglish: { title: "Hinglish voice recovery", amount: 8200, action: "Schedule follow-up", root: "Promise to pay", message: "Simulation classified the customer response as a promise to pay in Hinglish." },
  "promise-to-pay": { title: "Promise-to-pay tracker", amount: 43500, action: "Schedule reminder", root: "Promise date approaching", message: "A reminder is scheduled ahead of the promised payment date." },
};

export function getDashboard() {
  const current = metrics();
  return {
    metrics: current,
    trend: ["Apr", "May", "Jun", "Jul", "Aug", "Sep"].map((label, index) => ({
      label,
      atRisk: [1460000, 1750000, 1620000, 2080000, 1840000, current.revenueAtRisk][index],
      recovered: [480000, 620000, 710000, 680000, 780000, current.revenueRecovered][index],
      remaining: [980000, 1130000, 910000, 1400000, 1060000, Math.max(0, current.revenueAtRisk - current.revenueRecovered)][index],
    })),
    workflowBreakdown: [
      { label: "Payment degradation", amount: 228000, count: 8, color: "#e07a5f" },
      { label: "Checkout recovery", amount: 184000, count: 6, color: "#f2b84b" },
      { label: "Subscription recovery", amount: 156000, count: 5, color: "#6c8ef5" },
      { label: "B2B receivables", amount: 296000, count: 4, color: "#4aa78c" },
      { label: "Mandate retry", amount: 92000, count: 4, color: "#9d7bd8" },
    ],
    activity: activity(),
    topOpportunities: [...opportunities].sort((a, b) => b.amountAtRisk - a.amountAtRisk).slice(0, 5),
    intelligence: { recovered: current.revenueRecovered, preventedLoss: current.preventedLoss, bestIntervention: "Delayed retry", recoveryProbability: 81, agentConfidence: 91 },
    scorecard: { detected: opportunities.length + 103, recommendationsAccepted: 94, successfulRecoveries: current.successfulInterventions, recoveryRate: 86, escalationRate: 12, avgConfidence: 87, avgRecoveryTime: "18m 42s" },
  };
}

export function getOpportunities() {
  return opportunities;
}

export function getOpportunity(id: string) {
  const opportunity = opportunities.find((item) => item.id === id);
  return opportunity ? detailFor(opportunity) : undefined;
}

export function getCustomers() {
  return customers;
}

export function getCustomer(id: string) {
  return customers.find((item) => item.id === id);
}

export function getWorkflows() {
  return workflowPayload();
}

export function getAudit() {
  return auditEvents;
}

export function getAnalytics() {
  const current = metrics();
  return {
    metrics: current,
    recoveryByWorkflow: [
      { label: "Payment degradation", value: 228000, count: 8 },
      { label: "Checkout recovery", value: 184000, count: 6 },
      { label: "Subscription recovery", value: 156000, count: 5 },
      { label: "B2B receivables", value: 296000, count: 4 },
      { label: "Mandate retry", value: 92000, count: 4 },
    ],
    recoveryByIntervention: [
      { label: "Delayed retry", value: 314000, count: 24 },
      { label: "Payment link", value: 226000, count: 17 },
      { label: "Customer action", value: 168000, count: 12 },
      { label: "Receivables reminder", value: 132000, count: 9 },
    ],
    recoveryByReason: [
      { label: "Insufficient funds", value: 285000, count: 20 },
      { label: "Expired method", value: 194000, count: 13 },
      { label: "Customer hesitation", value: 172000, count: 10 },
      { label: "Bank decline", value: 129000, count: 9 },
    ],
    segments: [
      { label: "Enterprise", value: 548000, count: 18 },
      { label: "Growth", value: 312000, count: 27 },
      { label: "SMB", value: 116000, count: 19 },
    ],
    funnel: [
      { label: "Revenue at risk", value: current.revenueAtRisk, color: "#14213d" },
      { label: "Agent assessed", value: current.revenueAtRisk * 0.91, color: "#3d5a80" },
      { label: "Intervention approved", value: current.revenueAtRisk * 0.63, color: "#4aa78c" },
      { label: "Actually recovered", value: current.revenueRecovered, color: "#e07a5f" },
    ],
    avgRecoveryTime: "18m 42s",
  };
}

export function getGuardrails() {
  return { ...guardrails };
}

export function updateGuardrails(input: Partial<typeof guardrails>) {
  for (const key of Object.keys(guardrails) as (keyof typeof guardrails)[]) {
    const value = input[key];
    if (value !== undefined) {
      (guardrails[key] as never) = value as never;
    }
  }
  return getGuardrails();
}

export function search(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];
  return [
    ...customers.filter((item) => `${item.name} ${item.company} ${item.email}`.toLowerCase().includes(normalized)).map((item) => ({ id: item.id, title: item.name, subtitle: item.company, kind: "Customer" })),
    ...opportunities.filter((item) => `${item.customer} ${item.type} ${item.rootCause}`.toLowerCase().includes(normalized)).map((item) => ({ id: item.id, title: item.customer, subtitle: `${item.type} · ₹${item.amountAtRisk.toLocaleString("en-IN")}`, kind: "Opportunity" })),
  ].slice(0, 10);
}

function runScenario(scenario: string, opportunity?: Opportunity) {
  const detail = scenarioDetails[scenario] ?? scenarioDetails["payment-degradation"];
  const target = opportunity ?? {
    id: `opp-demo-${Date.now()}`,
    customer: scenario === "hinglish" ? "Vikram Patel" : "Demo Customer",
    customerId: "cus-demo",
    type: detail.title,
    amountAtRisk: detail.amount,
    riskScore: 82,
    urgency: "High",
    confidence: scenario === "hinglish" ? 88 : 91,
    rootCause: detail.root,
    recommendedAction: detail.action,
    status: detail.amount > guardrails.highValueThreshold ? "Awaiting approval" : "Executing",
    createdAt: now(),
    lastAction: "Agent recommendation generated",
    nextAction: detail.action,
    stoppingRule: `Stop after success, opt-out, or ${guardrails.maxRetries} attempts`,
    recoveryProbability: 81,
  };
  if (!opportunity) opportunities.unshift(target);
  const actualRecovery = target.amountAtRisk > guardrails.highValueThreshold ? 0 : money(target.amountAtRisk * (target.recoveryProbability ?? 80) / 100);
  const stages = stageNames.map((name, index) => ({
    name,
    status: index === 4 && target.amountAtRisk > guardrails.highValueThreshold ? "Awaiting approval" : "Completed",
    result: name === "Diagnose" ? target.rootCause : name === "Recommend" ? target.recommendedAction : name === "Verify" ? (actualRecovery ? `₹${actualRecovery.toLocaleString("en-IN")} recovered (simulated)` : "Awaiting human approval") : "Completed",
    timestamp: now(),
  }));
  for (const [index, name] of stageNames.entries()) {
    audit(target, name, stages[index].result, stages[index].result, stages[index].status);
  }
  return {
    scenario,
    title: detail.title,
    message: detail.message,
    amountAtRisk: target.amountAtRisk,
    expectedRecovery: money(target.amountAtRisk * (target.recoveryProbability ?? 80) / 100),
    actualRecovery,
    status: actualRecovery ? "Completed" : "Awaiting approval",
    stages,
    auditEvents: auditEvents.slice(0, 7),
    opportunity: target,
  };
}

export function runAgent(opportunityId: string) {
  const opportunity = opportunities.find((item) => item.id === opportunityId);
  if (!opportunity) return undefined;
  const scenarioByType: Record<string, string> = {
    "Payment degradation": "payment-degradation",
    "Checkout abandonment": "checkout",
    "Failed subscription": "subscription",
    "B2B overdue invoice": "receivables",
    "Mandate failure": "mandate",
    "Promise-to-pay": "promise-to-pay",
  };
  return runScenario(scenarioByType[opportunity.type] ?? "payment-degradation", opportunity);
}

export function runDemo(scenario: string) {
  if (scenario === "full") {
    const results = ["payment-degradation", "checkout", "subscription", "receivables", "mandate"].map((item) => runScenario(item));
    const total = results.reduce((sum, item) => sum + item.actualRecovery, 0);
    return { ...results[0], scenario: "full", title: "Full recovery demo", message: `${results.length} bounded scenarios completed. ₹${total.toLocaleString("en-IN")} recovered in simulation.`, amountAtRisk: results.reduce((sum, item) => sum + item.amountAtRisk, 0), expectedRecovery: results.reduce((sum, item) => sum + item.expectedRecovery, 0), actualRecovery: total, auditEvents: auditEvents.slice(0, 35) };
  }
  return runScenario(scenario);
}