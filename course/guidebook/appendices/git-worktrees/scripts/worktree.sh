#!/bin/bash

# Git worktree management script with configuration file copying
# Version: 2.0.0

# Configuration file - can be customized per repository
CONFIG_FILE=".worktree-config"

# Default configuration
DEFAULT_CONFIG=$(cat <<'EOF'
# Worktree Manager Configuration
# This file configures the behavior of the worktree management script

# Branch prefix for new branches (e.g., "gw-" creates branches like "gw-feature")
BRANCH_PREFIX="gw-"

# Default branch suffix when none is provided
DEFAULT_BRANCH_SUFFIX="test"

# Main branch name (usually "main" or "master")
MAIN_BRANCH="main"

# Package manager (npm, yarn, pnpm, or none)
PACKAGE_MANAGER="auto"

# Editor to open after creating worktree (code, cursor, vim, none, or auto)
EDITOR="auto"

# Files to copy (simple filenames that can appear anywhere)
# Add one file per line
COPY_FILES=(
    ".env"
    ".env.local"
    ".env.development"
    ".env.production"
)

# Path patterns to copy (relative paths from repo root)
# These are matched as */pattern
COPY_PATH_PATTERNS=(
    ".vscode/settings.json"
    ".vscode/tasks.json"
)

# Directories to exclude when searching for files to copy
EXCLUDE_DIRS=(
    "node_modules"
    ".git"
    ".next"
    "dist"
    "build"
    ".turbo"
    ".ruff_cache"
    "__pycache__"
    ".pytest_cache"
    "venv"
    ".venv"
)

# Custom setup commands to run after worktree creation
# These run in the new worktree directory
POST_CREATE_COMMANDS=(
    # Example: "npm run prepare"
    # Example: "git config user.email 'team@company.com'"
)

# MCP template directory (relative to main worktree)
# Leave empty if not using MCP templates
MCP_TEMPLATE_DIR="mcp-json-templates"
EOF
)

# Function to display help
show_help() {
    echo "Usage: $(basename $0) [OPTIONS] [branch-name]"
    echo ""
    echo "Creates a git worktree with configuration files and opens it in your editor."
    echo ""
    echo "OPTIONS:"
    echo "  -h, --help      Show this help message"
    echo "  -e, --existing  Use an existing branch from origin instead of creating new"
    echo "  --mcp PURPOSE   Activate a specific MCP template (if configured)"
    echo "  --init          Initialize a .worktree-config file in the current repository"
    echo "  --no-install    Skip package installation"
    echo "  --no-editor     Don't open editor after creation"
    echo ""
    echo "ARGUMENTS:"
    echo "  branch-name     For new branches: suffix for configured prefix"
    echo "                  For existing: full branch name"
    echo "                  Default: configured default or 'test'"
    echo ""
    echo "EXAMPLES:"
    echo "  $(basename $0) --init                  # Initialize config file"
    echo "  $(basename $0) my-feature              # Creates new prefixed branch"
    echo "  $(basename $0) -e feature/existing     # Uses existing branch"
    echo ""
    echo "CONFIGURATION:"
    echo "  The script looks for .worktree-config in the repository root."
    echo "  Run with --init to create a default configuration file."
}

# Function to initialize configuration file
init_config() {
    local config_path="$1/.worktree-config"
    
    if [ -f "$config_path" ]; then
        echo "Configuration file already exists at: $config_path"
        read -p "Overwrite? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Initialization cancelled."
            return 1
        fi
    fi
    
    echo "$DEFAULT_CONFIG" > "$config_path"
    echo "✅ Configuration file created at: $config_path"
    echo ""
    echo "You can now customize the following:"
    echo "  - Branch naming convention"
    echo "  - Files to copy to new worktrees"
    echo "  - Package manager preferences"
    echo "  - Post-creation commands"
    echo ""
    echo "Edit $config_path to customize for your repository."
    return 0
}

# Function to load configuration
load_config() {
    local repo_root="$1"
    local config_path="$repo_root/.worktree-config"
    
    # Set defaults
    BRANCH_PREFIX="gw-"
    DEFAULT_BRANCH_SUFFIX="test"
    MAIN_BRANCH="main"
    PACKAGE_MANAGER="auto"
    EDITOR="auto"
    COPY_FILES=()
    COPY_PATH_PATTERNS=()
    EXCLUDE_DIRS=("node_modules" ".git" ".next" "dist" "build")
    POST_CREATE_COMMANDS=()
    MCP_TEMPLATE_DIR=""
    
    # Load config if it exists
    if [ -f "$config_path" ]; then
        source "$config_path"
        echo "Loaded configuration from: $config_path"
    else
        echo "No configuration file found. Using defaults."
        echo "Run '$(basename $0) --init' to create a configuration file."
        echo ""
    fi
}

