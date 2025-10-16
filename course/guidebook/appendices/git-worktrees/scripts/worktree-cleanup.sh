#!/bin/bash

# Git Worktree Cleanup Manager - Interactive CLI
# Manages worktrees with PR status checking and deletion
# Version: 2.0.0

# Configuration file
CONFIG_FILE=".worktree-cleanup-config"

# Default configuration
DEFAULT_CLEANUP_CONFIG=$(cat <<'EOF'
# Worktree Cleanup Manager Configuration

# GitHub CLI settings
USE_GITHUB_CLI=true
CHECK_PR_STATUS=true

# Auto-detection settings
AUTO_DETECT_REPO=true

# Protected worktrees (regex patterns that shouldn't be deleted)
PROTECTED_PATTERNS=(
    "main"
    "master"
    "develop"
    "release/.*"
    "hotfix/.*"
)

# UI Settings
SHOW_DEBUG_INFO=false
CONFIRM_DELETION=true
AUTO_SELECT_MERGED=false

# Editor to open after selection (optional)
EDITOR_COMMAND=""

# Custom cleanup commands to run before deletion (per worktree)
PRE_DELETE_COMMANDS=(
    # Example: "docker-compose down"
    # Example: "npm run cleanup"
)

# Exit behavior
EXIT_TO_DIRECTORY=""  # Leave empty for current dir, or set path like "~/repos"
EOF
)

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'
REVERSE='\033[7m'

# Arrays to store worktree data
declare -a worktrees
declare -a branches
declare -a pr_statuses
declare -a pr_merged
declare -a selected
declare -a worktree_paths

# Configuration variables
USE_GITHUB_CLI=true
CHECK_PR_STATUS=true
AUTO_DETECT_REPO=true
PROTECTED_PATTERNS=()
SHOW_DEBUG_INFO=false
CONFIRM_DELETION=true
AUTO_SELECT_MERGED=false
EDITOR_COMMAND=""
PRE_DELETE_COMMANDS=()
EXIT_TO_DIRECTORY=""

# Function to display help
show_help() {
    echo "Git Worktree Cleanup Manager - Interactive CLI"
    echo ""
    echo "Usage: $(basename $0) [OPTIONS]"
    echo ""
    echo "OPTIONS:"
    echo "  -h, --help       Show this help message"
    echo "  --init           Initialize a configuration file"
    echo "  --no-pr-check    Skip PR status checking"
    echo "  --auto-merged    Auto-select merged PRs on start"
    echo "  --debug          Show debug information"
    echo ""
    echo "INTERACTIVE CONTROLS:"
    echo "  ↑/↓ or j/k      Navigate through worktrees"
    echo "  Space           Toggle selection"
    echo "  a               Select all non-protected worktrees"
    echo "  m               Select all merged PRs"
    echo "  u               Unselect all"
    echo "  d               Delete selected worktrees"
    echo "  r               Refresh PR statuses"
    echo "  o               Open selected in editor"
    echo "  q               Quit"
}

# Function to initialize configuration
init_config() {
    local config_path="$1/.worktree-cleanup-config"
    
    if [ -f "$config_path" ]; then
        echo "Configuration file already exists at: $config_path"
        read -p "Overwrite? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Initialization cancelled."
            return 1
        fi
    fi
    
    echo "$DEFAULT_CLEANUP_CONFIG" > "$config_path"
    echo "✅ Configuration file created at: $config_path"
    echo ""
    echo "You can customize:"
    echo "  - PR checking behavior"
    echo "  - Protected branch patterns"
    echo "  - UI preferences"
    echo "  - Pre-deletion cleanup commands"
    return 0
}

# Function to load configuration
load_config() {
    local repo_root="$1"
    local config_path="$repo_root/.worktree-cleanup-config"
    
    if [ -f "$config_path" ]; then
        source "$config_path"
        [ "$SHOW_DEBUG_INFO" = true ] && echo "Loaded configuration from: $config_path"
    fi
}

