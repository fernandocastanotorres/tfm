# PR Template Snippet — Architecture Impact

Use this section in pull requests that modify architecture boundaries, contracts, or dependency rules.

```md
## Architecture Impact

### Change Scope
- [ ] Affects a single module
- [ ] Affects multiple modules
- [ ] Changes dependency direction or layer boundaries
- [ ] Changes API/schema contracts

### Impact Assessment
- [ ] Security/RBAC impact reviewed
- [ ] Audit/traceability impact reviewed
- [ ] API/schema compatibility verified
- [ ] Deployment/operations impact reviewed

### ADR Compliance
- [ ] Existing ADR applies (list below)
- [ ] New ADR added
- [ ] Existing ADR superseded (linked)

**ADR references:**
- ADR-____

### Boundary Rules Compliance
- [ ] Complies with `docs/architecture/BOUNDARY_RULES.md`
- [ ] Allowed/forbidden dependencies unchanged or documented
- [ ] Cross-boundary owners acknowledged (if applicable)

### Automation
- [ ] Architecture/lint checks added or updated (if rule is persistent)
- [ ] CI validates new/updated boundary constraints
```
