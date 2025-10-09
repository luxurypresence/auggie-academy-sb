# Methodology Documentation

## Pattern Library

**File**: [pattern-library.md](pattern-library.md)
**Purpose**: Some proven AI orchestration patterns

**Use when**:

- Applying patterns to features
- Understanding coordination requirements
- Learning pattern implementation

**Format**: Problem → Solution → How to Apply (with code examples)

---

## Other Protocol Files

- **coordination-protocols.md** - Low vs high coordination requirements
- **session-logging-system.md** - How to log agent execution for analysis
- **pre-execution-validation-protocol.md** - Strategic orchestration before agent launch
- **testing-as-infrastructure.md** - Why testing framework is infrastructure
- **database-migration-strategy.md** - Managing schema changes
- **atomic-commit-guidelines.md** - Git commit best practices
- **prompt-templates.md** - Template patterns for agent prompts
- **logging-templates.md** - Session logging examples
- **agent-specs-library.md** - Common agent specifications
- **bugfix-prompt-template.md** - How to write bug fix prompts

---

## For Orchestration Partner

**`/init-orchestration-partner` loads:**

- pattern-library.md (mandatory) - apply proven patterns
- coordination-protocols.md (mandatory) - determine coordination level
- Other protocol files (as needed) - answer deep questions and apply specific protocols