# Get GitHub repo info
get_github_repo() {
    if [ "$AUTO_DETECT_REPO" = false ]; then
        return
    fi
    
    local remote_url=$(git remote get-url origin 2>/dev/null)
    if [[ $remote_url =~ github.com[:/]([^/]+)/([^/]+)(\.git)?$ ]]; then
        echo "${BASH_REMATCH[1]}/${BASH_REMATCH[2]%.git}"
    elif [[ $remote_url =~ gitlab.com[:/]([^/]+)/([^/]+)(\.git)?$ ]]; then
        echo "${BASH_REMATCH[1]}/${BASH_REMATCH[2]%.git}"
    elif [[ $remote_url =~ bitbucket.org[:/]([^/]+)/([^/]+)(\.git)?$ ]]; then
        echo "${BASH_REMATCH[1]}/${BASH_REMATCH[2]%.git}"
    fi
}

# Get current user from git platform
get_current_user() {
    if command -v gh &> /dev/null; then
        gh api user --jq '.login' 2>/dev/null
    elif command -v glab &> /dev/null; then
        glab api user | jq -r '.username' 2>/dev/null
    else
        # Fallback to git config
        git config --get user.name 2>/dev/null
    fi
}

# Check if branch is protected
is_protected_branch() {
    local branch=$1
    
    for pattern in "${PROTECTED_PATTERNS[@]}"; do
        if [[ "$branch" =~ ^${pattern}$ ]]; then
            return 0
        fi
    done
    return 1
}

# Check if branch has a PR and if it's merged
check_pr_status() {
    local branch=$1
    local repo=$(get_github_repo)
    
    if [ "$CHECK_PR_STATUS" = false ]; then
        echo "SKIPPED|false"
        return
    fi
    
    if [ -z "$repo" ]; then
        echo "NO_REPO|false"
        return
    fi
    
    # Check for PR using GitHub CLI
    if [ "$USE_GITHUB_CLI" = true ] && command -v gh &> /dev/null; then
        [ "$SHOW_DEBUG_INFO" = true ] && echo "    DEBUG: Checking repo $repo for branch $branch" >&2
        
        # Check for PR with exact branch name
        local pr_info=$(gh pr list --repo "$repo" --head "$branch" --state all --json number,state,mergedAt --limit 1 2>/dev/null)
        [ "$SHOW_DEBUG_INFO" = true ] && echo "    DEBUG: Query result: $pr_info" >&2
        
        if [ -n "$pr_info" ] && [ "$pr_info" != "[]" ]; then
            local pr_number=$(echo "$pr_info" | jq -r '.[0].number // ""' 2>/dev/null)
            local pr_state=$(echo "$pr_info" | jq -r '.[0].state // ""' 2>/dev/null)
            local merged_at=$(echo "$pr_info" | jq -r '.[0].mergedAt // ""' 2>/dev/null)
            
            # Check if PR was merged
            if [ -n "$merged_at" ] && [ "$merged_at" != "null" ] && [ "$merged_at" != "" ]; then
                echo "PR #$pr_number (MERGED)|true"
            elif [ "$pr_state" = "OPEN" ]; then
                echo "PR #$pr_number (OPEN)|false"
            elif [ "$pr_state" = "CLOSED" ]; then
                echo "PR #$pr_number (CLOSED)|false"
            else
                echo "PR #$pr_number|false"
            fi
        else
            echo "NO PR|false"
        fi
    elif command -v glab &> /dev/null; then
        # GitLab CLI support
        local mr_info=$(glab mr list --source-branch="$branch" --json 2>/dev/null | jq '.[0]' 2>/dev/null)
        if [ -n "$mr_info" ] && [ "$mr_info" != "null" ]; then
            local mr_number=$(echo "$mr_info" | jq -r '.iid // ""')
            local mr_state=$(echo "$mr_info" | jq -r '.state // ""')
            
            if [ "$mr_state" = "merged" ]; then
                echo "MR !$mr_number (MERGED)|true"
            elif [ "$mr_state" = "opened" ]; then
                echo "MR !$mr_number (OPEN)|false"
            else
                echo "MR !$mr_number ($mr_state)|false"
            fi
        else
            echo "NO MR|false"
        fi
    else
        echo "NO CLI|false"
    fi
}

