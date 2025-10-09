# Chapter 3: Two-Tier Testing Strategy

**Part 1: Strategic Orchestration Foundations**
**When to read:** Day 2 Morning

---

## Overview

Why unit tests WITH mocks + integration tests WITHOUT mocks both required.

---

## 1. Theory: The Mock Blindness Problem

[Content: Why mock-heavy tests hide integration bugs]

---

## 2. Evidence: Integration Testing Discovery

### What Happened
- 128/128 unit tests passed
- 2 critical production bugs existed
- Why tests passed: Mocks hid database behavior
- Why bugs existed: Real PostgreSQL returns strings, code expected Date objects

### The Pattern
```typescript
// ❌ WRONG: All mocked (hides type mismatches)
vi.mock('@/lib/services/notification.service');

// ✅ CORRECT: Real database, real services (catches bugs)
test('integration: create notification', async () => {
  const notification = await notificationService.createAndPublish({...});
  const dbRecord = await sequelize.models.Notification.findByPk(notification.id);
  expect(dbRecord).toBeDefined();
});
```

---

## 3. Protocol: Two-Tier Testing Requirements

### Tier 1: Unit Tests (WITH Mocks)
- **Purpose:** Test logic in isolation
- **Speed:** Fast (<1s per test)
- **Coverage:** Edge cases, error paths
- **Example:** "markAsRead throws error if notification not found"

### Tier 2: Integration Tests (NO Mocks)
- **Purpose:** Test cross-layer integration
- **Speed:** Slower (database I/O)
- **Coverage:** Happy path through full stack
- **Example:** "Create notification → Verify in DB → Verify broadcast"

### Minimum Requirements
```yaml
per_task:
  unit_tests: 'Multiple (edge cases with mocks)'
  integration_tests: 'At least 1 (happy path, NO MOCKS)'

per_feature:
  e2e_tests: 'At least 1 (full flow validation)'
```

---

## 4. Practice: Writing Both Test Types

[Hands-on examples from AgentIQ features]

---

## 5. NestJS Examples

### Unit Test Pattern (Sequelize Mocked)
```typescript
// Example: Testing service logic with mocked database
```

### Integration Test Pattern (Real Database)
```typescript
// Example: Testing full flow with real Sequelize operations
```

---

## Key Takeaways

- [ ] Unit tests necessary but not sufficient
- [ ] Integration tests catch bugs unit tests hide
- [ ] Both tiers required (minimum 1 integration test per task)
- [ ] "Tests passing" includes both tiers
- [ ] No mocks in integration tests = catches real bugs

---

**Next Chapter:** The 5 Validation Gates
