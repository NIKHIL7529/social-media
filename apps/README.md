# Application development

Use the [API README](api/README.md) for backend setup, database indexes, and seed accounts. Use the [web README](web/README.md) for frontend setup, rendering, and UI conventions. The [repository README](../README.md) provides the project overview.

## Shared conventions

- Keep application changes within `apps/` and preserve existing features and UI fields.
- Support only the current database schema. All data is disposable development data; update `api/scripts/seed.py` when the schema changes instead of adding compatibility branches.
- Remove unused and duplicate code. Centralize shared behavior while keeping component-specific behavior with its component.
- Do not add automated tests or test cases. Validate changes with lint, type checking, compilation, builds, and manual inspection.
- Keep documentation in these READMEs: shared guidance here, service-specific guidance in the corresponding README without repetition.

## Containers

Configure `api/.env` using the API README, then run from this directory:

```powershell
docker compose up --build
```

This Compose file exposes the web app at `http://localhost:3000` and the API at `http://localhost:8000`. The database must be reachable from the API container; `127.0.0.1` inside it refers to the container itself.