# Load worktree data
load_worktrees() {
    worktrees=()
    branches=()
    pr_statuses=()
    pr_merged=()
    selected=()
    worktree_paths=()
    
    echo -e "${YELLOW}Loading worktrees and checking PR statuses...${RESET}"
    
    # Get the main worktree info
    local main_worktree_path=""
    local main_branch=""
    
    # Parse git worktree list
    while IFS= read -r line; do
        if [[ $line =~ ^([^ ]+)[[:space:]]+([^ ]+)[[:space:]]+\[([^\]]+)\] ]]; then
            local path="${BASH_REMATCH[1]}"
            local commit="${BASH_REMATCH[2]}"
            local branch="${BASH_REMATCH[3]}"
            
            # Skip bare repositories
            if [[ $line =~ \(bare\) ]]; then
                continue
            fi
            
            local dir_name=$(basename "$path")
            worktree_paths+=("$path")
            
            # Check if this is a protected branch
            if is_protected_branch "$branch"; then
                worktrees+=("$dir_name (protected)")
                branches+=("$branch")
                pr_statuses+=("PROTECTED")
                pr_merged+=("false")
                selected+=("false")
            else
                worktrees+=("$dir_name")
                branches+=("$branch")
                
                # Check PR status
                if [ "$CHECK_PR_STATUS" = true ]; then
                    echo -e "  ${BLUE}Checking: $branch${RESET}"
                    local pr_result=$(check_pr_status "$branch")
                    local pr_status="${pr_result%|*}"
                    local is_merged="${pr_result#*|}"
                    
                    pr_statuses+=("$pr_status")
                    pr_merged+=("$is_merged")
                else
                    pr_statuses+=("NOT CHECKED")
                    pr_merged+=("false")
                fi
                
                # Auto-select merged if configured
                if [ "$AUTO_SELECT_MERGED" = true ] && [ "${pr_merged[-1]}" = "true" ]; then
                    selected+=("true")
                else
                    selected+=("false")
                fi
            fi
        fi
    done < <(git worktree list)
}

# Display the table
display_table() {
    clear
    echo -e "${BOLD}Git Worktree Cleanup Manager${RESET}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
    printf "%-3s %-35s %-30s %-25s %s\n" "[ ]" "WORKTREE" "BRANCH" "PR STATUS" "MERGED"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
    
    for i in "${!worktrees[@]}"; do
        local checkbox="[ ]"
        if [ "${selected[$i]}" = "true" ]; then
            checkbox="[X]"
        fi
        
        # Color coding
        local color=""
        local bg_color=""
        if [[ "${pr_statuses[$i]}" == "PROTECTED" ]]; then
            color=$MAGENTA
            bg_color='\033[45m'  # Magenta background
        elif [ "${pr_merged[$i]}" = "true" ]; then
            color=$GREEN
            bg_color='\033[42m'  # Green background
        elif [[ "${pr_statuses[$i]}" == "NO PR" ]]; then
            color=$YELLOW
            bg_color='\033[43m'  # Yellow background
        elif [[ "${pr_statuses[$i]}" =~ OPEN ]]; then
            color=$CYAN
            bg_color='\033[46m'  # Cyan background
        else
            bg_color='\033[47m'  # White background for default
        fi

        # Truncate long names for display
        local display_worktree="${worktrees[$i]:0:33}"
        local display_branch="${branches[$i]:0:28}"
        local display_status="${pr_statuses[$i]:0:23}"

        if [ "$i" -eq "$current_row" ]; then
            echo -e "${bg_color}\033[30m$(printf "%-3s %-35s %-30s %-25s %s" "$checkbox" "$display_worktree" "$display_branch" "$display_status" "${pr_merged[$i]}")${RESET}"
        else
            echo -e "${color}$(printf "%-3s %-35s %-30s %-25s %s" "$checkbox" "$display_worktree" "$display_branch" "$display_status" "${pr_merged[$i]}")${RESET}"
        fi
    done
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
    echo
    echo -e "${BOLD}Controls:${RESET}"
    echo "  ↑/↓ or j/k: Navigate    Space: Select/Deselect    d: Delete selected    r: Refresh"
    echo "  a: Select all eligible  m: Select merged          u: Unselect all       q: Quit"
    
    if [ -n "$EDITOR_COMMAND" ]; then
        echo "  o: Open in $EDITOR_COMMAND"
    fi
    
    echo
    
    # Status line
    local selected_count=0
    local merged_count=0
    for i in "${!selected[@]}"; do
        [ "${selected[$i]}" = "true" ] && ((selected_count++))
        [ "${pr_merged[$i]}" = "true" ] && ((merged_count++))
    done
    
    echo -e "${BOLD}Status:${RESET} Total: ${#worktrees[@]} | Selected: $selected_count | Merged: $merged_count"
    
    # Legend
    echo -e "${BOLD}Legend:${RESET} ${GREEN}●${RESET} Merged ${CYAN}●${RESET} Open PR ${YELLOW}●${RESET} No PR ${MAGENTA}●${RESET} Protected"
}

