# Day 5: Polish, Demos & Brownfield Extension

**Session 05 of 5**

**Today's Goal:** Complete any missing work, polish your CRM, demo your work, and prepare for company application

---

## Morning (9:00am-12:00pm): Choose Your Path

**Pick the path that matches where you are:**

---

### Path A: Complete Required Features (If Behind)

**Focus on getting core curriculum complete:**

**Check what's missing:**
- [ ] Infrastructure + CRUD (Day 1 required)
- [ ] AI summaries with persistent storage (Day 2 required)
- [ ] AI activity scoring with persistent storage (Day 2 required)
- [ ] AI task recommendations with persistent storage (Day 2 required)
- [ ] JWT authentication (Day 3 required)
- [ ] Real-time WebSocket notifications with persistence (Day 3 required)
- [ ] Mobile app foundation (Day 4 required)

**Goal:** Get all required features working by noon

**Support available:**
- Instructors for troubleshooting
- Office hours for methodology help
- Peer collaboration encouraged

**Run all 5 validation gates:**
```bash
cd ~/auggie-academy-<your-name>
pnpm run type-check  # 0 errors
pnpm run lint        # 0 warnings
pnpm test            # All passing
# Check for hanging processes
# Browser/mobile testing: Features work
```

---

### Path B: Polish & Refinement (If Core Complete)

**If core complete, improve what you have:**

#### Code Quality Improvements

- [ ] Refactor messy code from Day 1
- [ ] Add error handling edge cases
- [ ] Improve test coverage (more integration tests)
- [ ] Add loading states and better UX
- [ ] Clean up console logs and debug code

**Focus areas:**
- Identify messy code sections from early days
- Add comprehensive error handling
- Increase integration test coverage
- Improve user experience with better loading states
- Remove debugging artifacts

---

#### Documentation

- [ ] Write comprehensive README with setup instructions
- [ ] Document API endpoints (request/response formats)
- [ ] Add code comments for complex logic
- [ ] Create troubleshooting guide for common issues

**Focus areas:**
- Clear setup instructions for new engineers
- API documentation (endpoints, params, responses)
- Comments explaining non-obvious logic
- Common errors and how to fix them

---

#### Performance

- [ ] Add caching for LLM results (avoid recalculating scores)
- [ ] Optimize database queries (reduce N+1 problems)
- [ ] Add pagination for large lead lists
- [ ] Improve loading states and UX

