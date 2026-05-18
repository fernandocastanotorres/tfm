# Skill Registry

**Delegator use only.** Any agent that launches sub-agents reads this registry to resolve compact rules, then injects them directly into sub-agent prompts. Sub-agents do NOT read this registry or individual SKILL.md files.

See `_shared/skill-resolver.md` for the full resolution protocol.

## User Skills

| Trigger | Skill | Path |
|---------|-------|------|
| /review or MR revision without changes | gitlab-mr-review | ~/.config/opencode/skills/gitlab-mr-review/SKILL.md |
| /deps | gitlab-mr-deps | ~/.config/opencode/skills/gitlab-mr-deps/SKILL.md |
| /coverage | gitlab-mr-coverage | ~/.config/opencode/skills/gitlab-mr-coverage/SKILL.md |
| /security or AppSec-only review | gitlab-mr-security | ~/.config/opencode/skills/gitlab-mr-security/SKILL.md |
| /approve-check | gitlab-mr-approve-check | ~/.config/opencode/skills/gitlab-mr-approve-check/SKILL.md |
| /refactor with write mode | gitlab-mr-refactor | ~/.config/opencode/skills/gitlab-mr-refactor/SKILL.md |
| /docs | gitlab-mr-docs | ~/.config/opencode/skills/gitlab-mr-docs/SKILL.md |
| /perf | gitlab-mr-perf | ~/.config/opencode/skills/gitlab-mr-perf/SKILL.md |
| /ci | gitlab-mr-ci | ~/.config/opencode/skills/gitlab-mr-ci/SKILL.md |
| /changelog | gitlab-mr-changelog | ~/.config/opencode/skills/gitlab-mr-changelog/SKILL.md |
| /risk | gitlab-mr-risk | ~/.config/opencode/skills/gitlab-mr-risk/SKILL.md |
| /explain | gitlab-mr-explain | ~/.config/opencode/skills/gitlab-mr-explain/SKILL.md |
| /sonar | gitlab-mr-sonar | ~/.config/opencode/skills/gitlab-mr-sonar/SKILL.md |
| /test | gitlab-mr-test | ~/.config/opencode/skills/gitlab-mr-test/SKILL.md |
| /fix with write mode | gitlab-mr-fix | ~/.config/opencode/skills/gitlab-mr-fix/SKILL.md |
| Implementing changes, preparing commits, splitting PRs | work-unit-commits | ~/.config/opencode/skills/work-unit-commits/SKILL.md |
| Drafting feedback, review comments, replies | comment-writer | ~/.config/opencode/skills/comment-writer/SKILL.md |
| Writing guides, READMEs, RFCs, docs | cognitive-doc-design | ~/.config/opencode/skills/cognitive-doc-design/SKILL.md |
| PR > 400 lines, planning chained/stacked PRs | gentle-ai-chained-pr | ~/.config/opencode/skills/chained-pr/SKILL.md |
| Creating GitHub issue, bug report, feature request | issue-creation | ~/.config/opencode/skills/issue-creation/SKILL.md |
| Creating pull request, opening PR | branch-pr | ~/.config/opencode/skills/branch-pr/SKILL.md |
| Creating new skill, adding agent instructions | skill-creator | ~/.config/opencode/skills/skill-creator/SKILL.md |
| Writing Go tests, teatest, test coverage | go-testing | ~/.config/opencode/skills/go-testing/SKILL.md |
| "judgment day", adversarial review, dual review | judgment-day | ~/.config/opencode/skills/judgment-day/SKILL.md |
| SCSS/Sassy CSS best practices | scss-best-practices | ~/.agents/skills/scss-best-practices/SKILL.md |
| Improve architecture, find refactoring opportunities | improve-codebase-architecture | ~/.agents/skills/improve-codebase-architecture/SKILL.md |
| WCAG 2.2 audit, a11y, screen reader, keyboard navigation | accessibility | ~/.agents/skills/accessibility/SKILL.md |
| JUnit 5 unit testing best practices | java-junit | ~/.agents/skills/java-junit/SKILL.md |
| Discover and install agent skills | find-skills | ~/.agents/skills/find-skills/SKILL.md |
| Surgical code refactoring | refactor | ~/.agents/skills/refactor/SKILL.md |
| Review UI for Web Interface Guidelines compliance | web-design-guidelines | ~/.agents/skills/web-design-guidelines/SKILL.md |
| Create frontend interfaces, components, pages | frontend-design | ~/.agents/skills/frontend-design/SKILL.md |
| Angular v20+ standalone components | angular-component | ~/.agents/skills/angular-component/SKILL.md |
| Angular code generation and architecture | angular-developer | ~/.agents/skills/angular-developer/SKILL.md |
| Spring Boot development best practices | java-springboot | ~/.agents/skills/java-springboot/SKILL.md |