# Function to detect package manager
detect_package_manager() {
    local worktree_path="$1"
    
    if [ "$PACKAGE_MANAGER" != "auto" ]; then
        echo "$PACKAGE_MANAGER"
        return
    fi
    
    # Auto-detect based on lock files
    if [ -f "$worktree_path/pnpm-lock.yaml" ]; then
        echo "pnpm"
    elif [ -f "$worktree_path/yarn.lock" ]; then
        echo "yarn"
    elif [ -f "$worktree_path/package-lock.json" ]; then
        echo "npm"
    elif [ -f "$worktree_path/package.json" ]; then
        echo "npm"  # Default to npm if package.json exists
    elif [ -f "$worktree_path/requirements.txt" ] || [ -f "$worktree_path/Pipfile" ]; then
        echo "python"
    elif [ -f "$worktree_path/Gemfile" ]; then
        echo "bundler"
    else
        echo "none"
    fi
}

# Function to detect editor
detect_editor() {
    if [ "$EDITOR" != "auto" ]; then
        echo "$EDITOR"
        return
    fi
    
    # Auto-detect available editors
    if command -v cursor >/dev/null 2>&1; then
        echo "cursor"
    elif command -v code >/dev/null 2>&1; then
        echo "code"
    elif command -v subl >/dev/null 2>&1; then
        echo "subl"
    elif command -v vim >/dev/null 2>&1; then
        echo "vim"
    else
        echo "none"
    fi
}

# Function to find and copy configuration files
find_and_copy_config_files() {
    local repo_root="$1"
    local target_root="$2"
    
    if [ ${#COPY_FILES[@]} -eq 0 ] && [ ${#COPY_PATH_PATTERNS[@]} -eq 0 ]; then
        echo "No files configured for copying."
        return
    fi
    
    echo "Copying configuration files..."
    
    local found_count=0
    local copied_count=0
    
    # Build exclude pattern for find command
    local exclude_args=""
    for dir in "${EXCLUDE_DIRS[@]}"; do
        exclude_args="$exclude_args -path '*/$dir' -prune -o"
    done
    
    # Find and copy simple filename patterns
    for filename in "${COPY_FILES[@]}"; do
        while IFS= read -r file; do
            [ -z "$file" ] && continue
            
            local relative_path="${file#$repo_root/}"
            if [ "$relative_path" != "$file" ] && [ -n "$relative_path" ]; then
                ((found_count++))
                
                local source_file="$file"
                local target_file="$target_root/$relative_path"
                local target_dir="$(dirname "$target_file")"
                
                if mkdir -p "$target_dir" && cp "$source_file" "$target_file" 2>/dev/null; then
                    echo "  ✓ Copied $relative_path"
                    ((copied_count++))
                else
                    echo "  ⚠ Failed to copy $relative_path"
                fi
            fi
        done < <(eval "find '$repo_root' $exclude_args -type f -name '$filename' -print 2>/dev/null")
    done
    
    # Find and copy path-based patterns
    for path_pattern in "${COPY_PATH_PATTERNS[@]}"; do
        while IFS= read -r file; do
            [ -z "$file" ] && continue
            
            local relative_path="${file#$repo_root/}"
            if [ "$relative_path" != "$file" ] && [ -n "$relative_path" ]; then
                ((found_count++))
                
                local source_file="$file"
                local target_file="$target_root/$relative_path"
                local target_dir="$(dirname "$target_file")"
                
                if mkdir -p "$target_dir" && cp "$source_file" "$target_file" 2>/dev/null; then
                    echo "  ✓ Copied $relative_path"
                    ((copied_count++))
                else
                    echo "  ⚠ Failed to copy $relative_path"
                fi
            fi
        done < <(eval "find '$repo_root' $exclude_args -type f -path '*/$path_pattern' -print 2>/dev/null")
    done
    
    if [ $found_count -gt 0 ]; then
        echo "  Configuration files: $copied_count/$found_count copied successfully"
    fi
}

# Function to install packages
install_packages() {
    local worktree_path="$1"
    local pkg_manager="$2"
    
    if [ "$SKIP_INSTALL" = true ]; then
        echo "Skipping package installation (--no-install flag)"
        return
    fi
    
    case "$pkg_manager" in
        npm)
            echo "Installing packages with npm..."
            cd "$worktree_path" && npm install
            ;;
        yarn)
            echo "Installing packages with yarn..."
            cd "$worktree_path" && yarn install
            ;;
        pnpm)
            echo "Installing packages with pnpm..."
            cd "$worktree_path" && pnpm install
            ;;
        python)
            echo "Python project detected. Consider running:"
            echo "  cd $worktree_path && pip install -r requirements.txt"
            ;;
        bundler)
            echo "Ruby project detected. Consider running:"
            echo "  cd $worktree_path && bundle install"
            ;;
        none)
            ;;
        *)
            echo "Unknown package manager: $pkg_manager"
            ;;
    esac
}

