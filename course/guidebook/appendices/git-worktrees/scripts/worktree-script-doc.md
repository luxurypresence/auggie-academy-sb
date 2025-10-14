# Git Worktree Tools - Quick Guide

A complete worktree management solution with two complementary scripts for creating and cleaning up Git worktrees.

## Installation

### Prerequisites

- Git 2.7+ (for worktree support)
- Node.js/npm/yarn/pnpm
- GitHub CLI (`gh`) for PR status checking

### Setup

1. **Initialize configuration files**:

```bash
./worktree.sh --init           # Creates .worktree-config
./worktree-cleanup.sh --init    # Creates .worktree-cleanup-config
```

2. **Install GitHub CLI** (for PR checking):

```bash
# macOS
brew install gh
gh auth login

# Linux
sudo apt install gh
gh auth login
```

---

## Script 1: Worktree Creator (`worktree.sh`)

Creates new worktrees with automatic environment setup, file copying, and package installation.

### Basic Usage

```bash
# Create new worktree with new branch
./worktree.sh my-feature         # Creates branch: gw-my-feature

# Use existing branch from origin
./worktree.sh -e feature/existing

# Quick options
./worktree.sh my-feature --no-install    # Skip package installation
./worktree.sh my-feature --no-editor     # Don't open editor
```

### Configuration (`.worktree-config`)

```bash
# Branch naming
BRANCH_PREFIX="gw-"              # Prefix for new branches
DEFAULT_BRANCH_SUFFIX="test"     # Default if no name provided
MAIN_BRANCH="main"               # or "master"

# Package manager
PACKAGE_MANAGER="auto"           # auto-detects from lock files
# Options: "auto", "npm", "yarn", "pnpm", "none"

# Editor
EDITOR="auto"                    # auto-detects installed editor
# Options: "auto", "cursor", "code", "none"

# Files to copy to new worktrees
COPY_FILES=(
    ".env"
    ".env.local"
    ".env.development"
    ".env.production"
)

# Paths to copy (relative to repo root)
COPY_PATH_PATTERNS=(
    ".vscode/settings.json"
    ".vscode/tasks.json"
)

# Directories to exclude when copying
EXCLUDE_DIRS=(
    "node_modules"
    ".git"
    ".next"
    "dist"
    "build"
)

# Commands to run after creation
POST_CREATE_COMMANDS=(
    "npm run prepare"
    "git config user.email 'team@company.com'"
)
```

### How It Works

1. **Stashes** any uncommitted changes
2. **Creates worktree** in sibling directory (e.g., `../repo-gw-feature/`)
3. **Copies** configured files from main worktree
4. **Installs** packages automatically
5. **Opens** in your editor
6. **Restores** stashed changes to original worktree

---

## Script 2: Worktree Cleanup (`worktree-cleanup.sh`)

Interactive tool to view and delete worktrees, with PR status checking.

### Basic Usage

```bash
# Interactive cleanup interface
./worktree-cleanup.sh

# Skip PR checking (faster)
./worktree-cleanup.sh --no-pr-check

# Auto-select merged PRs
./worktree-cleanup.sh --auto-merged
```

### Interactive Controls

| Key            | Action                   |
| -------------- | ------------------------ |
| `↑/↓` or `j/k` | Navigate list            |
| `Space`        | Toggle selection         |
| `a`            | Select all non-protected |
| `m`            | Select all merged PRs    |
| `u`            | Unselect all             |
| `d`            | Delete selected          |
| `r`            | Refresh PR statuses      |
| `q`            | Quit                     |

### Visual Interface

```
Git Worktree Cleanup Manager
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[ ] WORKTREE              BRANCH         PR STATUS    MERGED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[ ] main (protected)      main           PROTECTED    false
[X] gw-auth              gw-auth         PR #123      true   ← Green (merged)
[ ] gw-ui-fix            gw-ui-fix       PR #124      false  ← Cyan (open)
[X] gw-experiment        gw-experiment   NO PR        false  ← Yellow (no PR)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Status: Total: 4 | Selected: 2 | Merged: 1
Legend: ● Merged ● Open PR ● No PR ● Protected
```

