# Day 5 Afternoon: Demos + Brownfield Extension + Course Wrap-Up

**Session 10 of 10**

**Session Goal:** Showcase what you've built, learn brownfield application, reflect on the week

---

## Demo Preparation (1:00-2:00 PM)

### Polish Your Application

**Final touches before demos:**

- [ ] Fix any critical bugs
- [ ] Ensure all validation gates pass
- [ ] Test complete user flow in browser
- [ ] Clean up obvious UI issues
- [ ] Prepare demo narrative

**Not required:**

- Perfect styling
- Every edge case handled
- Complete feature set

**Demo-ready = core features work reliably**

---

### Prepare Your Demo Story (3 minutes)

**What to prepare:**

**1. Quick demo (2 minutes):**

- Show 2-3 key features working
- Lead list → detail page → AI features
- One impressive moment (AI summary, scoring, recommendations)

**2. One key insight (1 minute):**

- What's your biggest learning about AI orchestration?
- What surprised you most this week?
- What will you apply on Monday?

**Keep it brief** - you'll have 3 minutes total

---

## Brownfield Extension Demo (4:00-5:00 PM)

**Instructor-led demonstration**

### The Challenge: Scaling to Company Codebases

**You've learned orchestration in greenfield (fresh start):**

- Clean slate
- No existing patterns to follow
- You define all conventions

**Monday you return to brownfield (complex existing codebases):**

- Established tech stack
- Existing patterns and conventions
- Integration points to respect
- Known gotchas and issues

**Question:** How does methodology transfer?

---

### The Solution: Per-Repo Methodology Partner

**Live demonstration using Serena MCP:**

#### Step 1: Understand Existing Codebase

```
Instructor: "Let's look at a complex company repo (auth-service).
First, use Serena MCP to understand what exists:"

Serena queries:
- "What tech stack is used?" → NestJS, TypeORM, Redis
- "Find all authentication-related code" → Services, guards, strategies
- "What patterns exist?" → Repository pattern, Guards, DTOs, Event emitters
```

**Serena helps you understand BEFORE building**

