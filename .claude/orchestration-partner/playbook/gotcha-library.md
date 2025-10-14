# Gotcha Library: Known Issues & Solutions

**Purpose:** Complete catalog of documented issues with proven solutions

---

## Frontend Gotchas

### Field Naming Mismatches
**Problem:** Backend uses lead_id, frontend expects leadId
**Symptoms:** GraphQL returns null/undefined for fields
**Solution:** Use camelCase throughout, import schema types
**Evidence:** High-coordination challenge
**See:** Chapter 6: Field Naming Locks

---

## Backend Gotchas

### Database Type Mismatches
**Problem:** PostgreSQL returns strings, code expects Date objects
**Symptoms:** Tests pass (mocked), production crashes (real DB)
**Solution:** Integration tests WITHOUT mocks catch this
**Evidence:** Integration testing discovery
**See:** Chapter 3: Two-Tier Testing Strategy

### External Dependency Validation
**Problem:** Tests pass (mocked API), feature broken (real API)
**Symptoms:** Missing environment variables, API calls fail
**Solution:** Mandatory external dependency disclosure
**Evidence:** External dependency issue
**See:** Pattern Library external dependency validation

---

## Testing Gotchas

### Long-Running Test Processes
**Problem:** Test workers accumulate after timeout (2+ min tests)
**Symptoms:** RAM exhaustion (10GB+), development machine unusable
**Solution:** Configure proper test timeouts and use --runInBand for resource-intensive tests
**Evidence:** Validation gate discovery
**See:** Chapter 4: Validation Gate 4

### TypeScript Errors While Tests Pass
**Problem:** Runtime test success ≠ compilation success
**Symptoms:** Tests pass, TypeScript fails, deployment blocked
**Solution:** Run pnpm run type-check before claiming complete
**Evidence:** 221 errors undetected by tests alone
**See:** Chapter 4: Validation Gate 1

---

## Coordination Gotchas

### Import Chain Parallelization
**Problem:** Claiming parallel execution when import dependencies exist
**Symptoms:** Agents refuse to proceed (correctly!)
**Solution:** Map imports before claiming parallel possible
**Evidence:** Authentication import dependency
**See:** Chapter 8: Import Dependency Analysis

### Integration Without Validation
**Problem:** Individual agents complete, system integration fails
**Symptoms:** TypeScript errors, field mismatches after parallel work
**Solution:** Integration validation layer (5 gates mandatory)
**Evidence:** ~60 coordination errors after parallel completion
**See:** Chapter 4: The 5 Validation Gates

---

## Mobile Gotchas

### localhost on Physical Devices
**Problem:** localhost refers to phone, not development machine
**Symptoms:** Backend "Disconnected", API calls fail
**Solution:** Use network IP (192.168.X.X) for physical device testing
**Evidence:** Mobile development discovery
**See:** Chapter 12: Mobile Development Patterns

### Different WiFi Networks
**Problem:** Phone and computer on different networks
**Symptoms:** Expo Go can't connect, "Taking longer than expected"
**Solution:** Ensure same WiFi network before testing
**Evidence:** Mobile setup issue
**See:** Chapter 12: Mobile Development Patterns

---

**Status:** Growing library - add new gotchas as discovered