## Compact Rules

Pre-digested rules per skill. Delegators copy matching blocks into sub-agent prompts as `## Project Standards (auto-resolved)`.

### work-unit-commits
- Structure commits as deliverable work units, not file-type batches
- Keep tests and docs beside the code they verify in the same commit
- Each commit should be independently reviewable and meaningful
- Use conventional commits format for commit messages
- When splitting PRs, each PR should represent a coherent deliverable slice

### comment-writer
- Write warm, direct, human-sounding comments for PRs, issues, reviews
- Use a professional but approachable tone — no corporate speak
- Be specific and actionable in feedback
- Include code examples when suggesting changes
- Acknowledge good work alongside critiques

### cognitive-doc-design
- Use progressive disclosure: start high-level, drill into details
- Chunk information into logical sections with clear headings
- Use signposting to guide readers through complex topics
- Prefer tables, checklists, and visual structure over prose
- Design for recognition over recall — readers should find, not memorize

### gentle-ai-chained-pr
- Split changes exceeding 400 lines into chained/stacked PRs
- Each PR in a chain should be independently reviewable
- Protect reviewer focus by keeping each PR under cognitive budget
- Order PRs by dependency — infrastructure before features
- Use clear naming to indicate chain relationships (e.g., pr-1/3, pr-2/3)

### issue-creation
- Follow issue-first enforcement system for Agent Teams Lite
- Always create an issue before implementing changes
- Include clear problem description, acceptance criteria, and context
- Link related issues, ADRs, or specs when applicable

### branch-pr
- PR creation workflow following issue-first enforcement
- Always link to the originating issue
- Include summary, changes list, and testing notes
- Use conventional PR format with clear sections

### go-testing
- Use `teatest` for Bubbletea TUI testing
- Follow Go standard testing patterns with `_test.go` files
- Use table-driven tests for multiple input scenarios
- Test golden files for TUI output comparison

### judgment-day
- Launch two independent blind judge sub-agents simultaneously
- Synthesize findings from both judges
- Apply fixes based on combined feedback
- Re-judge until both pass or escalate after 2 iterations

### scss-best-practices
- Use BEM or similar naming convention for class selectors
- Nest selectors max 3 levels deep to avoid specificity wars
- Use variables for colors, spacing, and breakpoints
- Prefer mixins for reusable style patterns
- Avoid `!important` unless absolutely necessary

### improve-codebase-architecture
- Surface architectural friction points before proposing changes
- Identify shallow modules that should be deepened
- Prioritize testability and AI-navigability improvements
- Use domain language from CONTEXT.md and decisions from docs/adr/
- Propose concrete refactoring paths with tradeoffs

### accessibility
- Follow WCAG 2.2 guidelines for all UI changes
- Ensure keyboard navigation for all interactive elements
- Use proper ARIA roles and labels
- Maintain minimum contrast ratios (AA: 4.5:1 for normal text)
- Test with screen readers for critical flows

### java-junit
- Use JUnit 5 annotations (@Test, @BeforeEach, @ParameterizedTest)
- Prefer @ParameterizedTest for data-driven test scenarios
- Use @DisplayName for readable test names
- Follow Given/When/Then structure in test methods
- Mock external dependencies, test business logic in isolation

### refactor
- Never change behavior during refactoring — only structure
- Extract functions/methods when code exceeds reasonable length
- Rename variables for clarity and domain alignment
- Break down god functions into focused, single-responsibility units
- Improve type safety where `any` or raw types are used

### web-design-guidelines
- Review UI code against Web Interface Guidelines
- Check for consistent spacing, typography, and color usage
- Verify responsive behavior across breakpoints
- Ensure proper semantic HTML structure
- Validate accessibility compliance alongside design review

### frontend-design
- Create distinctive, production-grade interfaces — avoid generic AI aesthetics
- Use real working code, not placeholders
- Make creative design choices appropriate for the target audience
- Implement proper responsive design patterns
- Pay attention to micro-interactions and visual polish