# Run pre-delete commands
run_pre_delete_commands() {
    local worktree_path=$1
    
    if [ ${#PRE_DELETE_COMMANDS[@]} -eq 0 ]; then
        return
    fi
    
    echo -e "${YELLOW}Running cleanup commands...${RESET}"
    cd "$worktree_path" 2>/dev/null || return
    
    for cmd in "${PRE_DELETE_COMMANDS[@]}"; do
        echo -e "  Running: $cmd"
        if eval "$cmd" 2>/dev/null; then
            echo -e "  ${GREEN}✓${RESET} Success"
        else
            echo -e "  ${YELLOW}⚠${RESET} Failed (continuing anyway)"
        fi
    done
    
    cd - > /dev/null 2>&1
}

# Delete worktree and branch
delete_worktree() {
    local worktree=$1
    local branch=$2
    local path=$3
    
    # Check if protected
    if is_protected_branch "$branch"; then
        echo -e "${RED}Cannot delete protected branch: $branch${RESET}"
        return 1
    fi
    
    # Run pre-delete commands
    run_pre_delete_commands "$path"
    
    # Remove worktree
    echo -e "${YELLOW}Removing worktree: $path${RESET}"
    if git worktree remove "$path" --force 2>/dev/null || git worktree remove "$path" 2>/dev/null; then
        echo -e "${GREEN}✓${RESET} Worktree removed"
        
        # Try to delete the branch
        echo -e "${YELLOW}Deleting branch: $branch${RESET}"
        if git branch -D "$branch" 2>/dev/null; then
            echo -e "${GREEN}✓${RESET} Branch deleted"
        else
            echo -e "${YELLOW}⚠${RESET} Could not delete branch (may be checked out elsewhere)"
        fi
        
        return 0
    else
        echo -e "${RED}✗${RESET} Failed to remove worktree"
        return 1
    fi
}

# Parse command line arguments (first pass for --init and --help)
NEED_INIT=false
SHOW_HELP=false
NO_PR_CHECK=false
AUTO_MERGED=false
DEBUG_MODE=false

for arg in "$@"; do
    case $arg in
        --init)
            NEED_INIT=true
            ;;
        -h|--help)
            SHOW_HELP=true
            ;;
        --no-pr-check)
            NO_PR_CHECK=true
            ;;
        --auto-merged)
            AUTO_MERGED=true
            ;;
        --debug)
            DEBUG_MODE=true
            ;;
    esac
done

# Show help if requested (doesn't need repo)
if [ "$SHOW_HELP" = true ]; then
    show_help
    exit 0
fi

# Check if in a git repository
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"
if [ -z "$REPO_ROOT" ]; then
    echo "Error: Not in a git repository"
    exit 1
fi

# Handle --init after we know the repo root
if [ "$NEED_INIT" = true ]; then
    init_config "$REPO_ROOT"
    exit $?
fi

# Apply command line overrides
[ "$NO_PR_CHECK" = true ] && CHECK_PR_STATUS=false
[ "$AUTO_MERGED" = true ] && AUTO_SELECT_MERGED=true
[ "$DEBUG_MODE" = true ] && SHOW_DEBUG_INFO=true

# Load configuration
load_config "$REPO_ROOT"