# Function to activate MCP template
activate_mcp_template() {
    local template_name="$1"
    local worktree_path="$2"
    local main_worktree="$3"
    
    if [ -z "$MCP_TEMPLATE_DIR" ]; then
        echo "MCP templates not configured"
        return 1
    fi
    
    local templates_dir="$main_worktree/$MCP_TEMPLATE_DIR"
    local template_file="$templates_dir/.mcp.$template_name.json"
    
    if [ ! -f "$template_file" ]; then
        echo "Error: MCP template '$template_name' not found at $template_file"
        return 1
    fi
    
    echo "Activating MCP template: $template_name"
    cp "$template_file" "$worktree_path/.mcp.json"
    echo "  ✓ Copied .mcp.$template_name.json to .mcp.json"
}

# Function to run post-create commands
run_post_create_commands() {
    local worktree_path="$1"
    
    if [ ${#POST_CREATE_COMMANDS[@]} -eq 0 ]; then
        return
    fi
    
    echo "Running post-create commands..."
    cd "$worktree_path"
    
    for cmd in "${POST_CREATE_COMMANDS[@]}"; do
        echo "  Running: $cmd"
        if eval "$cmd"; then
            echo "  ✓ Success"
        else
            echo "  ⚠ Failed: $cmd"
        fi
    done
}

# Main script starts here

# Parse command line arguments (first pass for --init and --help)
# We need to handle --init early but after we find the repo root
NEED_INIT=false
SHOW_HELP=false

for arg in "$@"; do
    case $arg in
        --init)
            NEED_INIT=true
            ;;
        -h|--help)
            SHOW_HELP=true
            ;;
    esac
done

# Show help if requested (doesn't need repo)
if [ "$SHOW_HELP" = true ]; then
    show_help
    exit 0
fi

# Get the git repository root
CURRENT_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"
if [ -z "$CURRENT_ROOT" ]; then
    echo "Error: Not in a git repository"
    exit 1
fi

# Find the main worktree
GIT_COMMON_DIR="$(git rev-parse --git-common-dir 2>/dev/null)"
if [ "$GIT_COMMON_DIR" = ".git" ] || [ "$GIT_COMMON_DIR" = "$(pwd)/.git" ]; then
    MAIN_WORKTREE="$CURRENT_ROOT"
else
    MAIN_WORKTREE="$(dirname "$GIT_COMMON_DIR")"
fi

# Handle --init after we know the repo root
if [ "$NEED_INIT" = true ]; then
    init_config "$MAIN_WORKTREE"
    exit $?
fi

# Parse remaining command line arguments
MCP_TEMPLATE=""
BRANCH_INPUT=""
USE_EXISTING=false
SKIP_INSTALL=false
SKIP_EDITOR=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            # Already handled above
            shift
            ;;
        --init)
            # Already handled above
            shift
            ;;
        -e|--existing)
            USE_EXISTING=true
            shift
            ;;
        --mcp)
            if [ -n "$2" ] && [[ ! "$2" =~ ^- ]]; then
                MCP_TEMPLATE="$2"
                shift 2
            else
                echo "Error: --mcp requires a template name"
                exit 1
            fi
            ;;
        --no-install)
            SKIP_INSTALL=true
            shift
            ;;
        --no-editor)
            SKIP_EDITOR=true
            shift
            ;;
        -*)
            echo "Unknown option: $1"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
        *)
            BRANCH_INPUT="$1"
            shift
            ;;
    esac
done

# Load configuration
load_config "$MAIN_WORKTREE"

# If no argument provided, use default
if [ -z "$BRANCH_INPUT" ]; then
    BRANCH_INPUT="$DEFAULT_BRANCH_SUFFIX"
fi

# Determine branch name based on whether using existing or creating new
if [ "$USE_EXISTING" = true ]; then
    BRANCH_NAME="$BRANCH_INPUT"
    LOCAL_BRANCH_NAME="${BRANCH_NAME#origin/}"
