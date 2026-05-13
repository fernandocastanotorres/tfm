# Audit Event Catalog (Security and Compliance)

This catalog defines mandatory audit events, fields, and reason codes for ENS-oriented traceability.

It complements:
- `REQUIREMENTS.md` (audit requirements)
- `docs/security/AUTHORIZATION_MATRIX.md`
- `docs/security/AUTHORIZATION_TEST_CASES.md`

## 1) Mandatory Audit Envelope

Every auditable event MUST include:

- `event_id` (UUID v4)
- `timestamp` (UTC ISO-8601)
- `user_id` (or `anonymous` where applicable)
- `role_set` (resolved roles at decision time)
- `action` (domain action code)
- `resource_type`
- `resource_uuid`
- `decision` (`ALLOW` | `DENY`)
- `reason_code` (see catalog below)
- `client_ip`
- `user_agent` (sanitized)
- `app_context` (module/service name)
- `correlation_id` (request trace id)

## 2) Event Categories

1. **Authentication**: login/refresh/logout outcomes.
2. **Authorization**: access grants/denials on protected resources.
3. **Workflow**: task claim/complete/return-for-amendment transitions.
4. **Document Operations**: upload, conversion, signature, package generation, download.
5. **Administration**: user/role changes, BPM deployment changes.
6. **Interoperability/Validation**: ENI XML generation and XSD validation results.

## 3) Event Catalog

| Event Code | Category | Action | Decision | When to Emit |
|---|---|---|---|---|
| AUTH_LOGIN_SUCCESS | Authentication | User login | ALLOW | Valid login completed |
| AUTH_LOGIN_FAILURE | Authentication | User login | DENY | Invalid credentials/blocked access |
| AUTH_REFRESH_SUCCESS | Authentication | Token refresh | ALLOW | Refresh accepted |
| AUTH_REFRESH_FAILURE | Authentication | Token refresh | DENY | Invalid/expired refresh token |
| AUTH_LOGOUT | Authentication | User logout | ALLOW | Authenticated logout completed |
| ACCESS_GRANTED | Authorization | Protected endpoint access | ALLOW | Access permitted after checks |
| ACCESS_DENIED_ROLE | Authorization | Protected endpoint access | DENY | Required role missing |
| ACCESS_DENIED_OWNERSHIP | Authorization | Protected endpoint access | DENY | Resource ownership check failed |
| ACCESS_DENIED_STATE | Authorization | Protected endpoint access | DENY | Workflow/business state invalid |
| TASK_CLAIMED | Workflow | Claim workflow task | ALLOW | Task claim successful |
| TASK_COMPLETED | Workflow | Complete workflow task | ALLOW | Task completion successful |
| TASK_RETURNED_FOR_AMENDMENT | Workflow | Return case for amendment | ALLOW | Case returned to citizen |
| DOC_UPLOADED | Document Operations | Upload document | ALLOW | Document persisted |
| DOC_CONVERT_PDF_A_SUCCESS | Document Operations | Convert to PDF/A | ALLOW | Conversion successful |
| DOC_CONVERT_PDF_A_FAILURE | Document Operations | Convert to PDF/A | DENY | Conversion failed |
| DOC_SIGN_XADES_T_SUCCESS | Document Operations | Sign document | ALLOW | Signature successful |
| DOC_SIGN_XADES_T_FAILURE | Document Operations | Sign document | DENY | Signature failed/policy rejected |
| ENIDOC_BUILD_SUCCESS | Document Operations | Generate .enidoc package | ALLOW | Package generated |
| ENIDOC_BUILD_FAILURE | Document Operations | Generate .enidoc package | DENY | Package generation failed |
| ENI_INDEX_XML_VALID | Interoperability/Validation | Validate ENI index.xml | ALLOW | XSD validation success |
| ENI_INDEX_XML_INVALID | Interoperability/Validation | Validate ENI index.xml | DENY | XSD validation failed |
| ADMIN_USER_CREATED | Administration | Create user | ALLOW | User successfully created |
| ADMIN_USER_UPDATED | Administration | Update user/roles | ALLOW | Update successful |
| ADMIN_USER_DELETED | Administration | Disable/delete user | ALLOW | Deletion/disable successful |
| ADMIN_BPM_DEPLOY_SUCCESS | Administration | Deploy BPM definition | ALLOW | Deployment successful |
| ADMIN_BPM_DEPLOY_FAILURE | Administration | Deploy BPM definition | DENY | Deployment failed |

## 4) Standard Reason Codes

Use consistent reason codes for machine-readable analysis:

- `OK`
- `INVALID_CREDENTIALS`
- `TOKEN_EXPIRED`
- `TOKEN_INVALID`
- `ROLE_MISSING`
- `NOT_OWNER`
- `STATE_INVALID`
- `POLICY_REJECTED`
- `VALIDATION_ERROR`
- `DEPENDENCY_UNAVAILABLE`
- `INTERNAL_ERROR`

Rule:
- `ALLOW` events should usually use `OK`.
- `DENY` events MUST use a non-`OK` reason code.

## 5) Sensitive Data Handling

Do NOT log:
- plain credentials
- full token values
- private keys or signature material
- full personal payloads unless legally required

If contextual payload is needed, log redacted/minimal metadata only.

## 6) Retention and Integrity Guidelines

- Audit logs must be immutable/tamper-evident at storage level.
- Retention period must follow legal and institutional policy.
- Time synchronization (NTP) is required to preserve chronology integrity.

## 7) Verification Requirements

For each high-risk flow, tests must verify:

1. Event is emitted with mandatory envelope fields.
2. Correct event code and reason code are used.
3. Correlation ID links event to request trace.
4. Sensitive fields are not leaked.