# Check for required tools
if [ "$CHECK_PR_STATUS" = true ] && [ "$USE_GITHUB_CLI" = true ]; then
    if ! command -v gh &> /dev/null; then
        echo -e "${YELLOW}Warning: GitHub CLI (gh) is not installed.${RESET}"
        echo "PR status checking will be limited."
        echo "Install with: brew install gh (macOS) or visit https://cli.github.com"
        echo ""
        echo "Press any key to continue without PR checking..."
        read -n 1 -s
        CHECK_PR_STATUS=false
    fi
fi

# Main interactive loop
current_row=0
load_worktrees

while true; do
    display_table
    
    # Read single character
    read -rsn1 key
    
    case "$key" in
        $'\x1b') # ESC sequence
            read -rsn2 key
            case "$key" in
                '[A') # Up arrow
                    ((current_row--))
                    [ $current_row -lt 0 ] && current_row=$((${#worktrees[@]} - 1))
                    ;;
                '[B') # Down arrow
                    ((current_row++))
                    [ $current_row -ge ${#worktrees[@]} ] && current_row=0
                    ;;
            esac
            ;;
        'k') # Up
            ((current_row--))
            [ $current_row -lt 0 ] && current_row=$((${#worktrees[@]} - 1))
            ;;
        'j') # Down
            ((current_row++))
            [ $current_row -ge ${#worktrees[@]} ] && current_row=0
            ;;
        ' '|'') # Space - toggle selection
            if [[ "${pr_statuses[$current_row]}" != "PROTECTED" ]]; then
                if [ "${selected[$current_row]}" = "true" ]; then
                    selected[$current_row]="false"
                else
                    selected[$current_row]="true"
                fi
            fi
            ;;
        'a') # Select all non-protected
            for i in "${!worktrees[@]}"; do
                if [[ "${pr_statuses[$i]}" != "PROTECTED" ]]; then
                    selected[$i]="true"
                fi
            done
            ;;
        'm') # Select all merged
            for i in "${!worktrees[@]}"; do
                if [ "${pr_merged[$i]}" = "true" ]; then
                    selected[$i]="true"
                fi
            done
            ;;
        'u') # Unselect all
            for i in "${!selected[@]}"; do
                selected[$i]="false"
            done
            ;;
        'r') # Refresh
            echo -e "${YELLOW}Refreshing...${RESET}"
            load_worktrees
            current_row=0
            ;;
        'o') # Open in editor
            if [ -n "$EDITOR_COMMAND" ] && [ "${selected[$current_row]}" = "true" ]; then
                $EDITOR_COMMAND "${worktree_paths[$current_row]}"
            fi
            ;;
        'd') # Delete selected
            # Collect selected worktrees
            local to_delete=()
            for i in "${!selected[@]}"; do
                if [ "${selected[$i]}" = "true" ] && [[ "${pr_statuses[$i]}" != "PROTECTED" ]]; then
                    to_delete+=($i)
                fi
            done
            
            if [ ${#to_delete[@]} -eq 0 ]; then
                echo -e "${YELLOW}No worktrees selected for deletion${RESET}"
                sleep 2
            else
                echo
                echo -e "${RED}${BOLD}About to delete ${#to_delete[@]} worktree(s):${RESET}"
                for i in "${to_delete[@]}"; do
                    echo -e "  ${RED}✗${RESET} ${worktrees[$i]} (${branches[$i]})"
                done
                echo
                
                if [ "$CONFIRM_DELETION" = true ]; then
                    echo -n "Are you sure? (y/N): "
                    read -n 1 confirm
                    echo
                else
                    confirm="y"
                fi
                
                if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
                    local success_count=0
                    for i in "${to_delete[@]}"; do
                        if delete_worktree "${worktrees[$i]}" "${branches[$i]}" "${worktree_paths[$i]}"; then
                            ((success_count++))
                        fi
                        echo
                    done
                    
                    echo -e "${GREEN}Deleted $success_count worktree(s)${RESET}"
                    echo "Press any key to continue..."
                    read -n 1 -s
                    
                    # Reload worktrees
                    load_worktrees
                    current_row=0
                fi
            fi
            ;;
        'q') # Quit
            echo -e "${GREEN}Exiting...${RESET}"
            if [ -n "$EXIT_TO_DIRECTORY" ]; then
                cd "$EXIT_TO_DIRECTORY" 2>/dev/null
            fi
            exit 0
            ;;
    esac
done