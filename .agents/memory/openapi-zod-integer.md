---
name: OpenAPI integer compatibility
description: Orval's generated Zod client must match the installed Zod major version.
---

When this workspace uses the installed Zod 3 runtime, OpenAPI integer schemas can generate unsupported `zod.int()` calls. Prefer numeric schemas for dashboard counters unless the generator/runtime configuration is explicitly upgraded together.

**Why:** Codegen completed successfully but the workspace library typecheck failed because the generated Zod runtime did not expose `int()`.

**How to apply:** After changing the OpenAPI contract, run codegen and the library typecheck before relying on generated server schemas.