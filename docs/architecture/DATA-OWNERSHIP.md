# Data ownership

| Data | Owner | Authority |
| --- | --- | --- |
| Knowledge Objects | ecosystem | Git canonical source |
| Product records | owning app | PostgreSQL schema + migrations |
| Browser session | auth-web / app | server-side session store |
| Authorization policy | authz-biscuit + owner | versioned policy contracts |
| Cache | owning app | never authoritative |
| Blobs | owning app | Cellar with explicit retention |
| Evidence | proof | immutable evidence manifest |
| Releases | artifact | release manifest and registry |

Cross-product database tables are forbidden. Sharing occurs through versioned contracts, not direct table access.
