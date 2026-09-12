# Admin Portal Database Wiring

Wire up the mock Admin Portal pages to use real data from the SQLite database.

## Proposed Changes

### Dashboard
- [NEW] `app/api/admin/dashboard/route.ts`: Return live statistics (total farmers, active tokens, procured volume today, tokens by status).
- [MODIFY] `app/admin/dashboard/page.tsx`: Fetch from `/api/admin/dashboard` and populate KPI cards and charts dynamically.

### Centres Monitor
- [NEW] `app/api/admin/centres/route.ts`: Return all centres with dynamic queue counts and capacity utilization (calculate based on today's active tokens at each centre).
- [MODIFY] `app/admin/centres/page.tsx`: Fetch and render live centres.

### Centre Detail View
- [NEW] `app/api/admin/centres/[id]/route.ts`: Return specific centre details and its current token list (mocked hourly data can remain or be calculated).
- [MODIFY] `app/admin/centre/[id]/page.tsx`: Display live token list.
- [NEW] `app/api/admin/tokens/[id]/status/route.ts`: A route to update the status of a token (e.g., BOOKED -> ARRIVED -> VERIFIED -> WEIGHED -> COMPLETED).
- [MODIFY] `app/admin/centre/[id]/page.tsx`: Hook up the "Mark Arrived", "Mark Done", etc., buttons to the token status API.

## Verification Plan
1. Check that the `/admin/dashboard` shows actual database numbers.
2. Check that `/admin/centres` correctly lists live centres and reflects queue data.
3. Verify that an admin can update a token's status from `/admin/centre/[id]`.
