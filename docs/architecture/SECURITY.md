# Security architecture

## Trust zones

1. external/untrusted sources ;
2. validated observations ;
3. reviewed knowledge ;
4. normative decisions and contracts ;
5. runtime secrets, never in Knowledge Objects.

## Browser boundary

Opaque HttpOnly session cookie, strict SameSite, CSRF, Origin/Referer controls, CSP and no authorization material in browser storage.

## Authorization

Biscuit Ed25519, attenuation, tenant fact, expiration, deny-by-default, rotation and revocation. PostgreSQL RLS provides defense in depth.

## Agents

Scoped credentials, network sandbox, bounded work packages, zero PII logs and human approval for schema/auth/data/release/deployment.

## Supply chain

Exact versions, minimum release age, trusted dependency allowlist, license/advisory scans, SBOM, checksums and provenance.
