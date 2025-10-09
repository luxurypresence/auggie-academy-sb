# Day 1 Morning: Tool Foundations

**Session 01 of 10**

**Session Goal:** Get Claude Code and MCP servers working, understand how to work effectively with AI agents

---

## 1. Claude Code Fundamentals

### What is Claude Code?

**Claude Code = Claude with developer superpowers**

Claude Code is NOT just "Claude in a terminal." It's an AI pair programmer with access to:

- **Your filesystem** (read/write/edit files)
- **Your terminal** (run commands, tests, git operations)
- **Your browser** (via Playwright - test features end-to-end)
- **Current documentation** (via Context7 - no outdated training data)

**Key Difference from Chat:**

- **Chat:** Conversational, you copy-paste code
- **Claude Code:** Autonomous, it edits files directly and runs commands

---

### Reading Claude Code Output

**Every Claude Code response has 3 parts:**

#### 1. Text Explanation

```
I'll create the User model with Sequelize...
```

This is Claude explaining its plan.

#### 2. Tool Calls (The Important Part)

```
<tool_use>
  <name>Write</name>
  <parameters>
    <file_path>/backend/models/user.js</file_path>
    <content>...</content>
  </parameters>
</tool_use>
```

This is Claude **taking action** - watch these!

#### 3. Tool Results

```
File created successfully at: /backend/models/user.js
```

This confirms the action worked (or shows errors).

**Pro Tip:** Focus on tool calls and results, not just text. That's where the work happens.

---

### When to Intervene vs Let It Work

#### ✅ Let Claude Code Work Autonomously

**When you see:**