else
    # Check if the input already has the prefix
    if [[ "$BRANCH_INPUT" == "$BRANCH_PREFIX"* ]]; then
        BRANCH_NAME="$BRANCH_INPUT"
    else
        BRANCH_NAME="${BRANCH_PREFIX}${BRANCH_INPUT}"
    fi
    LOCAL_BRANCH_NAME="$BRANCH_NAME"
fi

# Create worktree directory name by replacing slashes with dashes
WORKTREE_DIR=$(echo "$LOCAL_BRANCH_NAME" | tr '/' '-')

echo "Repository root: $MAIN_WORKTREE"
echo "Creating worktree: $WORKTREE_DIR"
if [ "$USE_EXISTING" = true ]; then
    echo "Using existing branch: $BRANCH_NAME"
else
    echo "Creating new branch: $BRANCH_NAME"
fi

# Stash any uncommitted changes
echo "Checking for uncommitted changes..."
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "Stashing uncommitted changes..."
    git stash push -m "Auto-stash before creating worktree $BRANCH_NAME"
    STASHED=true
else
    STASHED=false
fi

# Ensure we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "$MAIN_BRANCH" ]; then
    echo "Switching to $MAIN_BRANCH branch..."
    git checkout "$MAIN_BRANCH" || {
        echo "Error: Could not checkout $MAIN_BRANCH branch"
        echo "Make sure MAIN_BRANCH is set correctly in .worktree-config"
        exit 1
    }
fi

# Update git references
echo "Fetching latest from origin..."
git fetch origin

# Pull latest main branch only if creating a new branch
if [ "$USE_EXISTING" = false ]; then
    echo "Pulling latest $MAIN_BRANCH branch..."
    git pull origin "$MAIN_BRANCH"
fi

# Create the worktree
WORKTREES_PARENT="$(dirname "$MAIN_WORKTREE")"
NEW_WORKTREE_PATH="$WORKTREES_PARENT/$WORKTREE_DIR"

echo "Creating git worktree at: $NEW_WORKTREE_PATH"

if [ "$USE_EXISTING" = true ]; then
    # Check if branch exists on origin
    if ! git ls-remote --heads origin "$LOCAL_BRANCH_NAME" | grep -q "$LOCAL_BRANCH_NAME"; then
        echo "Error: Branch '$LOCAL_BRANCH_NAME' not found on origin"
        echo "Available remote branches:"
        git branch -r | grep -v HEAD | sed 's/origin\///' | head -20
        exit 1
    fi
    
    git worktree add "$NEW_WORKTREE_PATH" "$LOCAL_BRANCH_NAME"
else
    git worktree add "$NEW_WORKTREE_PATH" -b "$BRANCH_NAME"
fi

if [ $? -eq 0 ]; then
    echo "✅ Worktree created successfully!"
    
    # Copy configuration files
    find_and_copy_config_files "$MAIN_WORKTREE" "$NEW_WORKTREE_PATH"
    
    # Handle MCP template activation if requested
    if [ -n "$MCP_TEMPLATE" ]; then
        activate_mcp_template "$MCP_TEMPLATE" "$NEW_WORKTREE_PATH" "$MAIN_WORKTREE"
    fi
    
    # Detect and install packages
    PKG_MANAGER=$(detect_package_manager "$NEW_WORKTREE_PATH")
    if [ "$PKG_MANAGER" != "none" ]; then
        install_packages "$NEW_WORKTREE_PATH" "$PKG_MANAGER"
    fi
    
    # Run post-create commands
    run_post_create_commands "$NEW_WORKTREE_PATH"
    
    echo
    echo "🎉 SUCCESS! Git worktree created."
    echo "Worktree location: $NEW_WORKTREE_PATH"
    echo "Branch: $LOCAL_BRANCH_NAME"
    
    # Open in editor if configured
    if [ "$SKIP_EDITOR" = false ]; then
        EDITOR_CMD=$(detect_editor)
        if [ "$EDITOR_CMD" != "none" ]; then
            echo "Opening in $EDITOR_CMD..."
            case "$EDITOR_CMD" in
                vim)
                    cd "$NEW_WORKTREE_PATH"
                    vim .
                    ;;
                *)
                    $EDITOR_CMD "$NEW_WORKTREE_PATH"
                    ;;
            esac
        fi
    fi
    
    # Return to original directory
    cd "$CURRENT_ROOT"
    
    # If we stashed changes, apply them back
    if [ "$STASHED" = true ]; then
        echo "Applying stashed changes back to $MAIN_BRANCH..."
        git stash pop
    fi
else
    echo "❌ Failed to create worktree"
    exit 1
fi