### Configuration (`.worktree-cleanup-config`)

```bash
# GitHub integration
USE_GITHUB_CLI=true          # Use gh CLI for PR checking
CHECK_PR_STATUS=true         # Enable PR status checking
AUTO_DETECT_REPO=true        # Auto-detect GitHub repo

# Protected branches (won't be deleted)
PROTECTED_PATTERNS=(
    "main"
    "master"
    "develop"
    "release/.*"
    "hotfix/.*"
)

# UI Settings
SHOW_DEBUG_INFO=false        # Show debug output
CONFIRM_DELETION=true        # Require confirmation
AUTO_SELECT_MERGED=false     # Auto-select merged PRs

# Editor command (optional)
EDITOR_COMMAND="cursor"       # Open worktree in editor

# Cleanup commands (run before deletion)
PRE_DELETE_COMMANDS=(
    "docker-compose down 2>/dev/null || true"
)
```

---

## Common Workflows

### Daily Development Flow

```bash
# Morning: Create feature worktree
./worktree.sh user-auth

# Work on feature...
cd ../gw-user-auth
# Make changes, commit, push, create PR

# After PR is merged: Clean up
./worktree-cleanup.sh --auto-merged
# Press 'd' to delete merged worktrees
```

### Quick Experimentation

```bash
# Create test worktree without setup
./worktree.sh experiment --no-install --no-editor

# Later: Clean up all experiments
./worktree-cleanup.sh
# Press 'a' to select all, then 'd' to delete
```

### Working with Multiple Features

```bash
# Create multiple worktrees
./worktree.sh feature-1
./worktree.sh feature-2
./worktree.sh bugfix-1

# View all worktrees
git worktree list

# Clean up merged ones
./worktree-cleanup.sh
# Press 'm' to select merged, 'd' to delete
```

---

## Tips & Tricks

### Aliases

Add to `~/.bashrc` or `~/.zshrc`:

```bash
alias wt='./scripts/worktree.sh'
alias wtc='./scripts/worktree-cleanup.sh'
alias wtl='git worktree list'
```

### Quick Commands

```bash
# List all worktrees
git worktree list

# Manually remove a worktree
git worktree remove ../gw-feature --force
git branch -D gw-feature

# Check PR status manually
gh pr status
```

### Configuration Tips

- Set `AUTO_SELECT_MERGED=true` to pre-select merged PRs
- Use `EDITOR_COMMAND` to quickly jump between worktrees
- Add project-specific setup to `POST_CREATE_COMMANDS`

---

## Troubleshooting

### Common Issues

**"GitHub CLI not installed"**

```bash
brew install gh && gh auth login
```

**"Cannot delete worktree"**

- Has uncommitted changes → Script uses `--force`
- Branch checked out elsewhere → Delete manually

**"Config file in wrong place"**

- Scripts always create configs in repository root
- Can be run from any subdirectory

**"No PR status shown"**

- Check `gh auth status`
- Ensure repository is on GitHub
- Branch must be pushed to origin

### Debug Mode

```bash
# Enable debug output
./worktree-cleanup.sh --debug
```

---

## Quick Reference

### Worktree Creator Options

- `--init` - Create config file
- `-e, --existing` - Use existing branch
- `--no-install` - Skip package installation
- `--no-editor` - Don't open editor
- `-h, --help` - Show help

### Cleanup Manager Options

- `--init` - Create config file
- `--no-pr-check` - Skip PR checking
- `--auto-merged` - Auto-select merged PRs
- `--debug` - Show debug info
- `-h, --help` - Show help

---

_Version 2.0.0 | Requires Git 2.7+, Bash 4.0+_
