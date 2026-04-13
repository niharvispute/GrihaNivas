# Bricks Postman + Newman Setup

## Files

- `Bricks_API_EdgeCases.postman_collection.json` - Postman collection (v2.1)
- `Bricks_Local.postman_environment.json` - Postman environment for local backend
- `run-newman-report.ps1` - PowerShell script to run all requests and generate reports

## Import in Postman

1. Open Postman.
2. Click Import.
3. Import:
   - `Bricks_API_EdgeCases.postman_collection.json`
   - `Bricks_Local.postman_environment.json`
4. Select environment: `Bricks Local`.
5. Update these environment values:
   - `userIdentifier`
   - `userPassword`
   - `adminIdentifier`
   - `adminPassword`

## Run in Postman

1. Open Collection Runner.
2. Select `Bricks Backend - API + Edge Cases`.
3. Run all requests.
4. Postman will show pass/fail tests per request.

## Generate proper reports (CLI)

From `backend/postman`:

```powershell
./run-newman-report.ps1
```

Generated outputs in `backend/postman/reports`:

- `newman-report.html` (human-readable report)
- `newman-report.xml` (JUnit CI format)
- `newman-report.json` (raw machine-readable report)

## Notes

- Some tests allow `200/401/403` so collection is reusable across local setups where credentials may not be configured yet.
- For stricter CI, set real credentials and tighten expected status assertions to exact values.
