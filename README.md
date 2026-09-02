# REVIVE

## AI Revenue Recovery Control Room

> Detect revenue at risk. Decide intelligently. Recover safely.

REVIVE detects revenue at risk, diagnoses the likely cause, chooses a bounded intervention, simulates the recovery, verifies the result, and records an audit trail.

This is a simulation-first demo built for fintech operations teams, hackathons, and product walkthroughs. All amounts are fictional INR demo data; no live payments are affected.

## What is included

- Overview control room with risk, recovery, trend, activity, and scorecards
- Unified revenue opportunity queue with search, filtering, sorting, and customer context
- AI agent reasoning focused on concise business factors rather than hidden chain-of-thought
- Seven recovery workflow stages: Detect, Diagnose, Score, Recommend, Approve, Execute, Verify
- Payment degradation, checkout, subscription, receivables, mandate, Hinglish voice, and promise-to-pay simulations
- Full Demo Center with individual and sequential scenario runs
- Editable guardrails for retries, contact limits, approval thresholds, confidence, and stop conditions
- Recovery analytics, customer 360 views, and a complete audit trail
- Provider adapter seam ready for a future live payment provider integration

## Architecture

```text
React + Vite frontend
        ↓
Express API server
        ↓
Revenue recovery simulation service
        ↓
SimulationProvider-style bounded actions
```

The demo service keeps deterministic state in the API process so it works without external credentials or a payment account. The OpenAPI contract in `lib/api-spec/openapi.yaml` generates the typed React Query client and Zod schemas.

## Run locally

This repository uses pnpm workspaces:

```bash
pnpm install
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/revive run dev
```

The Replit workflows start both services with the correct preview routing. No API key is required.

## Demo instructions

1. Open Overview to see the money-at-risk versus money-recovered story.
2. Open Demo Center and run an individual scenario.
3. Run Full Demo to execute several bounded workflows together.
4. Open Audit Trail to inspect the seven-stage events.
5. Adjust Guardrails and run a scenario again to see approval and stopping behavior change.

## Safety

REVIVE is bounded AI recovery, not an unrestricted autonomous payment bot. High-value or low-confidence actions can require human approval, and workflows stop after configured retry limits, successful payment, or customer opt-out.

## Future live-provider architecture

The simulation service is intentionally isolated behind a provider boundary. A future adapter can implement methods such as `getPayment`, `retryPayment`, `getSubscription`, `createPaymentLink`, `getInvoice`, and `recordRecoveryAction` without changing the dashboard or agent decision surface. Live Razorpay credentials are not required by this demo.

## GitHub

The complete application source is intended to be pushed to:

`https://github.com/include-stdioH/REVIVE-Revenue-Recovery-1`

Do not commit `.env` files or credentials. Use `.env.example` as the safe template.