Key insight: In brownfield, you must discover patterns first (can't invent new ones)

---

#### Step 2: Document Patterns in `.claude/`

**Create per-repo documentation:**

```
auth-service/
  .claude/
    meta/
      repo-identity.md
        # Tech stack: NestJS 10.x, TypeORM, Redis
        # Architecture: Microservice, event-driven
        # Critical systems: Multi-tenant, session management

      common-patterns.md
        # Repository pattern (not direct TypeORM)
        # Guards for auth (not middleware)
        # Event emitters (not direct service calls)

      critical-gotchas.md
        # MUST filter by tenantId (multi-tenant data isolation)
        # Token rotation requires Redis AND database update
        # No hard-coded URLs (environment-specific)
```

**This documentation:**

- Created by first engineer in repo
- Shared with entire team (checked into git)
- Grows over time (each feature adds learnings)

---

#### Step 3: Initialize Partner for This Repo

```
/init-orchestration-partner
```

**Partner loads:**

- Repo identity (tech stack, architecture)
- Common patterns (how things are done here)
- Critical gotchas (known issues to avoid)
- Same orchestration methodology (proven patterns)

**Partner now knows THIS repo's context**

---

#### Step 4: Orchestrate Feature in Brownfield

```
You: "Create agent prompt for: Add email notifications to auth service"

Partner: "I'll create prompt following this repo's patterns:
- NestJS Guards (repo uses Guards, not middleware)
- Event emitters (repo pattern for cross-service communication)
- Repository pattern (repo doesn't use direct TypeORM)
- Multi-tenant filtering (MUST include tenantId - critical gotcha)
- Existing EmailService (repo already has it - don't recreate)

Here's the complete prompt following auth-service conventions..."
```

**Agent builds feature:**

- ✅ Follows established patterns
- ✅ Avoids known gotchas
- ✅ Integrates with existing code
- ✅ No reinventing what exists

---

### The Compound Knowledge Effect

**Repository intelligence accumulates:**

**First engineer:**

- Documents 3 patterns, 2 gotchas
- Baseline established

**Fifth engineer:**

- Knows 6 patterns, 4 gotchas (accumulated knowledge)
- Builds faster (doesn't rediscover)

**Tenth engineer:**

- Knows 12+ patterns, 8+ gotchas
- **Faster than engineer #1** (compound learning)

**Knowledge sharing at scale** - every engineer improves repo documentation

---

### Your Monday Action Plan

**This methodology works in your company repos:**

**Step 1: Pick a repo to start with**

- Choose one you work in regularly
- Complexity doesn't matter (methodology scales)

**Step 2: Use Serena to understand patterns**

- What tech stack?
- What conventions exist?
- What gotchas are known?

**Step 3: Create `.claude/` structure**

- Document what Serena helped you discover
- Write down patterns to follow
- Note gotchas to avoid

**Step 4: Orchestrate a small feature**

- Use `/init-orchestration-partner`
- Apply systematic methodology
- Document learnings in `.claude/experiments/`

**Step 5: Share with team**

- Check in `.claude/` directory
- Next engineer benefits from your documentation
- Knowledge compounds over time

---

## Individual Reflection

### Reflection Questions

**Write down your answers:**

**1. Mindset shift:**

- How has your approach to AI development changed this week?
- What did you think AI could do on Monday vs Friday?
- What surprised you most?

**2. Key learnings:**

- What's your biggest takeaway from this week?
- Which pattern/protocol was most valuable?
- What do you still feel uncertain about?

**3. Successes:**

- What are you most proud of building?
- What worked better than expected?
- What feature impressed you most?

**4. Challenges:**

- What was harder than expected?
- Where did you struggle?
- What would you do differently if starting over?

**5. Monday planning:**

- Which company repo will you apply this to?
- What feature will you orchestrate first?
- What do you need to prepare over the weekend?

---

## Week Accomplishments

**Technical delivery:**

- ✅ Complete, production-quality CRM application
- ✅ 7+ major features implemented
- ✅ Multi-platform (web + mobile)
- ✅ AI intelligence layer (3 AI features)
- ✅ 80%+ test coverage (unit + integration)
- ✅ All 5 validation gates passing

**Methodology mastery:**

- ✅ Infrastructure-first pattern
- ✅ Coordination through convention (field naming locks, schema as contract)
- ✅ 5 validation gates (comprehensive quality standard)
- ✅ Two-tier testing strategy
- ✅ Sequential vs parallel execution analysis
- ✅ Pre-execution validation protocol
- ✅ Strategic orchestration with partner

**Transferable skills:**

- ✅ Strategic thinking (proactive vs reactive)
- ✅ Systematic coordination (proven patterns)
- ✅ Quality enforcement (validation gates)
- ✅ Brownfield application (Serena + per-repo `.claude/`)

---

## What Happens Monday

**You can immediately apply this to company work:**

**The methodology transfers because:**

- Same strategic thinking (pre-execution validation)
- Same quality standards (5 validation gates)
- Same coordination patterns (adapt to repo conventions)
- Serena MCP helps navigate existing code
- `.claude/` structure works in any repo

**Knowledge sharing:**

- First engineer documents patterns
- Team benefits from shared knowledge
- Repository intelligence accumulates

**This isn't just a greenfield exercise** - it's company-wide AI orchestration mastery

---

## Course Complete - What's Next

**Ongoing support:**

- `.claude/playbook/` files in your repos
- `/init-orchestration-partner` for ongoing methodology
- Peer network (other engineers from this cohort)
- Instructor office hours (if available)

**Continue learning:**

- Apply to different types of features
- Refine patterns based on your needs
- Contribute to `.claude/discoveries/` in your repos
- Share learnings with team

---

**Congratulations on completing AI Orchestration Mastery!** 🎉

You now have systematic methodology for orchestrating AI agents on complex software development - in greenfield AND brownfield codebases.