- Multiple sequential tool calls (it has a plan)
- File edits that make sense
- Test runs with expected failures (it's debugging)
- Git operations with clear intent

**Example (let it work):**

```
Claude: "I'll fix the TypeScript errors..."
Tool: Edit user.model.ts (fix import)
Tool: Edit user.service.ts (fix type)
Tool: Bash pnpm run type-check
Result: ✔ No TypeScript errors

You: 👍 (Don't interrupt, it's working)
```

#### 🛑 Intervene When You See

**Red flags:**

- Same error repeating 3+ times (it's stuck)
- Editing wrong files (misunderstood your intent)
- Running dangerous commands (rm -rf, force push)
- Creating duplicate code (misunderstood existing structure)

**Example (intervene):**

```
Claude tries Fix #1: Result: Error X
Claude tries Fix #2: Result: Error X
Claude tries Fix #3: Result: Error X

You: "Stop. The issue is [explanation]. Try [approach]."
```

**Rule of thumb:** 3 failed attempts = time to redirect

---

### Understanding Errors

#### Error Type 1: Tool Execution Failed

**What you see:**

```
Error: File not found at /backend/models/user.js
```

**What it means:** Claude tried to edit a file that doesn't exist

**How to respond:**

```
You: "The file is at /src/backend/models/user.js (note the /src prefix)"
```

#### Error Type 2: Command Failed

**What you see:**

```
Bash command failed with exit code 1:
pnpm run type-check
Error: Cannot find module 'sequelize'
```

**What it means:** Missing dependency

**How to respond:**

```
You: "Install dependencies first: pnpm install"
```

(Claude will run it)

#### Error Type 3: Claude Is Confused

**What you see:**

```
Claude: "I'm not sure which approach to take..."
```

**What it means:** Ambiguous requirements

**How to respond:**

```
You: "Use Sequelize for the ORM (not TypeORM). Follow NestJS patterns."
```

(Be specific, not vague)

---

### Hands-On Practice

**Verify Claude Code is working:**

#### Test 1: File Operations

```
You: "Create a file test.txt with content 'Hello World'"

Expected:
- Tool: Write test.txt
- Result: File created successfully
- You can see test.txt in your editor
```

#### Test 2: Command Execution

```
You: "List files in the current directory"

Expected:
- Tool: Bash ls
- Result: [list of files]
```

#### Test 3: Error Handling

```
You: "Read the contents of fake-file.txt"

Expected:
- Tool: Read fake-file.txt
- Result: Error: File not found
- Claude: "The file doesn't exist. Would you like me to create it?"
```

**If all 3 work:** ✅ Claude Code is ready

---

### Common Gotchas

#### Gotcha #1: "Claude is slow today"

**Symptom:** Tool calls taking forever

**Likely cause:**

- MCP server not responding (Playwright, Context7)
- Command running but not completing (pnpm install, long test)

**Fix:**

```bash
# Check running processes
ps aux | grep node

# Kill stuck process if needed
pkill -f "pnpm test"
```

#### Gotcha #2: "Claude isn't following my instructions"

**Symptom:** Code doesn't match what you asked for

**Likely cause:**

- Ambiguous instructions ("make it better")
- Missing context (didn't explain existing architecture)

**Fix:**

```
Bad:  "Add authentication"
Good: "Add JWT authentication using Passport.js.
       Follow the pattern in auth.service.ts.
       Store tokens in localStorage."
```

#### Gotcha #3: "Claude keeps making the same mistake"

**Symptom:** Same error 3+ times

**Likely cause:**

- Claude is stuck in wrong mental model

**Fix:**

```
You: "Stop. Let me explain the architecture:
     - Backend uses NestJS (not Express)
     - Database is Sequelize (not TypeORM)
     - GraphQL uses Apollo Federation

     Try again with this context."
```

#### Gotcha #4: "I can't see what Claude is doing"

**Symptom:** Tool calls happening but no visible changes

**Likely cause:**

- Editor not refreshing
- Working in wrong directory

**Fix:**

```bash
# Verify working directory
pwd

# Force editor refresh
```

---

### Quick Reference: Claude Code Best Practices

**Do:**

- ✅ Be specific about tech stack (NestJS, Sequelize, etc.)
- ✅ Reference existing files/patterns when relevant
- ✅ Let Claude work through debugging (up to 3 attempts)
- ✅ Verify files actually changed (editor shows edits)

**Don't:**

- ❌ Give vague instructions ("make it work")
- ❌ Interrupt mid-workflow (let it complete the plan)
- ❌ Expect persistent memory across sessions (provide context each time)
- ❌ Assume errors are Claude's fault (often environment/setup issues)

---

### Bypass Permissions Mode

**What it is:** A setting that allows Claude Code to execute file operations and commands without asking for permission each time

**⚠️ Use with caution**

FOR THE RECORD - I have this globally set and I've never had any issues. It makes me SIGNIFICANTLY FASTER.

**How to enable:**

**Option 1: Per-session (temporary)**

```bash
# Start Claude Code with bypass permissions for this session only
claude --dangerously-skip-permissions
```

**Option 2: Globally (permanent - for all projects)**

Edit your global settings file at `~/.claude/settings.json`:

```json
{
  "permissions": {
    "defaultMode": "bypassPermissions"
  }
}
```

**What this does:**

- Applies bypass permissions to ALL Claude Code sessions
- No need to use `--dangerously-skip-permissions` flag every time
- Persists across all projects and sessions

**How to set it up:**

```bash
# Create or edit your
# - global settings file: ~/.claude/settings.json
# - project settings file: <your_repo>/.claude/settings.local.json

# Add the permissionMode setting
{
  "permissions": {
    "defaultMode": "bypassPermissions"
  }
}
```

---

### Pro Tip: Talk, Don't Type (Wispr Flow)

**Communication efficiency matters:**

- Typing detailed instructions takes time
- Voice is often faster and more natural
- You can explain complex context while Claude works

**[Wispr Flow](https://wisprflow.ai/):**

- Voice-to-text tool that works with Claude Code
- Talk to your agent instead of typing
- Especially useful for:
  - Long context explanations
  - Describing what you want while reviewing code
  - Quick clarifications and redirections

**When to use it:**

- Explaining architecture or existing patterns
- Describing what you want the agent to build
- Giving feedback on what Claude just did
- Any time typing feels like it's slowing you down

**Quick test:**

```
Try: Explain your project architecture out loud
vs:  Type the same explanation

Voice is usually 2-3x faster for detailed context.
```

**Not required** - but if you find yourself typing long explanations, consider talking instead.

---

### Useful Slash Commands

**Built-in Claude Code commands:**

```
/context   # Check context usage and see how much of your token limit you've used
/ide       # Connect to your IDE (VS Code, Cursor, etc.) for enhanced integration
/add-dir   # Add a directory to Claude's working context for better file awareness
/help      # Get help with Claude Code features and commands
/clear     # Clear conversation history (but keeps file context)
```

**Use `/context` when:** You want to monitor how much context you're using (helpful when sessions feel slow or you're approaching limits)

**Use `/ide` when:** You want to connect Claude Code to your editor for features like inline diffs and file navigation

**Use `/add-dir` when:** You want Claude to be aware of additional directories beyond your current working directory. This is especially useful when:

- Working in a monorepo with multiple packages
- Need Claude to reference files in a parent or sibling directory
- Want better file path suggestions and autocomplete from specific directories
- Example: `/add-dir src/frontend` or `/add-dir ../shared-components`

**Use `/help` when:** You want to see what Claude Code can do

**Use `/clear` when:** Conversation getting long and you want to start fresh (keeps your project context)

---

## 2. MCP Server Setup

### What Are MCP Servers?

**MCP (Model Context Protocol) servers** extend Claude Code with specialized capabilities:

- Access to up-to-date documentation
- Browser automation for testing
- File system operations

Think of them as **plugins that give Claude Code superpowers** for specific tasks.

**📖 For comprehensive details:** See [Chapter 14: MCP Server Configuration](../../chapters/14-mcp-servers.md) for in-depth coverage of global vs project-specific configuration, installation methods, and best practices.

---

### Essential MCP Servers for This Course

#### 1. [Filesystem MCP](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem)

**What it does:** Enhanced file operations (read/write/edit with better context)

**Quick verify:**

```
You: "Use Filesystem MCP to list files in this directory"

Expected: List of files with metadata
```

#### 2. [Playwright MCP](https://github.com/microsoft/playwright-mcp)

**What it does:** Browser automation - Claude can open browsers, click buttons, take screenshots

**Quick verify:**

```
You: "Use Playwright MCP to open google.com and take a screenshot"

Expected:
- Browser opens
- Screenshot saved
- Claude shows you the screenshot
```

**Why this matters for today:** You'll use this to test your dashboard actually works in the browser.

#### 3. [Context7 MCP](https://github.com/upstash/context7)

**What it does:** Retrieves current documentation for libraries (Sequelize, NestJS, etc.)

**Quick verify:**

```
You: "Use Context7 to get the latest Sequelize model definition syntax"

Expected: Current Sequelize documentation (not outdated training data)
```

**Why this matters for today:** NestJS and Sequelize patterns change - this ensures you get current best practices.

---

### MCP Server Installation

#### Understanding Global vs Project Scope

**MCP servers can be installed at two levels:**

1. **Global** - Available to all Claude Code sessions on your machine
2. **Project** - Only available when working in a specific project directory

**For this course:** We recommend **global installation** so MCP servers work everywhere.

#### Installing MCP Servers

**Using Claude Code built-in command:**

```bash
# Global installation (recommended for course)
claude mcp add <server-name>

# Project-specific installation
claude mcp add <server-name> --project
```

**Example - Install the three essential servers:**

```bash
# Install globally (works in all projects)
claude mcp add @modelcontextprotocol/server-filesystem
claude mcp add @microsoft/playwright-mcp
claude mcp add @upstash/context7
```

#### Manual Configuration (Advanced)

**MCP servers are configured in JSON files:**

**Global/User config:** `~/.claude.json` (in your home directory)

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/yourname/projects"
      ]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@microsoft/playwright-mcp"]
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7"],
      "env": {
        "UPSTASH_REDIS_REST_URL": "your-redis-url",
        "UPSTASH_REDIS_REST_TOKEN": "your-redis-token"
      }
    }
  }
}
```

**Project config:** `.mcp.json` (in your project root)

```json
{
  "mcpServers": {
    "serena": {
      "command": "npx",
      "args": ["-y", "@oraios/serena", "--cwd", "."]
    }
  }
}
```

**When to use project-specific config:**

- ✅ Project needs special MCP servers not used globally (like Serena for brownfield)
- ✅ Project requires different MCP configuration (specific API keys, paths)
- ❌ Don't duplicate servers that work fine globally (Playwright, Context7)

**Note:** Project-specific servers are **additional** to global servers, not replacements.

---

### Setup Checklist

- [ ] Filesystem MCP installed globally and responding
- [ ] Playwright MCP installed globally and can launch browser
- [ ] Context7 MCP installed globally and can retrieve docs
- [ ] All three verified with quick tests

**Verify installation:**

```bash
claude mcp list
```

Expected output:

```
Global MCP Servers:
  ✓ filesystem
  ✓ playwright
  ✓ context7