**Focus areas:**
- Cache AI-generated summaries/scores (don't regenerate unnecessarily)
- Identify and fix N+1 query problems
- Add pagination to prevent slow page loads
- Better loading indicators for async operations

---

**Goal:** Production-quality polish

---

### Path C: Stretch Goals (If Core Complete + Want Challenge)

**Choose based on interest:**

---

#### Option 1: Continue PM-Suggested Features (If Built PM Agent)

**Unlimited features available from your PM agent:**

- [ ] Implement additional features from PM roadmap
- [ ] Apply full methodology for each feature
- [ ] Run 5 validation gates for each implementation
- [ ] Document learnings in `.claude/experiments/`

**What you'll learn:**
- Sustained orchestration over multiple features
- Building product roadmap systematically
- Accumulating implementation patterns

**Complexity:** Varies by feature
**Time:** 2-4 hours per feature

---

#### Option 2: Google OAuth 2.0

**What you'll build:**

- [ ] Passport.js Google strategy
- [ ] OAuth callback handling
- [ ] "Sign in with Google" button
- [ ] Link existing accounts to Google
- [ ] Environment-specific redirect URIs

**What you'll learn:**
- External service integration
- OAuth 2.0 flows
- Managing redirect URIs
- Environment-specific configuration

**Implementation considerations:**
- Google Cloud Console setup (OAuth credentials)
- Redirect URI configuration (dev vs production)
- User account linking strategy
- Session management with OAuth tokens

**Complexity:** Medium
**Time:** 2-3 hours

---

#### Option 3: Advanced Mobile Features

**What you'll add to mobile:**

- [ ] Edit lead functionality
- [ ] Create/complete tasks on mobile
- [ ] Add new interactions
- [ ] Full CRUD on mobile (not just read-only)
- [ ] Offline mode with data sync
- [ ] Push notifications
- [ ] Geolocation for check-ins

**What you'll learn:**
- React Native forms
- Mobile-specific UX patterns
- Keeping web and mobile feature parity
- Offline-first architecture
- Push notification setup

**Implementation considerations:**
- Form handling in React Native
- Optimistic UI updates
- Sync strategy for offline changes
- Push notification permissions

**Complexity:** Medium
**Time:** 2-3 hours

---

#### Option 4: Analytics Dashboard

**What you'll build:**

- [ ] Data visualization (charts, graphs)
- [ ] Lead pipeline funnel
- [ ] Activity trends over time
- [ ] Conversion metrics

**What you'll learn:**
- Data aggregation queries
- Chart library integration (Recharts, Chart.js)
- Real-time dashboard updates
- Performance optimization for analytics

**Implementation considerations:**
- Database queries for aggregation
- Chart library selection
- Real-time updates vs periodic refresh
- Caching strategy for expensive queries

**Complexity:** Medium-High
**Time:** 3-4 hours

---

#### Option 5: Enhanced Real-Time Features

**What you'll build:**

- [ ] Multi-user presence ("User X is viewing Lead Y")
- [ ] Collaborative editing awareness
- [ ] Team activity feed
- [ ] Notification preferences

**What you'll learn:**
- Advanced WebSocket patterns
- Presence tracking
- Multi-user coordination
- User preference management

**Implementation considerations:**
- WebSocket room management
- Presence state tracking
- Throttling activity updates
- User notification settings UI

**Complexity:** Medium-High
**Time:** 2-3 hours

---

#### Option 6: Explore Brownfield Preparation

**Practice applying methodology to existing codebases:**

**What you'll do:**
- [ ] Use Serena MCP on a complex codebase (your company repo or sample)
- [ ] Create `.claude/` structure for the repo
- [ ] Document: tech stack, common patterns, critical gotchas
- [ ] Try orchestrating a small feature

**What you'll learn:**
- Applying methodology to real company work
- Using Serena to understand existing code
- Creating per-repo documentation
- Preparing for Monday

**This prepares you for afternoon brownfield session**

**Complexity:** Medium
**Time:** 2-3 hours

---

## Afternoon (1:00pm-5:00pm): Demos + Brownfield Extension

**Everyone participates in afternoon sessions (required)**

---

### Part 1: Individual Demos (1:00pm-3:00pm)

#### Demo Preparation (1:00-2:00 PM)

**Polish Your Application:**

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

#### Prepare Your Demo Story (3 minutes)

**What to prepare:**

**1. Quick demo (2 minutes):**

- Show 2-3 key features working
- Lead list → detail page → AI features
- One impressive moment (AI summary, scoring, recommendations)

**Suggested flow:**
- Start with lead dashboard
- Click into a lead detail page
- Show AI-generated summary
- Show activity scoring
- Show task recommendations
- Demonstrate one special feature (WebSocket, mobile, etc.)

**2. One key insight (1 minute):**

- What's your biggest learning about AI orchestration?
- What surprised you most this week?
- What will you apply on Monday?

**Keep it brief** - you'll have 3 minutes total

---

#### Demo Format (2:00-3:00 PM)

**Demo structure:**
- 3-5 minutes per engineer
- Show what you built (wherever you got)
- Share one key learning or insight
- No judgment on completion level

**Minimum to demo:**
- Working CRM dashboard (CRUD)
- At least one AI feature
- Mobile app (if complete)

**Celebrate what you built** - no matter how far you got

---

### Part 2: Brownfield Extension (3:00pm-5:00pm)

**⚠️ This session is REQUIRED for everyone**

**Instructor-led demonstration of applying methodology to company codebases**

---

#### Why Methodology Matters for Company Work

**You've learned orchestration in greenfield (fresh start):**

- Clean slate
- No existing patterns to follow
- You define all conventions
- Everything is new

**Monday you return to brownfield (complex existing codebases):**

- 10K+ lines of code
- Established tech stack
- Existing patterns and conventions
- Integration points to respect
- Known gotchas and issues
- Multiple engineers coordinating

**Challenge:** How does methodology transfer to complex existing codebases?

**Answer:** Systematic discovery + per-repo documentation

---

#### The Solution: Per-Repo Methodology Partner

**Live demonstration using Serena MCP:**

---

##### Step 1: Understand Existing Codebase

```
Instructor: "Let's look at a complex company repo (auth-service).
First, use Serena MCP to understand what exists:"

Serena queries:
- "What tech stack is used?" → NestJS, TypeORM, Redis
- "Find all authentication-related code" → Services, guards, strategies
- "What patterns exist?" → Repository pattern, Guards, DTOs, Event emitters
```

**Serena helps you understand BEFORE building**

**Key insight:** In brownfield, you must discover patterns first (can't invent new ones)

---

##### Step 2: Document Patterns in `.claude/`

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
- Prevents rediscovering same patterns/gotchas

---

##### Step 3: Initialize Partner for This Repo

```bash
cd ~/your-company-repo
/init-orchestration-partner
```

**Partner loads:**

- Repo identity (tech stack, architecture)
- Common patterns (how things are done here)
- Critical gotchas (known issues to avoid)
- Same orchestration methodology (proven patterns)

**Partner now knows THIS repo's context**

---

##### Step 4: Orchestrate Feature in Brownfield

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

#### The Compound Knowledge Effect

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

#### Your Monday Action Plan

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

## Individual Reflection (Optional)

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

## Course Complete! 🎉

**By end of this week, you've built:**

- ✅ Complete CRM with CRUD operations
- ✅ AI intelligence layer (summaries, scoring, recommendations)
- ✅ Task management system
- ✅ Authentication with protected routes
- ✅ Real-time WebSocket notifications with persistence
- ✅ Mobile application (React Native)
- ✅ (Optional) PM agent + PM-suggested features
- ✅ (Optional) Advanced features based on your interests

**Technical accomplishments:**

- ✅ 7+ major features implemented
- ✅ Multi-platform (web + mobile)
- ✅ 80%+ test coverage (unit + integration)
- ✅ All 5 validation gates passing
- ✅ Production-quality application

---

**You've learned:**

**Core methodology:**
- ✅ Infrastructure-first pattern
- ✅ Coordination through convention (field naming locks, schema as contract)
- ✅ 5 validation gates (comprehensive quality standard)
- ✅ Two-tier testing strategy
- ✅ Sequential vs parallel execution analysis
- ✅ Pre-execution validation protocol
- ✅ Strategic orchestration with partner

**Transferable skills:**
- ✅ AI agent orchestration strategies
- ✅ Multi-platform development (web + mobile)
- ✅ Complex feature coordination
- ✅ Testing strategies for AI features
- ✅ Real-time systems implementation
- ✅ Strategic vs tactical execution
- ✅ Brownfield application (Serena + per-repo `.claude/`)

---

**Monday: Take This Back to Your Real Work**

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

---

**✅ Day 5 complete - Course finished!**

**See full trail:** [Companion overview](README.md)