### angular-component
- Use standalone components (Angular v20+) — do NOT set `standalone: true`
- Use signal-based inputs/outputs for reactivity
- Apply OnPush change detection by default
- Use host bindings for host element modifications
- Implement proper content projection with ng-content

### angular-developer
- Use signal-based reactivity (signals, linkedSignal, resource)
- Prefer reactive forms over template-driven forms
- Use standalone components and bootstrapApplication
- Implement proper dependency injection patterns
- Follow Angular style guide for file structure and naming
- All frontend code MUST be written in English

### java-springboot
- Use Spring Boot 3.x with Java 17+
- Follow layered architecture (controller → service → repository)
- Use Spring Data JPA for database access
- Implement proper exception handling with @ControllerAdvice
- Use @ConfigurationProperties for externalized configuration

## Project Conventions

| File | Path | Notes |
|------|------|-------|
| AGENTS.md | AGENTS.md | Index — defines agent roles, skills matrix, collaboration protocol, mandatory English frontend standard |
| REQUIREMENTS.md | REQUIREMENTS.md | Referenced by AGENTS.md — project requirements, compliance framework, tech stack, functional requirements |
| specs.md | specs.md | SDD high-level index — current baseline, active decisions, test coverage status |
| docs/README.md | docs/README.md | Referenced by AGENTS.md — documentation index with links to all doc sections |
| docs/adr/INDEX.md | docs/adr/INDEX.md | Referenced by docs/README.md — ADR index with 12 decisions (11 accepted, 1 proposed) |
| docs/adr/README.md | docs/adr/README.md | Referenced by docs/README.md — ADR guidelines and lifecycle |
| docs/adr/_template.md | docs/adr/_template.md | Referenced by docs/README.md — ADR template |
| docs/architecture/INDEX.md | docs/architecture/INDEX.md | Referenced by docs/README.md — architecture index |
| docs/architecture/BOUNDARY_RULES.md | docs/architecture/BOUNDARY_RULES.md | Referenced by docs/README.md — hexagonal boundary enforcement |
| docs/architecture/SYSTEM_DESIGN.md | docs/architecture/SYSTEM_DESIGN.md | Referenced by docs/README.md — current runtime architecture and test coverage |
| docs/security/AUTHORIZATION_MATRIX.md | docs/security/AUTHORIZATION_MATRIX.md | Referenced by docs/README.md — RBAC authorization policy |
| docs/security/AUTHORIZATION_TEST_CASES.md | docs/security/AUTHORIZATION_TEST_CASES.md | Referenced by docs/README.md — authorization test catalog |
| docs/security/AUDIT_EVENT_CATALOG.md | docs/security/AUDIT_EVENT_CATALOG.md | Referenced by docs/README.md — audit event definitions |
| docs/api/API_CONTRACT.md | docs/api/API_CONTRACT.md | Referenced by docs/README.md — API baseline contract |
| docs/api/ERROR_MODEL.md | docs/api/ERROR_MODEL.md | Referenced by docs/README.md — API error model |
| docs/bpm/BPMN_CONVENTIONS.md | docs/bpm/BPMN_CONVENTIONS.md | Referenced by docs/README.md — Flowable process conventions |
| docs/interoperability/ENIDOC_SPEC.md | docs/interoperability/ENIDOC_SPEC.md | Referenced by docs/README.md — ENIDOC package specification |
| docs/quality/TEST_STRATEGY.md | docs/quality/TEST_STRATEGY.md | Referenced by docs/README.md — test strategy, CI gates, current coverage status |
| docs/quality/COVERAGE_SCOPE_MAP.md | docs/quality/COVERAGE_SCOPE_MAP.md | Referenced by docs/README.md — coverage scope definitions |
| docs/quality/CI_COVERAGE_GATES.md | docs/quality/CI_COVERAGE_GATES.md | Referenced by docs/README.md — CI coverage enforcement |
| docs/IMPLEMENTATION_READY_CHECKLIST.md | docs/IMPLEMENTATION_READY_CHECKLIST.md | AI delivery readiness checklist with current test status |
| docs/DEPLOYMENT_AND_BUILD.md | docs/DEPLOYMENT_AND_BUILD.md | Build commands, local dev, Docker Compose, test coverage commands |

Read the convention files listed above for project-specific patterns and rules. All referenced paths have been extracted — no need to read index files to discover more.