```

---

### MCP Troubleshooting Commands

#### Check MCP Server Status

```
/mcp
```

Shows status of all MCP servers (connected, disconnected, etc.)

**Use this when:** MCP tools seem slow or unresponsive

#### Check Context Usage

```
/context
```

Shows how much context your current session has used

**Why this matters:**

- MCP tools and sub-agents consume context
- Sessions have context limits
- If approaching limit, consider starting fresh session (use `/clear`)

**Be aware:** More MCP servers = more context per operation. Don't overload with unnecessary servers.

**Troubleshooting:** If any server isn't responding, run `/mcp` to check status, then ask instructor.

**📖 Learn more:** For detailed information about MCP server configuration, troubleshooting, and advanced topics, see [Chapter 14: MCP Server Configuration](../../chapters/14-mcp-servers.md).

---

## 3. Running Multiple Claude Code Instances

### Why Multiple Instances?

**You'll want to work on different parts simultaneously:**

- One instance: Backend (NestJS, Sequelize, GraphQL)
- Another instance: Frontend (React, forms, dashboard UI)
- Optional third: Testing, infrastructure, etc.

### How to Set Up

**Option 1: Terminal tabs/windows**

```bash
# Tab 1: Backend work
cd ~/project
claude

# Tab 2: Frontend work
cd ~/project
claude
```

**Option 2: Separate IDE windows**

- Open project in multiple IDE windows
- Each has its own terminal with Claude Code

### Label Your Instances

**Make it clear what each instance is doing:**

- Terminal title: "Backend Agent"
- Terminal title: "Frontend Agent"

**Why:** You'll be switching between them frequently. Clear labels prevent confusion.

---

## 4. Organizing Your Workspace for Multi-Agent Orchestration

### Why Organization Matters

**When orchestrating multiple AI agents:**

- You're switching between multiple terminals/windows constantly
- Each agent needs clear visual identification
- Context switching should be fast and error-free
- You need to see what each agent is doing at a glance

**Poor organization = accidentally giving instructions to the wrong agent = wasted time**

---

### Essential Tools / Tips

#### 1. ccstatusline - Custom Claude Code Status Lines

**What it does:** Customizes the status line at the bottom of your Claude Code terminal to show relevant context

**GitHub:** [sirmalloc/ccstatusline](https://github.com/sirmalloc/ccstatusline)

It helps to:

- Quickly identify which agent/context you're working in
- See important project info without asking
- See git details
- Etc

My personal setup is the following:

```bash
<current_directory>| ⎇ main | (+72,-1)
Model: Sonnet 4.5 (with 1M token context)
```

My line 1 looks like -

1. Custom Command (basename "$PWD") --> extracts the name of the current directory from its full path.
2. Separator |
3. Git Branch
4. Separator |
5. Git Changes

My line 2 looks like -

1. Model

**WARNING:** Unfortunately, I have found that all of the options to show context usage are pretty inaccurate with Sonnet 4.5 (I tested that by comparing what the statusline was reporting against what `/context` showed). Sadness :( I haven't found a way to accurately show context in the statusline as of now - if you figure it out - TELL US

---

#### 2. Claude Code VS Code Extension + `/ide` Command

**What it does:** Official VS Code extension that connects your terminal Claude Code session to your editor for enhanced integration

**VS Code Marketplace:** [Claude Code Extension](https://marketplace.visualstudio.com/items?itemName=anthropic.claude-code)

**Key features:**

- **Inline diffs** - See code changes directly in your editor with visual diff views
- **File navigation** - Jump to files Claude mentions or edits
- **Better context** - Claude can understand your editor state and open files
- **Integrated experience** - Bridge between terminal Claude and your IDE

**How to use the `/ide` command:**

1. **Install the extension** from VS Code marketplace
2. **Open VS Code** in your project directory
3. **Start Claude Code** in a standalone terminal (not VS Code's integrated terminal)
4. **Run `/ide`** in your Claude Code terminal session
5. **Connection established** - You'll see confirmation that Claude Code is connected to your editor

**What happens after connecting:**

- File edits show up as inline diffs in VS Code
- You can review and accept/reject changes in the editor
- Claude can see which files you have open
- Better coordination between terminal and editor workflows

**Pro tip:** Even when using `/ide`, still run Claude Code in a standalone terminal (not VS Code's integrated terminal) for better stability and scrollback.

---

#### 3. Peacock - VS Code Window Color Coding

**What it does:** Colors your VS Code workspace with distinct themes so you can instantly identify which window is which

**VS Code Marketplace:** [Peacock Extension](https://marketplace.visualstudio.com/items?itemName=johnpapa.vscode-peacock)

**Why you need it:**

- Instant visual identification of backend vs frontend windows, different repo windows, different git worktrees, etc
- Prevents accidentally editing in the wrong codebase
- Each project/agent gets its own color

---

#### 4. Run Claude Code in standalone terminals (not IDE integrated terminals)

**To be clear:** Using the `/ide` command to connect to your editor is great! What I'm recommending against is:

- ❌ Starting Claude Code sessions from within the IDE extension UI itself

**Instead:** ✅ Run `claude` in a standalone terminal app (iTerm2, Warp, Alacritty, etc.), then use `/ide` to connect it to your editor

**Why standalone terminals work better:**

- **Unlimited scrollback** - Real terminals give you endless history to scroll back through, which is crucial when debugging or reviewing agent actions
- **Better stability** - Integrated terminals often glitch or become unresponsive after long Claude Code sessions
- **Cleaner IDE experience** - Keeps your IDE focused on code editing, not cluttered with multiple terminal panes
- **More reliable behavior** - Running Claude Code directly in the IDE extension or integrated terminal can exhibit weird behavior with certain operations or after extended use

**Recommended workflow:**

1. Open standalone terminal (iTerm2, Warp, etc.)
2. Run `claude`
3. Use `/ide` to connect to VS Code/Cursor
4. Get the best of both worlds: stable terminal + editor integration

---

#### 5. Terminal Bell Notifications - Know When Claude Is Done

**Why it matters:** When orchestrating multiple agents, you need to know when each one completes a response so you can switch context or provide the next instruction.

**The problem:** You're working on something else and miss when Claude finishes responding.

**The solution:** Configure terminal bells to notify you when Claude completes.

**iTerm2 Setup (macOS):**

Navigate to: **Settings > Profiles > Terminal > Bell**

Enable these settings:

- ✅ **Flash visual bell** - Visual notification in terminal
- ✅ **Show bell icon in tabs** - See which tab got the notification
- ✅ **Notification Center alerts** - macOS notification popup
- ✅ **Filter alerts > Send escape sequence-generated alerts** - Ensure Claude's completion triggers the bell

**Bonus: Mac System Sound Settings**

Make the notification more attention-grabbing:

1. Open **System Settings > Sound > Alert Sound**
2. Choose something distinctive (I personally use **"Heroine"** - more noticeable than the default)

You may also need to run `claude config set --global preferredNotifChannel terminal_bell`.
Setting this alone didn't actually work for notifications. The instructions in the claude docs for iterm bells _also_ didn't work for me... 🤷‍♂️

---

## About the `.claude/` Directory

**You may notice a `.claude/` directory in your starter repo.**

**For today (Day 1):** Don't worry about it yet

- Focus on building features
- Learn the tools (Claude Code, MCP servers, multiple instances)
- Discover your own approach

**Tomorrow (Day 2):** We'll explore what's in there

- You'll see the systematic methodology files
- Understand what orchestration partner loads
- Learn how it's not "magic" - just documented patterns

**For now:** Ignore it and focus on building

---

## Morning Session Complete

**You should now have:**

- ✅ Claude Code fundamentals understood
- ✅ All 3 MCP servers verified working
- ✅ Multiple instances running and labeled
- ✅ Ready to build dashboard features this afternoon

---

---

**✅ Session 01 complete**

**See full trail:** [Companion overview](../README.md)
