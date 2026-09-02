# REVIVE

REVIVE is a simulation-first AI revenue recovery control room that detects risk, chooses bounded interventions, verifies simulated outcomes, and records audit events.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: none for the default simulation

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/revive/src/` — React control room, route views, shared UI, and theme
- `artifacts/api-server/src/lib/revive.ts` — deterministic simulation state and bounded agent decisions
- `artifacts/api-server/src/routes/revive.ts` — REVIVE API routes
- `lib/api-spec/openapi.yaml` — source of truth for typed API contracts
- `lib/api-client-react/src/generated/` — generated React Query client
- `README.md` — setup and demo walkthrough

## Architecture decisions

- The default provider is deterministic simulation state so demos work without payment credentials.
- The API owns demo mutations and derived metrics; the frontend consumes typed hooks rather than fabricating primary interactions.
- Recovery actions expose concise business reasoning and guardrail results, not hidden model chain-of-thought.
- The seven-stage workflow is shared across scenarios to make the agent loop easy to understand and audit.

## Product

Users can monitor revenue at risk, inspect opportunities and customer context, run recovery scenarios, edit policies, and review recovery analytics and audit events.

## User preferences

No standing preferences recorded.

## Gotchas

- All amounts are fictional INR demo data; the app does not call a live payment provider.
- Regenerate API client and Zod schemas after changing `lib/api-spec/openapi.yaml`.
- Use the managed artifact workflows rather than starting the workspace root directly.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
